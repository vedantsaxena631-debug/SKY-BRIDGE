import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Bell,
  Sun,
  Moon,
  Search,
  Zap,
  User,
  Shield,
  CheckCheck,
  ExternalLink,
  Menu,
  X,
  Maximize2,
  Minimize2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { UserRole } from '../../types';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileSidebar: () => void;
  mobileSidebarOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
  onToggleMobileSidebar,
  mobileSidebarOpen,
}) => {
  const {
    currentUser,
    switchUserRole,
    theme,
    setTheme,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendTestPing,
    serialBridge,
    setActiveTab,
    mode,
    kioskMode,
    toggleKioskMode,
    focusMode,
    toggleFocusMode,
    hasActiveCritical,
    unacknowledgedCriticalCount,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [bellShaking, setBellShaking] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Single subtle shake when a new notification arrives
  React.useEffect(() => {
    if (unreadCount > 0) {
      setBellShaking(true);
      const timer = setTimeout(() => setBellShaking(false), 350);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleTestPing = async () => {
    setIsPinging(true);
    await sendTestPing();
    setTimeout(() => setIsPinging(false), 800);
  };

  const isLight = theme === 'light';

  return (
    <>
      <header
        className={`h-16 border-b transition-colors duration-200 sticky top-0 z-40 px-4 flex items-center justify-between no-print backdrop-blur-md ${
          hasActiveCritical
            ? isLight
              ? 'border-rose-500 bg-rose-50/90 text-rose-950'
              : 'border-rose-600/80 bg-rose-950/40 text-rose-100'
            : isLight
            ? 'border-[#DDE3EA] bg-[#F3F5F8]/95 text-[#0B1220]'
            : 'border-[#232B36] bg-[#070A0F]/95 text-[#E8EBEF]'
        }`}
      >
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                hasActiveCritical
                  ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              }`}
            >
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono font-bold tracking-tight text-lg group-hover:text-cyan-500 transition-colors ${
                    isLight ? 'text-[#0B1220]' : 'text-slate-100'
                  }`}
                >
                  SKYBRIDGE
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  v2.0
                </span>
              </div>
              <p className={`text-[11px] leading-none hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Emergency Drone Relay Net
              </p>
            </div>
          </div>

          {/* Global Subsystem Connectivity Indicators */}
          <div
            className={`hidden xl:flex items-center gap-2 ml-6 text-xs font-mono border-l pl-4 ${
              isLight ? 'border-[#DDE3EA]' : 'border-slate-800'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                isLight ? 'bg-white border-[#DDE3EA] text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>API: OK</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                isLight ? 'bg-white border-[#DDE3EA] text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>DB: OK</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                isLight ? 'bg-white border-[#DDE3EA] text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SOCKET: OK</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                serialBridge.connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serialBridge.connected ? 'bg-emerald-500' : 'bg-purple-500 animate-pulse'
                }`}
              />
              <span>SERIAL: {serialBridge.connected ? 'USB' : 'DEMO'}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Incident / Alert Mode Callout (Section 3.3) */}
          {hasActiveCritical && (
            <button
              onClick={() => setActiveTab('live-comm')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white animate-pulse transition-all shadow-[0_0_12px_rgba(239,68,68,0.5)]"
              title="Jump to Unacknowledged Critical Alert"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{unacknowledgedCriticalCount} CRITICAL ALERT</span>
            </button>
          )}

          {/* Presentation / Kiosk Mode Toggle */}
          <button
            onClick={toggleKioskMode}
            className={`p-2 rounded-lg transition-colors ${
              kioskMode
                ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/40'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
            }`}
            title={kioskMode ? 'Exit Presentation Mode (Esc)' : 'Enter Presentation / Kiosk Mode'}
          >
            {kioskMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setShowShortcuts(true)}
            className={`p-2 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
            }`}
            title="Keyboard Shortcuts Cheat Sheet (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-[#DDE3EA] text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Command...</span>
            <kbd
              className={`hidden md:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
              }`}
            >
              ⌘K
            </kbd>
          </button>

          {/* Quick Send Test Ping Button */}
          <button
            id="send-test-ping-topbar"
            onClick={handleTestPing}
            disabled={isPinging || currentUser.role === 'viewer'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send diagnostic test ping across drone relay"
          >
            <Zap className={`w-3.5 h-3.5 ${isPinging ? 'animate-bounce text-cyan-500' : ''}`} />
            <span>Test Ping</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell with Single Subtle Shake */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg transition-transform duration-150 relative ${
                bellShaking ? 'rotate-6' : ''
              } ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center font-mono shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl p-4 z-50 border ${
                  isLight ? 'bg-white border-[#DDE3EA] text-[#0B1220]' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-3 border-b ${
                    isLight ? 'border-[#EDEFF2]' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">System Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div
                  className={`max-h-72 overflow-y-auto divide-y my-2 ${
                    isLight ? 'divide-[#EDEFF2]' : 'divide-slate-800/60'
                  }`}
                >
                  {notifications.length === 0 ? (
                    <p className={`text-xs py-6 text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      No notifications recorded.
                    </p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`py-2.5 px-1 cursor-pointer transition-colors ${
                          !n.read
                            ? isLight
                              ? 'bg-slate-50'
                              : 'bg-slate-800/30'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                              n.severity === 'critical'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                                : n.severity === 'warning'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {n.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-xs font-medium mt-1">{n.title}</p>
                        <p className={`text-[11px] line-clamp-2 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className={`pt-2 border-t text-center ${isLight ? 'border-[#EDEFF2]' : 'border-slate-800'}`}>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab('notifications');
                    }}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    Open Notification Center →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Context & Role Switcher (RBAC) */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors ${
                isLight ? 'bg-white border-[#DDE3EA] hover:bg-slate-50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500 flex items-center justify-center text-cyan-600 dark:text-cyan-300 text-xs font-bold">
                {currentUser.role[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className={`font-medium ${isLight ? 'text-[#0B1220]' : 'text-slate-200'}`}>
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono text-cyan-500 uppercase">{currentUser.role}</div>
              </div>
            </button>

            {/* User Role Switcher Dropdown */}
            {showUserDropdown && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl p-2 z-50 border ${
                  isLight ? 'bg-white border-[#DDE3EA] text-[#0B1220]' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              >
                <div className={`px-3 py-2 border-b ${isLight ? 'border-[#EDEFF2]' : 'border-slate-800'}`}>
                  <div className="text-xs font-semibold">{currentUser.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{currentUser.callsign}</div>
                  <div className="text-[10px] text-cyan-500 uppercase font-mono mt-0.5">
                    Role: {currentUser.role}
                  </div>
                </div>

                <div className="py-2 text-xs">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400">
                    Switch Active Role (RBAC Demo):
                  </div>
                  {(['admin', 'operator', 'viewer'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchUserRole(r);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between capitalize transition-colors ${
                        currentUser.role === r
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-semibold'
                          : isLight
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{r}</span>
                      {currentUser.role === r && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                    </button>
                  ))}
                </div>

                <div className={`border-t pt-1 ${isLight ? 'border-[#EDEFF2]' : 'border-slate-800'}`}>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${
                      isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Account Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
};
