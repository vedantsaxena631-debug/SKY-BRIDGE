import React from 'react';
import {
  Cpu,
  Plane,
  Radio,
  Battery,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const HardwareView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              HARDWARE BILL OF MATERIALS (BOM)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official hardware component list matching physical system construction.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/40">
          Ground Truth v2.0
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          This hardware specification lists strictly the components physically integrated into SkyBridge. GPS modules, Raspberry Pi boards, FPV cameras, LoRaWAN gateways, and AI vision compute units are explicitly reserved for Future Scope and are not present in this build.
        </p>
      </div>

      {/* Three Component Groups (Section 4 & 26) */}
      <div className="space-y-6">
        
        {/* 1. Drone Flight System */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">1. DRONE FLIGHT SYSTEM</h3>
                <p className="text-xs text-slate-400">Physical Quadcopter Platform (Manually Piloted)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Manual RC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">AIRFRAME</div>
              <div className="text-slate-200 font-semibold">F450 Quadcopter Frame (Glass Fiber Arms)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">PROPULSION MOTORS</div>
              <div className="text-slate-200 font-semibold">4× A2212 1000KV Brushless DC Motors</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">ELECTRONIC SPEED CONTROLLERS</div>
              <div className="text-slate-200 font-semibold">4× 30A SimonK / BLHeli Brushless ESCs</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">PROPELLERS</div>
              <div className="text-slate-200 font-semibold">1045 Carbon-Nylon Propellers (2 CW, 2 CCW)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">FLIGHT CONTROLLER</div>
              <div className="text-slate-200 font-semibold">Flight Controller with Gyro/Accelerometer</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">REMOTE CONTROL SYSTEM</div>
              <div className="text-slate-200 font-semibold">FlySky FS-i6X 2.4GHz 6-10Ch Transmitter + FS-iA6B Receiver</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">BATTERY & POWER</div>
              <div className="text-slate-200 font-semibold">3S 11.1V 2200mAh-3300mAh LiPo + Power Distribution Board</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">CHARGING</div>
              <div className="text-slate-200 font-semibold">B3 Pro / IMAX B6 LiPo Balance Charger</div>
            </div>
          </div>
        </div>

        {/* 2. Drone LoRa Relay Payload */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">2. DRONE LORA RELAY PAYLOAD</h3>
                <p className="text-xs text-slate-400">Autonomous Airborne Store-and-Forward Communications Repeater</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Airborne Node
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">MICROCONTROLLER</div>
              <div className="text-cyan-300 font-semibold">ESP32-WROOM-32 Dev Board (Dual Core 240MHz)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">TRANSCEIVER MODULE</div>
              <div className="text-cyan-300 font-semibold">Semtech SX1278 (Ra-02 433 MHz SPI LoRa)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">ANTENNA</div>
              <div className="text-slate-200 font-semibold">Tuned 433 MHz Ultra-light Omnidirectional Dipole</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">POWER CONVERTER</div>
              <div className="text-slate-200 font-semibold">5V 3A UBEC Buck Step-Down from Drone Main LiPo</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 col-span-2">
              <div className="text-slate-400 text-[10px]">MOUNTING & ENCLOSURE</div>
              <div className="text-slate-200 font-semibold">3D-printed vibration-isolated belly cradle with nylon standoffs</div>
            </div>
          </div>
        </div>

        {/* 3. Ground Nodes (Team A, Team B) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">3. GROUND NODES (TEAM A & TEAM B)</h3>
                <p className="text-xs text-slate-400">Handheld / Field Station User Interface Terminals</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              2× Stations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">PROCESSOR</div>
              <div className="text-slate-200 font-semibold">ESP32-WROOM-32 Microcontroller</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">RF TRANSCEIVER</div>
              <div className="text-slate-200 font-semibold">SX1278 Ra-02 (433 MHz, SPI Interface)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">LOCAL DISPLAY</div>
              <div className="text-slate-200 font-semibold">0.96-inch I2C SSD1306 OLED (128×64)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">AUDIBLE BEACON</div>
              <div className="text-slate-200 font-semibold">5V Active Piezo Buzzer for emergency alert tone</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">INPUT CONTROLS</div>
              <div className="text-slate-200 font-semibold">Tactile Push Buttons for Predefined Message Selection</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">PORTABLE POWER & CHARGE</div>
              <div className="text-slate-200 font-semibold">18650 3.7V 2600mAh Li-ion + TP4056 USB-C Charging Board</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
