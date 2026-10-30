import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import {
  AuditLogEntry,
  DeviceNode,
  Message,
  MessagePriority,
  NodeId,
  NotificationItem,
  SerialBridgeState,
  SystemEvent,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_DEVICES,
  INITIAL_EVENTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../data/initialData';
import { demoSimulator } from '../services/demoSimulator';
import { audioAlert } from '../utils/audioAlert';

function mapDocToMessage(doc: any): Message {
  const from: NodeId = doc.from === 'A' ? 'TEAM_A' : doc.from === 'B' ? 'TEAM_B' : (doc.from || 'TEAM_A');
  const to: NodeId = doc.to === 'A' ? 'TEAM_A' : doc.to === 'B' ? 'TEAM_B' : (doc.to || 'TEAM_B');
  const rawStatus = (doc.status || 'queued').toLowerCase();
  let status: any = 'QUEUED';
  if (rawStatus === 'delivered') status = 'DELIVERED';
  else if (rawStatus === 'relayed') status = 'RELAYED';
  else if (rawStatus === 'sent_to_bridge') status = 'TRANSMITTING';
  else if (rawStatus === 'failed') status = 'FAILED';

  const rawPrio = (doc.priority || 'routine').toLowerCase();
  const priority: MessagePriority =
    rawPrio.includes('crit') || rawPrio.includes('emerg')
      ? 'CRITICAL'
      : rawPrio.includes('urg')
      ? 'URGENT'
      : 'ROUTINE';

  return {
    id: String(doc._id || doc.id || `msg_${doc.msgID}`),
    msgID: doc.msgID,
    from,
    to,
    payload: doc.payload || '',
    priority,
    status,
    timestamp: new Date(doc.timestamp || Date.now()).toLocaleTimeString(),
    relayCount: doc.relayCount ?? 0,
    ackReceivedAt: doc.ackReceivedAt ? new Date(doc.ackReceivedAt).toLocaleTimeString() : undefined,
    isDemo: Boolean(doc.isDemo),
    isTestPing: doc.type === 'PING',
    hops: [
      {
        node: from,
        action: status === 'DELIVERED' ? 'Delivered with Verified LoRa ACK' : 'Message Transmitted / Relayed',
        timestamp: new Date(doc.timestamp || Date.now()).toLocaleTimeString(),
      },
    ],
  };
}

interface AppContextType {
  mode: 'DEMO' | 'LIVE';
  theme: 'dark' | 'light';
  currentUser: User;
  users: User[];
  messages: Message[];
  devices: DeviceNode[];
  events: SystemEvent[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  serialBridge: SerialBridgeState;
  soundEnabled: boolean;
  reducedMotion: boolean;
  activeTransmission: Message | null;
  activeTab: string;
  kioskMode: boolean;
  focusMode: boolean;
  density: 'comfortable' | 'compact';
  highContrast: boolean;
  hasActiveCritical: boolean;
  unacknowledgedCriticalCount: number;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setCurrentUser: (user: User) => void;
  toggleDemoMode: () => void;
  toggleKioskMode: () => void;
  toggleFocusMode: () => void;
  setDensity: (d: 'comfortable' | 'compact') => void;
  toggleHighContrast: () => void;
  switchUserRole: (role: UserRole) => void;
  sendMessage: (
    from: NodeId,
    to: NodeId,
    payload: string,
    priority: MessagePriority,
    isTestPing?: boolean
  ) => Promise<Message>;
  resendMessage: (messageId: string) => Promise<void>;
  sendTestPing: (from?: NodeId, to?: NodeId) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  connectSerial: (port?: string, baud?: number) => void;
  disconnectSerial: () => void;
  exportMessagesCsv: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const sessionMode = auth.mode === 'live' ? 'LIVE' : 'DEMO';

  const [mode, setMode] = useState<'DEMO' | 'LIVE'>(sessionMode);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Derive currentUser authoritatively from AuthContext
  const getAuthUser = (): User => {
    if (!auth.user) return INITIAL_USERS[0];
    const match = INITIAL_USERS.find(
      (u) => u.username.toLowerCase() === auth.user?.username.toLowerCase()
    );
    if (match) return match;
    return {
      id: auth.user.id,
      username: auth.user.username,
      name: auth.user.name || auth.user.username,
      role: auth.user.role as UserRole,
      callsign: auth.user.callsign || auth.user.username.toUpperCase(),
      team: (auth.user.team as any) || undefined,
      avatar: auth.user.username.slice(0, 2).toUpperCase(),
    };
  };

  const [currentUser, setCurrentUser] = useState<User>(getAuthUser());

  // Check 13: In Live Mode with all hardware off: Nodes offline, feed empty, stats zero
  const [messages, setMessages] = useState<Message[]>(
    sessionMode === 'LIVE' ? [] : INITIAL_MESSAGES
  );
  const [devices, setDevices] = useState<DeviceNode[]>(
    sessionMode === 'LIVE'
      ? INITIAL_DEVICES.map((d) => ({ ...d, status: 'offline', linkQuality: 0 }))
      : INITIAL_DEVICES
  );
  const [events, setEvents] = useState<SystemEvent[]>(
    sessionMode === 'LIVE'
      ? [{ id: 'evt_init', timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', sourceNode: 'DRONE', message: 'Live Mode Gateway initialized. Awaiting USB hardware telemetry.' }]
      : INITIAL_EVENTS
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [activeTransmission, setActiveTransmission] = useState<Message | null>(null);

  // Sync mode and user whenever auth changes
  useEffect(() => {
    const nextMode = auth.mode === 'live' ? 'LIVE' : 'DEMO';
    setMode(nextMode);
    setCurrentUser(getAuthUser());
    if (nextMode === 'LIVE') {
      setMessages([]);
      setDevices(INITIAL_DEVICES.map((d) => ({ ...d, status: 'offline', linkQuality: 0 })));
      setSerialBridge({
        connected: false,
        port: 'COM8',
        baudRate: 115200,
        statusMessage: 'Connecting to physical LoRa serial gateway...',
        reconnectAttempts: 0,
        isSimulated: false,
      });

      if (auth.token) {
        api.get('/messages').then((msgs: any) => {
          if (Array.isArray(msgs)) setMessages(msgs.map(mapDocToMessage));
        }).catch(() => {});

        api.get('/serial/status').then((s: any) => {
          if (s) {
            setSerialBridge((prev) => ({
              ...prev,
              connected: Boolean(s.connected),
              port: s.port || prev.port || 'COM8',
              baudRate: s.baudRate || prev.baudRate,
              statusMessage: s.connected
                ? `Connected to ESP32 LoRa Gateway on ${s.port} @ ${s.baudRate} baud.`
                : 'Physical hardware disconnected.',
              isSimulated: false,
            }));
          }
        }).catch(() => {});
      }
    } else {
      setMessages(INITIAL_MESSAGES);
      setDevices(INITIAL_DEVICES);
      setSerialBridge({
        connected: false,
        port: 'COM8',
        baudRate: 115200,
        statusMessage: 'Demo simulation bridge active. Telemetry generated in-memory.',
        reconnectAttempts: 0,
        isSimulated: true,
      });
    }
  }, [auth.mode, auth.token, auth.user?.username]);

  // Real-time Socket.IO Connection for Hardware / Live Telemetry
  useEffect(() => {
    const isLive = auth.mode === 'live';
    const namespace = isLive ? '/live' : '/demo';
    const token = auth.token;

    if (!token && isLive) return;

    const socketUrl = window.location.origin;
    const socket = io(`${socketUrl}${namespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('serial:status', (s: any) => {
      setSerialBridge((prev) => ({
        ...prev,
        connected: Boolean(s?.connected),
        port: s?.port || prev.port || 'COM8',
        baudRate: s?.baudRate || prev.baudRate,
        statusMessage: s?.connected
          ? `Connected to ESP32 LoRa Gateway on ${s.port} @ ${s.baudRate} baud.`
          : s?.lastError || 'Physical hardware disconnected.',
        isSimulated: !isLive,
      }));
    });

    socket.on('message:received', (doc: any) => {
      const msg = mapDocToMessage(doc);
      setMessages((prev) => [msg, ...prev.filter((m) => m.msgID !== msg.msgID)]);
      if (soundEnabled) {
        if (msg.priority === 'CRITICAL') {
          audioAlert.playCriticalAlert();
        } else {
          audioAlert.playAckPing();
        }
      }
    });

    socket.on('message:delivered', (doc: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.msgID === doc.msgID
            ? {
                ...m,
                status: 'DELIVERED',
                ackReceivedAt: new Date(doc.ackReceivedAt || Date.now()).toLocaleTimeString(),
                hops: [
                  ...m.hops,
                  {
                    node: m.to,
                    action: 'ACK Confirmed by Physical SX1278 Transceiver',
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ],
              }
            : m
        )
      );
      if (soundEnabled) {
        audioAlert.playAckPing();
      }
    });

    socket.on('message:relayed', (doc: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.msgID === doc.msgID
            ? {
                ...m,
                status: 'RELAYED',
                relayCount: doc.relayCount ?? (m.relayCount + 1),
              }
            : m
        )
      );
    });

    socket.on('message:failed', (doc: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.msgID === doc.msgID
            ? {
                ...m,
                status: 'FAILED',
                hops: [
                  ...m.hops,
                  {
                    node: m.from,
                    action: `Transmission Failed: ${doc.failureReason || 'No ACK received'}`,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ],
              }
            : m
        )
      );
    });

    socket.on('device:online', (dev: any) => {
      const devId: NodeId = dev.deviceId === 'A' ? 'TEAM_A' : dev.deviceId === 'B' ? 'TEAM_B' : 'DRONE_RELAY';
      setDevices((prev) =>
        prev.map((d) =>
          d.id === devId
            ? {
                ...d,
                status: 'online',
                lastSeen: 'Just now',
                battery: dev.batteryVolts ? `${dev.batteryVolts.toFixed(1)}V` : d.battery,
              }
            : d
        )
      );
    });

    socket.on('device:offline', (dev: any) => {
      const devId: NodeId = dev.deviceId === 'A' ? 'TEAM_A' : dev.deviceId === 'B' ? 'TEAM_B' : 'DRONE_RELAY';
      setDevices((prev) =>
        prev.map((d) => (d.id === devId ? { ...d, status: 'offline' } : d))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [auth.mode, auth.token, soundEnabled]);

  // New Design System Modes
  const [kioskMode, setKioskMode] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const [serialBridge, setSerialBridge] = useState<SerialBridgeState>({
    connected: false,
    port: '/dev/ttyUSB0',
    baudRate: 115200,
    statusMessage:
      sessionMode === 'LIVE'
        ? 'Live mode active. Physical hardware disconnected.'
        : 'Demo simulation bridge active.',
    reconnectAttempts: 0,
    isSimulated: sessionMode === 'DEMO',
  });

  // Calculate real unacknowledged critical messages (Incident / Alert Mode trigger)
  const unacknowledgedCritical = messages.filter(
    (m) => m.priority === 'CRITICAL' && m.status !== 'ACKNOWLEDGED'
  );
  const hasActiveCritical = unacknowledgedCritical.length > 0;
  const unacknowledgedCriticalCount = unacknowledgedCritical.length;

  // Apply theme and contrast attributes to html/body elements
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    root.setAttribute('data-density', density);
    document.body.setAttribute('data-demo-mode', String(mode === 'DEMO'));

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, highContrast, density, mode]);

  // Handle system motion preference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
    }
  }, []);

  // Kiosk mode auto-rotation (18 seconds between Overview, Live Comm, and Statistics)
  useEffect(() => {
    if (!kioskMode) return;

    const rotationTabs = ['overview', 'live-comm', 'stats'];
    const timer = setInterval(() => {
      setActiveTab((curr) => {
        const nextIdx = (rotationTabs.indexOf(curr) + 1) % rotationTabs.length;
        return rotationTabs[nextIdx];
      });
    }, 18000);

    return () => clearInterval(timer);
  }, [kioskMode]);

  // Handle Escape key to exit Kiosk Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && kioskMode) {
        setKioskMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [kioskMode]);

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
  };

  const toggleKioskMode = () => {
    setKioskMode((prev) => !prev);
  };

  const toggleFocusMode = () => {
    setFocusMode((prev) => !prev);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const switchUserRole = (role: UserRole) => {
    const found = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(found);
    const newAudit: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: found.username,
      role: found.role,
      action: 'ROLE_SWITCH',
      target: `Switched active operator context to ${found.name} (${role.toUpperCase()})`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const toggleDemoMode = () => {
    // Mode is immutable in the session token. Switching modes means signing out and back in
    const targetMode = mode === 'DEMO' ? 'live' : 'demo';
    auth.switchModeViaLogout(targetMode);
  };

  const connectSerial = async (port = 'COM8', baud = 115200) => {
    try {
      const res = await api.post('/serial/connect', { port, baudRate: baud });
      if (res?.status) {
        setSerialBridge({
          connected: Boolean(res.status.connected),
          port: res.status.port || port,
          baudRate: res.status.baudRate || baud,
          statusMessage: `Connected to ESP32 LoRa Gateway on ${res.status.port || port} @ ${res.status.baudRate || baud} baud.`,
          lastPacketTime: new Date().toLocaleTimeString(),
          reconnectAttempts: 0,
          isSimulated: mode === 'DEMO',
        });
      }
    } catch (err: any) {
      console.warn('[serial] connect API error:', err.message);
      setSerialBridge((prev) => ({
        ...prev,
        connected: false,
        statusMessage: `Could not connect to ${port}: ${err.message}`,
      }));
    }

    const newAudit: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: currentUser.username,
      role: currentUser.role,
      action: 'SERIAL_CONNECT',
      target: port,
      metadata: { baudRate: baud, mode },
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const disconnectSerial = async () => {
    try {
      await api.post('/serial/disconnect');
    } catch (err: any) {
      console.warn('[serial] disconnect API error:', err.message);
    }

    setSerialBridge((prev) => ({
      ...prev,
      connected: false,
      statusMessage: 'Serial connection closed by user.',
    }));

    const newAudit: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: currentUser.username,
      role: currentUser.role,
      action: 'SERIAL_DISCONNECT',
      target: serialBridge.port,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const sendMessage = useCallback(
    async (
      from: NodeId,
      to: NodeId,
      payload: string,
      priority: MessagePriority,
      isTestPing = false
    ): Promise<Message> => {
      const msgID = demoSimulator.getNextMsgId();
      const nowStr = new Date().toLocaleTimeString();

      const newMsg: Message = {
        id: `msg_${Date.now()}_${msgID}`,
        msgID,
        from,
        to,
        payload,
        priority,
        status: 'QUEUED',
        timestamp: nowStr,
        relayCount: 0,
        isDemo: mode === 'DEMO',
        isTestPing,
        hops: [
          {
            node: from,
            action: isTestPing ? 'Test Ping Initiated' : 'Message Queued for LoRa Transfer',
            timestamp: nowStr,
          },
        ],
      };

      // Map to backend wire format: 'TEAM_A' -> 'A', 'TEAM_B' -> 'B'
      const backendFrom = from === 'TEAM_A' ? 'A' : from === 'TEAM_B' ? 'B' : from;
      const backendTo = to === 'TEAM_A' ? 'A' : to === 'TEAM_B' ? 'B' : to;

      try {
        await api.post('/messages', {
          from: backendFrom,
          to: backendTo,
          payload,
          priority: priority.toLowerCase(),
          type: isTestPing ? 'PING' : 'MSG',
        });
      } catch (err: any) {
        if (mode === 'LIVE') {
          // Check 12: Send with cable unplugged: message stored failed, never delivered
          const failedMsg: Message = {
            ...newMsg,
            status: 'FAILED',
            hops: [
              ...newMsg.hops,
              {
                node: from,
                action: `Failed: ${err.message || 'Serial bridge not connected'}`,
                timestamp: nowStr,
              },
            ],
          };
          setMessages((prev) => [failedMsg, ...prev]);
          const failureNotif: NotificationItem = {
            id: `notif_fail_${Date.now()}`,
            title: 'Live Transmission Failed',
            message: `Could not transmit to ${to}: ${err.message || 'Serial bridge disconnected.'}`,
            severity: 'critical',
            timestamp: nowStr,
            read: false,
            relatedMsgId: msgID,
            isDemo: false,
          };
          setNotifications((prev) => [failureNotif, ...prev]);
          throw err;
        }
      }

      setMessages((prev) => [newMsg, ...prev]);
      setActiveTransmission(newMsg);

      // Audit Log
      const audit: AuditLogEntry = {
        id: `aud_${Date.now()}`,
        timestamp: nowStr,
        actor: currentUser.username,
        role: currentUser.role,
        action: isTestPing ? 'SEND_TEST_PING' : 'SEND_MESSAGE',
        target: `${from} -> ${to}`,
        metadata: { msgID, payload, priority, isDemo: mode === 'DEMO' },
      };
      setAuditLogs((prev) => [audit, ...prev]);

      // Sound notification for critical messages
      if (soundEnabled && priority === 'CRITICAL' && !isTestPing) {
        audioAlert.playCriticalAlert();
      }

      // Add notification
      if (!isTestPing) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}`,
          title: priority === 'CRITICAL' ? 'CRITICAL Priority Alert' : 'Message Dispatched',
          message: `${from} -> ${to}: "${payload.slice(0, 45)}${payload.length > 45 ? '...' : ''}"`,
          severity: priority === 'CRITICAL' ? 'critical' : priority === 'URGENT' ? 'warning' : 'info',
          timestamp: nowStr,
          read: false,
          relatedMsgId: msgID,
          isDemo: mode === 'DEMO',
        };
        setNotifications((prev) => [notif, ...prev]);
      }

      // Run simulation hop pipeline
      demoSimulator.simulateHopTransmission(newMsg, {
        onMessageUpdate: (updatedMsg) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
          setActiveTransmission(updatedMsg);
        },
        onEvent: (event) => {
          setEvents((prev) => [event, ...prev]);
        },
        onAckReceived: (ackedMsg) => {
          if (soundEnabled) {
            audioAlert.playAckPing();
          }
          setTimeout(() => {
            setActiveTransmission((curr) => (curr?.id === ackedMsg.id ? null : curr));
          }, 3000);
        },
      });

      return newMsg;
    },
    [currentUser, mode, soundEnabled]
  );

  const resendMessage = async (messageId: string) => {
    const existing = messages.find((m) => m.id === messageId);
    if (!existing) return;
    await sendMessage(
      existing.from,
      existing.to,
      existing.payload,
      existing.priority,
      existing.isTestPing
    );
  };

  const sendTestPing = async (from: NodeId = 'TEAM_A', to: NodeId = 'TEAM_B') => {
    await sendMessage(from, to, 'PING // LORA DIAGNOSTIC PROBE', 'ROUTINE', true);
  };

  const exportMessagesCsv = () => {
    const headers = ['Timestamp', 'Message ID', 'From', 'To', 'Payload', 'Priority', 'Status', 'Relay Count', 'ACK Received', 'Is Demo'];
    const rows = messages.map((m) => [
      `"${m.timestamp}"`,
      m.msgID,
      m.from,
      m.to,
      `"${m.payload.replace(/"/g, '""')}"`,
      m.priority,
      m.status,
      m.relayCount,
      `"${m.ackReceivedAt || 'N/A'}"`,
      m.isDemo ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `skybridge_messages_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        theme,
        currentUser,
        users: INITIAL_USERS,
        messages,
        devices,
        events,
        notifications,
        auditLogs,
        serialBridge,
        soundEnabled,
        reducedMotion,
        activeTransmission,
        activeTab,
        kioskMode,
        focusMode,
        density,
        highContrast,
        hasActiveCritical,
        unacknowledgedCriticalCount,
        setActiveTab,
        setTheme,
        setSoundEnabled,
        setReducedMotion,
        setCurrentUser,
        toggleDemoMode,
        toggleKioskMode,
        toggleFocusMode,
        setDensity,
        toggleHighContrast,
        switchUserRole,
        sendMessage,
        resendMessage,
        sendTestPing,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        connectSerial,
        disconnectSerial,
        exportMessagesCsv,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
