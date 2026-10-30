import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { Message, MessagePriority, NodeId } from '../types';

const NAMES: Record<NodeId, string> = {
  TEAM_A: 'Team A',
  DRONE_RELAY: 'Relay',
  TEAM_B: 'Team B',
};

const PRIORITIES: { id: MessagePriority; label: string }[] = [
  { id: 'ROUTINE', label: 'Normal' },
  { id: 'URGENT', label: 'Urgent' },
  { id: 'CRITICAL', label: 'Emergency' },
];

// Quick messages for common situations
const QUICK = ['Are you safe?', 'We need help.', 'We are safe.', 'We need supplies.'];

const DEVICE_LABEL: Record<string, string> = {
  ONLINE: 'Online',
  STANDBY: 'Standby',
  OFFLINE: 'Offline',
};

// Plain words for every status the system can report
const STATUS_LABEL: Record<string, string> = {
  QUEUED: 'Sending',
  SENT_TO_BRIDGE: 'Sending',
  RELAYED: 'Relayed',
  DELIVERED: 'Delivered',
  ACKNOWLEDGED: 'Delivered',
  FAILED_NO_ACK: 'Not delivered',
  FAILED: 'Failed',
};

export function Home() {
  const { messages, devices, sendMessage, mode, currentUser } = useApp();
  const { logout } = useAuth();

  // Operators send from their own team. Admins default to Team A.
  const from: NodeId = currentUser?.team === 'B' ? 'TEAM_B' : 'TEAM_A';
  const targets = (Object.keys(NAMES) as NodeId[]).filter((id) => id !== from);

  const [to, setTo] = useState<NodeId>(targets[0]);
  const [priority, setPriority] = useState<MessagePriority>('ROUTINE');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const isDemo = mode === 'DEMO';
  const recent = messages.slice(0, 8);
  const target = targets.includes(to) ? to : targets[0];

  async function send() {
    if (busy) return; // stop duplicate submissions
    const clean = text.trim();
    if (!clean) return;

    setBusy(true);
    setError('');
    setNote('');
    try {
      const sent: Message = await sendMessage(from, target, clean, priority, false);
      setText('');
      setNote(
        sent.isDemo
          ? 'Demo: saved here only. Nothing was sent by radio.'
          : `Status: ${STATUS_LABEL[sent.status] ?? sent.status}`
      );
    } catch (err: any) {
      // The text stays so the operator can try again
      setError(err?.message || 'Could not send. Your message is still here.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ios-app">
      <header className="ios-nav">
        <button type="button" className="ios-link" onClick={() => logout()}>
          Sign out
        </button>
        <span className="ios-nav-title">SkyBridge</span>
        <span className={isDemo ? 'ios-pill demo' : 'ios-pill live'}>{isDemo ? 'Demo' : 'Live'}</span>
      </header>

      <main className="ios-page">
        <h1 className="ios-large">Messages</h1>
        {isDemo && <p className="ios-note">Demo Mode. Nothing is sent by radio.</p>}

        <h2 className="ios-section">Network</h2>
        <section className="ios-group" aria-label="Network status">
          {devices.map((d) => (
            <div className="ios-row" key={d.id}>
              <span>{NAMES[d.id] ?? d.name}</span>
              <span className={`ios-status ${d.status.toLowerCase()}`}>
                {DEVICE_LABEL[d.status] ?? d.status}
              </span>
            </div>
          ))}
        </section>

        <h2 className="ios-section">New message</h2>
        <section className="ios-group" aria-label="Compose message">
          <div className="ios-row">
            <span>To</span>
          </div>
          <div className="ios-seg" role="group" aria-label="Send to">
            {targets.map((id) => (
              <button key={id} type="button" aria-pressed={target === id} onClick={() => setTo(id)}>
                {NAMES[id]}
              </button>
            ))}
          </div>

          <div className="ios-row">
            <span>Priority</span>
          </div>
          <div className="ios-seg" role="group" aria-label="Priority">
            {PRIORITIES.map((p) => (
              <button key={p.id} type="button" aria-pressed={priority === p.id} onClick={() => setPriority(p.id)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="ios-chips">
            {QUICK.map((q) => (
              <button key={q} type="button" className="ios-chip" onClick={() => setText(q)}>
                {q}
              </button>
            ))}
          </div>

          <textarea
            className="ios-input"
            rows={3}
            maxLength={280}
            placeholder="Type a message"
            aria-label="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            type="button"
            className={priority === 'CRITICAL' ? 'ios-btn danger' : 'ios-btn primary'}
            disabled={busy || !text.trim()}
            onClick={send}
          >
            {busy ? 'Sending…' : `Send to ${NAMES[target]}`}
          </button>

          {error && (
            <p role="alert" className="ios-error">
              {error}
            </p>
          )}
          {note && (
            <p role="status" className="ios-note">
              {note}
            </p>
          )}
        </section>

        <h2 className="ios-section">Recent</h2>
        <section className="ios-group" aria-label="Recent messages">
          {recent.length === 0 && <div className="ios-row muted">No messages yet.</div>}
          {recent.map((m) => (
            <div className="ios-msg" key={m.id}>
              <div className="ios-msg-top">
                <strong>
                  {NAMES[m.from]} to {NAMES[m.to]}
                </strong>
                <span className="ios-time">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p>{m.payload}</p>
              <span className={`ios-status ${m.status.toLowerCase()}`}>
                {STATUS_LABEL[m.status] ?? m.status}
                {m.isDemo ? ' (demo)' : ''}
              </span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Home;
