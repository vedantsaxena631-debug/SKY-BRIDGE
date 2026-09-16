import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PREDEFINED_MESSAGES } from '../../data/initialData';
import { MessagePriority, NodeId } from '../../types';
import {
  Send,
  Radio,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

const MAX_PAYLOAD_BYTES = 220; // Physical LoRa SX1278 buffer limit

export const SendMessageView: React.FC = () => {
  const { sendMessage, sendTestPing, currentUser, mode, activeTransmission } = useApp();

  const [from, setFrom] = useState<NodeId>('TEAM_A');
  const [to, setTo] = useState<NodeId>('TEAM_B');
  const [payload, setPayload] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('ROUTINE');
  const [isSending, setIsSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Compute UTF-8 byte count
  const byteLength = new TextEncoder().encode(payload).length;
  const isOverLimit = byteLength > MAX_PAYLOAD_BYTES;

  const handleSelectTemplate = (msg: string) => {
    setPayload(msg);
    if (msg.includes('VICTIM') || msg.includes('HELP') || msg.includes('CRITICAL')) {
      setPriority('CRITICAL');
    } else if (msg.includes('LOCATION') || msg.includes('SECTOR')) {
      setPriority('URGENT');
    } else {
      setPriority('ROUTINE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.trim() || isOverLimit || isSending) return;

    if (currentUser.role === 'viewer') {
      alert('Unauthorized: Observers / Viewers have read-only privileges. Switch to Operator or Admin role in top bar.');
      return;
    }

    setIsSending(true);
    setStatusFeedback('Buffering payload to serial bridge...');

    try {
      await sendMessage(from, to, payload.trim(), priority, false);
      setStatusFeedback('Transmitted to Drone Relay. Awaiting store-and-forward ACK...');
      setPayload('');
      setTimeout(() => {
        setIsSending(false);
        setStatusFeedback(null);
      }, 3500);
    } catch (err) {
      setIsSending(false);
      setStatusFeedback('Transmission error.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              SEND EMERGENCY MESSAGE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Encode packets over 433MHz LoRa link via drone store-and-forward repeater.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => sendTestPing(from, to)}
            disabled={currentUser.role === 'viewer'}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Send Self-Test Ping</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          {/* Source and Destination Routing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                Origin Station (FROM)
              </label>
              <select
                value={from}
                onChange={(e) => {
                  const val = e.target.value as NodeId;
                  setFrom(val);
                  if (val === to) {
                    setTo(val === 'TEAM_A' ? 'TEAM_B' : 'TEAM_A');
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="TEAM_A">TEAM A — Ground Base Alpha</option>
                <option value="TEAM_B">TEAM B — Search Extraction Bravo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                Destination Station (TO)
              </label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value as NodeId)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="TEAM_B" disabled={from === 'TEAM_B'}>
                  TEAM B — Search Extraction Bravo
                </option>
                <option value="TEAM_A" disabled={from === 'TEAM_A'}>
                  TEAM A — Ground Base Alpha
                </option>
              </select>
            </div>
          </div>

          {/* Predefined Emergency Templates */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2 flex items-center justify-between">
              <span>Standard Emergency Templates</span>
              <span className="text-[11px] text-slate-500 lowercase font-normal">Click to insert</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_MESSAGES.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono transition-all"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Textarea & Live Byte Counter (Physical constraint) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">
                Custom Message Payload
              </label>
              <div
                className={`text-xs font-mono ${
                  isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-400'
                }`}
              >
                {byteLength} / {MAX_PAYLOAD_BYTES} bytes
                {isOverLimit && ' (Exceeds LoRa SX1278 packet buffer!)'}
              </div>
            </div>

            <textarea
              rows={4}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="Type tactical report or emergency message..."
              className={`w-full bg-slate-950 rounded-lg p-3 text-sm text-slate-200 font-mono border focus:outline-none transition-colors ${
                isOverLimit ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-cyan-500'
              }`}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              SX1278 payload constraint: Enforced ~220 bytes max for single-packet non-fragmented LoRa transmission.
            </p>
          </div>

          {/* Operator-assigned Priority */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
              Operator-Assigned Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['ROUTINE', 'URGENT', 'CRITICAL'] as MessagePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-3 rounded-lg border text-xs font-mono font-bold transition-all text-center ${
                    priority === p
                      ? p === 'CRITICAL'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                        : p === 'URGENT'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="uppercase">{p}</div>
                  <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                    {p === 'CRITICAL' ? 'Audio alert + beacon' : p === 'URGENT' ? 'Expedited relay' : 'Standard traffic'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Priority is assigned directly by the operator; it is not sensed by hardware.
            </p>
          </div>

          {/* Feedback or Active Transmission status */}
          {statusFeedback && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-600/40 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2 animate-pulse">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{statusFeedback}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-500">
              Sender: <span className="text-slate-300 font-semibold">{currentUser.name}</span> ({currentUser.role.toUpperCase()})
            </div>

            <button
              type="submit"
              disabled={!payload.trim() || isOverLimit || isSending || currentUser.role === 'viewer'}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'TRANSMITTING ACROSS LORA...' : 'BROADCAST VIA DRONE RELAY'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Protocol Architecture Reference Notice */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono space-y-1">
        <div className="text-slate-300 font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span>Wire Protocol Sequence:</span>
        </div>
        <p className="text-slate-400">
          ESP32 UART → SX1278 RF Broadcast (433MHz) → Drone Payload Cache (Loop Prevention msgID check) → Rebroadcast → Destination Node OLED & Buzzer → Automated ACK Return.
        </p>
      </div>
    </div>
  );
};
