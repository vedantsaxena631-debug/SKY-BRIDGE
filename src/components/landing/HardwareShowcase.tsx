import React from 'react';
import { Cpu, Radio, Plane } from 'lucide-react';
import { CardBody, CardContainer, CardItem } from '../ui/3d-card';
import { TextGenerateEffect } from '../ui/text-generate-effect';

// Every spec below is copied from the project's own Hardware BOM (HardwareView.tsx) and the
// landing copy. Nothing here is live telemetry or an invented capability.
const HARDWARE: {
  id: string;
  icon: React.ReactNode;
  tag: string;
  tagClass: string;
  iconClass: string;
  title: string;
  blurb: string;
  specs: { label: string; value: string }[];
}[] = [
  {
    id: 'esp32',
    icon: <Cpu className="w-5 h-5" />,
    tag: 'Ground nodes + relay',
    tagClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    iconClass: 'bg-emerald-950 border-emerald-800 text-emerald-400',
    title: 'ESP32-WROOM-32',
    blurb: 'The microcontroller on both ground stations and on the drone relay payload.',
    specs: [
      { label: 'CORE', value: 'Dual core, 240 MHz' },
      { label: 'GROUND NODE I/O', value: '0.96" SSD1306 OLED, piezo buzzer, push buttons' },
      { label: 'POWER (GROUND)', value: '18650 Li-ion + TP4056 USB-C charging' },
    ],
  },
  {
    id: 'sx1278',
    icon: <Radio className="w-5 h-5" />,
    tag: '433 MHz LoRa',
    tagClass: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    iconClass: 'bg-cyan-950 border-cyan-800 text-cyan-400',
    title: 'SX1278 Ra-02',
    blurb: 'Semtech SPI LoRa transceiver carrying packets between teams and the airborne relay.',
    specs: [
      { label: 'BAND / BUS', value: '433 MHz, SPI' },
      { label: 'RELAY ANTENNA', value: 'Tuned 433 MHz omnidirectional dipole' },
      { label: 'PROTOCOL', value: 'msgID de-duplication + ACK with retry' },
    ],
  },
  {
    id: 'f450',
    icon: <Plane className="w-5 h-5" />,
    tag: 'Manual RC',
    tagClass: 'bg-slate-800 text-slate-300 border-slate-700',
    iconClass: 'bg-slate-800 border-slate-700 text-slate-300',
    title: 'F450 Quadcopter',
    blurb: 'Manually piloted airframe that lifts the relay above the terrain.',
    specs: [
      { label: 'PROPULSION', value: '4x A2212 1000KV motors, 4x 30A ESCs' },
      { label: 'CONTROL', value: 'FlySky FS-i6X (independent of comms)' },
      { label: 'PAYLOAD MOUNT', value: '3D-printed vibration-isolated belly cradle' },
    ],
  },
];

export const HardwareShowcase: React.FC = () => (
  <section
    id="landing-hardware"
    aria-labelledby="landing-hardware-heading"
    className="py-16 px-6 border-b border-slate-800/60"
  >
    <div className="max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
          Hardware Reveal
        </div>
        <TextGenerateEffect
          as="h2"
          words="The physical build behind the network"
          className="text-2xl sm:text-3xl text-slate-100"
        />
        <p id="landing-hardware-heading" className="sr-only">
          Hardware components used in SkyBridge
        </p>
        <p className="text-sm text-slate-400 mt-3">
          Real components from the project&apos;s bill of materials. GPS, camera and Raspberry Pi
          boards are future scope and are not part of this build.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HARDWARE.map((item) => (
          <React.Fragment key={item.id}>
          <CardContainer containerClassName="py-0" className="w-full">
            <CardBody className="group/card relative w-full h-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.12)] transition-colors">
              <CardItem translateZ={40} className="flex items-center justify-between w-full">
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center ${item.iconClass}`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${item.tagClass}`}
                >
                  {item.tag}
                </span>
              </CardItem>

              <CardItem
                as="h3"
                translateZ={60}
                className="mt-5 text-lg font-bold font-mono text-slate-100"
              >
                {item.title}
              </CardItem>

              <CardItem
                as="p"
                translateZ={40}
                className="mt-2 text-xs text-slate-400 leading-relaxed w-full"
              >
                {item.blurb}
              </CardItem>

              <div className="mt-5 space-y-2 text-xs font-mono">
                {item.specs.map((spec) => (
                  <CardItem
                    key={spec.label}
                    translateZ={25}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800"
                  >
                    <div className="text-slate-500 text-[10px]">{spec.label}</div>
                    <div className="text-slate-200 font-semibold">{spec.value}</div>
                  </CardItem>
                ))}
              </div>
            </CardBody>
          </CardContainer>
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);
