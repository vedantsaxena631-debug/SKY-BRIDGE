import React, { useState } from 'react';
import {
  BookOpen,
  Radio,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  AlertCircle,
  Clock,
  HelpCircle,
  FileCode,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<string>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const docTabs = [
    { id: 'overview', label: '1. Overview & Pitch' },
    { id: 'protocol', label: '2. Wire Protocol & JSON' },
    { id: 'loop-prevention', label: '3. Relay & Loop Prevention' },
    { id: 'serial-bridge', label: '4. USB Serial Bridge' },
    { id: 'limitations', label: '5. Limitations & Future Scope' },
    { id: 'viva', label: '6. Viva / Defense Guide' },
    { id: 'firmware', label: '7. ESP32 C++ Firmware & Pinouts' },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              TECHNICAL SPECIFICATION & DOCUMENTATION
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete architectural documentation and embedded C++ firmware for the SkyBridge network.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-800">
          Specification v2.0
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {docTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveDocTab(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeDocTab === t.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed space-y-6">
        {activeDocTab === 'overview' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-mono text-cyan-400 uppercase">
              1. System Overview & Core Mission
            </h2>
            <p>
              <strong>Pitch:</strong> <em>"Communication shouldn't stop when infrastructure does."</em> SkyBridge is a drone-mounted emergency communication relay designed to re-establish tactical link connectivity between isolated ground teams during major natural disasters or remote search-and-rescue operations.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-slate-100">The Ground Truth Architecture</h3>
              <pre className="font-mono text-cyan-300 text-[11px] overflow-x-auto p-2 bg-slate-900 rounded">
                TEAM A (Ground Base)  --433MHz LoRa--&gt;  DRONE (Airborne Repeater)  --433MHz LoRa--&gt;  TEAM B (Search Unit)
              </pre>
            </div>

            <p>
              When ground topography (hills, collapsed concrete structures, dense forest) prevents direct line-of-sight UHF/VHF or LoRa transmissions between Team A and Team B, a drone carries a lightweight ESP32 and SX1278 transceiver aloft to act as an airborne repeater.
            </p>

            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl text-amber-200 space-y-1">
              <strong>Strict Physical Isolation Rule:</strong>
              <p className="text-[11px] text-amber-300/80">
                The communications payload (ESP32 + SX1278) is completely separate from the drone’s flight system. The ESP32 does not control motors or flight paths. Flight is piloted via standard FlySky FS-i6X 2.4GHz RC hardware.
              </p>
            </div>
          </div>
        )}

        {activeDocTab === 'protocol' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-mono text-cyan-400 uppercase">
              2. Wire Protocol & JSON Wire Format
            </h2>
            <p>
              All physical over-the-air LoRa packets and USB serial communications share an identical flat JSON schema.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono">
              <div className="text-cyan-300 font-bold text-[11px]">Emergency Message Payload:</div>
              <pre className="text-emerald-400 text-[11px] overflow-x-auto p-2 bg-slate-900 rounded">
{`{"from":"TEAM_A","to":"TEAM_B","msgID":105,"payload":"VICTIM FOUND","priority":"CRITICAL","relayCount":0,"type":"MSG"}`}
              </pre>

              <div className="text-cyan-300 font-bold text-[11px] mt-2">Hop Confirmation (ACK):</div>
              <pre className="text-emerald-400 text-[11px] overflow-x-auto p-2 bg-slate-900 rounded">
{`{"from":"TEAM_B","to":"TEAM_A","msgID":105,"payload":"ACK","priority":"ROUTINE","relayCount":1,"type":"ACK"}`}
              </pre>
            </div>
          </div>
        )}

        {activeDocTab === 'loop-prevention' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-mono text-cyan-400 uppercase">
              3. Store-and-Forward & Loop Prevention
            </h2>
            <p>
              In a single-channel 433MHz broadcast environment, without loop prevention, a drone repeater re-transmitting Team A&apos;s packet would be picked up again by Team A or re-echoed endlessly.
            </p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-cyan-400">Ring-Buffer Loop Suppression Algorithm</h3>
              <p className="text-slate-300 text-[11px]">
                Every ESP32 firmware instance retains a 25-entry ring buffer of recently seen <code className="text-cyan-300">msgID</code> integers.
                When a radio packet is demodulated:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-[11px]">
                <li>Node inspects incoming <code className="text-cyan-300">msgID</code> against its ring buffer.</li>
                <li>If already present, the packet is silently dropped (Zero RF re-transmission).</li>
                <li>If new, <code className="text-cyan-300">msgID</code> is recorded to the ring buffer, <code className="text-cyan-300">relayCount</code> is incremented, and packet is retransmitted.</li>
              </ol>
            </div>
          </div>
        )}

        {activeDocTab === 'serial-bridge' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-mono text-cyan-400 uppercase">
              4. USB Serial Bridge Architecture
            </h2>
            <p>
              The laptop running the SkyBridge Web Application connects via USB UART to <strong>Team A (Base Station)</strong> at 115200 baud.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Team A forwards all received and overheard LoRa frames to USB as newline-terminated JSON strings.</li>
              <li>When an operator types a message in the web UI, the backend writes a JSON line into the serial port.</li>
              <li>Team A&apos;s ESP32 parses the line and immediately transmits it over the 433MHz LoRa link.</li>
            </ul>
          </div>
        )}

        {activeDocTab === 'limitations' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-mono text-cyan-400 uppercase">
              5. Honest Hardware Limitations & Future Scope
            </h2>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-amber-400">Current Limitations (The Ground Truth)</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>No GPS module currently installed on ESP32 boards; locations cannot be plotted on maps.</li>
                <li>No onboard camera or video streaming; communication is purely text and telemetry indicators.</li>
                <li>No drone battery telemetry sent over LoRa link; flight time is monitored manually via transmitter timer.</li>
                <li>Point-to-point store-and-forward between two ground teams; not a multi-hop mesh network yet.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-cyan-400">Future Scope (Post-v2.0)</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>NEO-6M GPS modules on ground stations for automated coordinate injection into alerts.</li>
                <li>Autonomous drone station-keeping with ArduPilot / Pixhawk GPS hover.</li>
                <li>LoRaWAN gateway uplink to The Things Network (TTN) for regional command center synchronization.</li>
              </ul>
            </div>
          </div>
        )}

        {activeDocTab === 'viva' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-mono text-cyan-400 uppercase">
              6. Viva Defense Cheat Sheet (Viva Examiners FAQ)
            </h2>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-slate-200">Q: Why use a drone as a LoRa relay instead of ground repeaters?</div>
                <p className="text-slate-400 mt-1">
                  A: Ground repeaters are limited by ground clutter, hills, and collapsed buildings. A drone hoisted to 40-50m creates an elevated line-of-sight radio horizon, multiplying effective range without infrastructure.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-slate-200">Q: Does the ESP32 fly or steer the drone?</div>
                <p className="text-slate-400 mt-1">
                  A: No. The flight control system (FlySky RC + Flight Controller + Motors) is physically and electrically isolated from the comms payload (ESP32 + SX1278) to ensure safety and zero interference.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-slate-200">Q: How do you prevent packets from echoing forever?</div>
                <p className="text-slate-400 mt-1">
                  A: Every message has a unique msgID. Nodes cache recent msgIDs and drop duplicates immediately, preventing looping.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-slate-200">Q: What happens if physical hardware is disconnected during a demo?</div>
                <p className="text-slate-400 mt-1">
                  A: SkyBridge features an isolated DEMO harness mode that clearly tags all simulated data with a distinct violet DEMO badge, upholding complete academic and engineering integrity.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDocTab === 'firmware' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-mono text-cyan-400 uppercase">
                7. Production ESP32 + SX1278 Firmware Source & Pinouts
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Directory: <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded">/firmware</code>
              </span>
            </div>

            {/* Pinout Table */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Physical Pin Map (ESP32 DevKit V1 + SX1278 Ra-02)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1.5 px-2">Signal / Peripheral</th>
                      <th className="py-1.5 px-2">ESP32 GPIO</th>
                      <th className="py-1.5 px-2">Wiring Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-1 px-2 text-cyan-300">LoRa SCK / MISO / MOSI</td>
                      <td className="py-1 px-2">18 / 19 / 23</td>
                      <td className="py-1 px-2">Hardware VSPI Bus</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-cyan-300">LoRa NSS (CS) / RST / DIO0</td>
                      <td className="py-1 px-2">5 / 14 / 2</td>
                      <td className="py-1 px-2">Active-low CS, HW Reset, RX/TX interrupt</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-emerald-300">OLED I2C SDA / SCL</td>
                      <td className="py-1 px-2">21 / 22</td>
                      <td className="py-1 px-2">Ground Nodes only (SSD1306 0x3C)</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-emerald-300">Buttons 1 (Cycle) / 2 (Send)</td>
                      <td className="py-1 px-2">32 / 33</td>
                      <td className="py-1 px-2">Active-low with internal pull-up to GND</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-emerald-300">Active Buzzer</td>
                      <td className="py-1 px-2">26</td>
                      <td className="py-1 px-2">Ground Nodes audible priority alert</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-amber-300">Drone Status LED</td>
                      <td className="py-1 px-2">26</td>
                      <td className="py-1 px-2">Drone Node only with 330Ω resistor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Flashing Commands */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Flashing via PlatformIO
              </h3>
              <p className="text-[11px] text-slate-400">
                Single unified C++ codebase with target build flags:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                  <span className="text-cyan-300">pio run -e team_a -t upload</span>
                  <button
                    onClick={() => handleCopy('pio run -e team_a -t upload', 'flash_a')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedCode === 'flash_a' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                  <span className="text-cyan-300">pio run -e team_b -t upload</span>
                  <button
                    onClick={() => handleCopy('pio run -e team_b -t upload', 'flash_b')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedCode === 'flash_b' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                  <span className="text-cyan-300">pio run -e drone_relay -t upload</span>
                  <button
                    onClick={() => handleCopy('pio run -e drone_relay -t upload', 'flash_drone')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedCode === 'flash_drone' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
