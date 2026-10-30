/**
 * SkyBridge Physical Hardware Link Verification Script
 * Probes COM8 (Team A Ground Station) and COM14 (Team B Ground Station)
 * Sends a live message over 433MHz LoRa and measures RSSI / SNR / roundtrip ACK latency.
 */

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const PORT_A = process.env.PORT_A || 'COM8';
const PORT_B = process.env.PORT_B || 'COM14';
const BAUD_RATE = 115200;

console.log('\n============================================================');
console.log('       SKYBRIDGE PHYSICAL LORA HARDWARE LINK PROBE          ');
console.log('============================================================\n');
console.log(`Node A (Base Station): ${PORT_A} @ ${BAUD_RATE}`);
console.log(`Node B (Search Unit) : ${PORT_B} @ ${BAUD_RATE}\n`);

async function runLinkTest() {
  let portA: SerialPort | null = null;
  let portB: SerialPort | null = null;

  try {
    portA = new SerialPort({ path: PORT_A, baudRate: BAUD_RATE });
    const parserA = portA.pipe(new ReadlineParser({ delimiter: '\n' }));

    portB = new SerialPort({ path: PORT_B, baudRate: BAUD_RATE });
    const parserB = portB.pipe(new ReadlineParser({ delimiter: '\n' }));

    let messageReceivedOnB = false;
    let ackReceivedOnA = false;
    let rssiValue = '';
    let snrValue = '';

    parserA.on('data', (raw: string) => {
      const line = raw.trim();
      if (!line) return;
      console.log(`  [TEAM_A (${PORT_A})] ${line}`);
      if (line.includes('STATUS: DELIVERED') || line.includes('ACK RECEIVED')) {
        ackReceivedOnA = true;
      }
    });

    parserB.on('data', (raw: string) => {
      const line = raw.trim();
      if (!line) return;
      console.log(`  [TEAM_B (${PORT_B})] ${line}`);
      if (line.includes('MESSAGE RECEIVED')) {
        messageReceivedOnB = true;
      }
      if (line.startsWith('RSSI:')) {
        rssiValue = line.replace('RSSI:', '').trim() + ' dBm';
      }
      if (line.startsWith('SNR:')) {
        snrValue = line.replace('SNR:', '').trim() + ' dB';
      }
    });

    // Wait for transceivers to settle
    await new Promise((r) => setTimeout(r, 1500));

    const testPayload = `SYS_DIAG_TEST_${Date.now().toString().slice(-4)}`;
    console.log(`--> Sending over-the-air test packet from ${PORT_A} to ${PORT_B}: "${testPayload}"\n`);
    const startTime = Date.now();
    portA.write(`SEND|NORMAL|TEAM_B|${testPayload}\n`);

    // Wait up to 5 seconds for full round-trip LoRa hop & ACK
    for (let i = 0; i < 25; i++) {
      if (messageReceivedOnB && ackReceivedOnA) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    const elapsed = Date.now() - startTime;

    console.log('\n------------------------------------------------------------');
    console.log(' HARDWARE LINK RESULTS:');
    console.log(` - Node A -> Node B OTA LoRa Reception: ${messageReceivedOnB ? 'PASSED (✓)' : 'FAILED (✗)'}`);
    console.log(` - Node B -> Node A Return ACK Confirm : ${ackReceivedOnA ? 'PASSED (✓)' : 'FAILED (✗)'}`);
    if (rssiValue) console.log(` - Signal Strength (RSSI)             : ${rssiValue}`);
    if (snrValue)  console.log(` - Signal-to-Noise Ratio (SNR)        : ${snrValue}`);
    console.log(` - Total Round-Trip Time              : ${elapsed} ms`);
    console.log('------------------------------------------------------------\n');

    if (messageReceivedOnB && ackReceivedOnA) {
      console.log('===> HARDWARE LINK HEALTH: 100% OPERATIONAL\n');
    } else {
      console.log('===> WARNING: Link test incomplete or timed out.\n');
    }

    portA.close();
    portB.close();
    process.exit(messageReceivedOnB && ackReceivedOnA ? 0 : 1);
  } catch (err: any) {
    console.error('[probe] Fatal error:', err.message);
    if (portA?.isOpen) portA.close();
    if (portB?.isOpen) portB.close();
    process.exit(1);
  }
}

runLinkTest();
