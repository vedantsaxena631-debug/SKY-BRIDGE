import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [mode, setMode] = useState<'DEMO' | 'LIVE'>('DEMO');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [devices, setDevices] = useState<DeviceNode[]>(INITIAL_DEVICES);
  const [events, setEvents] = useState<SystemEvent[]>(INITIAL_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [activeTransmission, setActiveTransmission] = useState<Message | null>(null);

  // New Design System Modes
  const [kioskMode, setKioskMode] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const [serialBridge, setSerialBridge] = useState<SerialBridgeState>({
    connected: false,
    port: '/dev/ttyUSB0',
    baudRate: 115200,
    statusMessage: 'Physical hardware disconnected. Running in isolated DEMO simulation mode.',
    reconnectAttempts: 0,
    isSimulated: true,
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
    if (currentUser.role !== 'admin') {
      alert('Action unauthorized: Only Administrators can toggle Live / Demo execution modes.');
      return;
    }
    const nextMode = mode === 'DEMO' ? 'LIVE' : 'DEMO';
    setMode(nextMode);

    const newAudit: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: currentUser.username,
      role: currentUser.role,
      action: nextMode === 'DEMO' ? 'DEMO_MODE_ENABLE' : 'LIVE_MODE_ENABLE',
      target: 'Execution Mode Toggle',
      metadata: { previous: mode, current: nextMode },
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    if (nextMode === 'LIVE') {
      setSerialBridge((prev) => ({
        ...prev,
        connected: false,
        isSimulated: false,
        statusMessage: 'Serial bridge port /dev/ttyUSB0 not detected. Connect ESP32 via USB.',
      }));
    } else {
      setSerialBridge((prev) => ({
        ...prev,
        connected: false,
        isSimulated: true,
        statusMessage: 'Demo simulation bridge active.',
      }));
    }
  };

  const connectSerial = (port = '/dev/ttyUSB0', baud = 115200) => {
    setSerialBridge({
      connected: true,
      port,
      baudRate: baud,
      statusMessage: `Connected to ESP32 LoRa Gateway on ${port} @ ${baud} baud.`,
      lastPacketTime: new Date().toLocaleTimeString(),
      reconnectAttempts: 0,
      isSimulated: mode === 'DEMO',
    });

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

  const disconnectSerial = () => {
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
