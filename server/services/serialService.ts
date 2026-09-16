import { EventEmitter } from 'events';
import { Message } from '../models/Message';
import { Device } from '../models/Device';
import { SystemEvent } from '../models/SystemEvent';
import { generateCorrelationId, logTrace } from '../utils/trace';

const VALID_NODES = ['A', 'B', 'DRONE'];
const VALID_TYPES = ['MSG', 'ACK', 'HEARTBEAT', 'PING', 'STATUS'];

export class SerialService extends EventEmitter {
  public port: any = null;
  public parser: any = null;
  public connected: boolean = false;
  public portPath: string | null = null;
  public baudRate: number | null = null;
  public reconnectDelay: number = 1000;
  public maxReconnectDelay: number = 30000;
  public reconnectTimer: any = null;
  public shuttingDown: boolean = false;
  public lastError: string | null = null;
  public stats = { linesRead: 0, linesParsed: 0, linesDropped: 0, messagesWritten: 0 };

  constructor() {
    super();
  }

  async connect(
    portPath: string = process.env.SERIAL_PORT || '',
    baudRate: number = Number(process.env.SERIAL_BAUD_RATE || 115200)
  ) {
    if (this.connected) return { connected: true, port: this.portPath };

    if (!portPath) {
      this.lastError = 'SERIAL_PORT is not set in .env';
      console.warn('[serial] no SERIAL_PORT configured - Live Mode will show an empty network.');
      return { connected: false, error: this.lastError };
    }

    this.portPath = portPath;
    this.baudRate = baudRate;

    try {
      // Dynamic import to avoid crash if optional serialport is not present
      let SerialPortModule: any;
      let readlineModule: any;
      try {
        SerialPortModule = await import('serialport' as any);
        readlineModule = await import('@serialport/parser-readline' as any);
      } catch {
        this.lastError = 'serialport module not installed on this host';
        console.warn(`[serial] ${this.lastError}`);
        return { connected: false, error: this.lastError };
      }

      const SerialPort = SerialPortModule.SerialPort;
      const ReadlineParser = readlineModule.ReadlineParser;

      return new Promise<{ connected: boolean; port?: string | null; error?: string }>((resolve) => {
        this.port = new SerialPort({ path: portPath, baudRate, autoOpen: false });

        this.port.open((err: any) => {
          if (err) {
            this.connected = false;
            this.lastError = err.message;
            console.warn(`[serial] could not open ${portPath}: ${err.message}`);
            this.emit('status', this.getStatus());
            this._scheduleReconnect();
            return resolve({ connected: false, error: err.message });
          }

          this.connected = true;
          this.lastError = null;
          this.reconnectDelay = 1000;
          console.log(`[serial] connected on ${portPath} @ ${baudRate}`);

          this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
          this.parser.on('data', (line: string) => this._handleLine(line));

          this.port.on('close', () => {
            this.connected = false;
            console.warn('[serial] port closed');
            this.emit('status', this.getStatus());
            if (!this.shuttingDown) this._scheduleReconnect();
          });

          this.port.on('error', (e: any) => {
            this.lastError = e.message;
            console.error('[serial] error:', e.message);
            this.emit('status', this.getStatus());
          });

          this.emit('status', this.getStatus());
          this._logEvent('serial_connected', `Serial bridge connected on ${portPath}`);
          resolve({ connected: true, port: portPath });
        });
      });
    } catch (e: any) {
      this.connected = false;
      this.lastError = e.message;
      return { connected: false, error: e.message };
    }
  }

  private _scheduleReconnect() {
    if (this.shuttingDown || this.reconnectTimer) return;
    const delay = this.reconnectDelay;
    console.log(`[serial] retrying in ${delay / 1000}s`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      await this.connect(this.portPath || undefined, this.baudRate || undefined);
    }, delay);
  }

  async disconnect() {
    this.shuttingDown = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.port?.isOpen) {
      await new Promise((r) => this.port.close(r));
    }
    this.connected = false;
    this.shuttingDown = false;
    this.emit('status', this.getStatus());
    return this.getStatus();
  }

  getStatus() {
    return {
      connected: this.connected,
      port: this.portPath || null,
      baudRate: this.baudRate || null,
      lastError: this.lastError,
      stats: { ...this.stats },
    };
  }

  private async _handleLine(rawLine: string) {
    this.stats.linesRead += 1;
    const line = rawLine.trim();
    if (!line) return;

    let packet: any;
    try {
      packet = JSON.parse(line);
    } catch {
      this.stats.linesDropped += 1;
      console.warn('[serial] dropped unparseable line:', line.slice(0, 120));
      return;
    }

    if (!this._isValidPacket(packet)) {
      this.stats.linesDropped += 1;
      console.warn('[serial] dropped invalid packet:', JSON.stringify(packet).slice(0, 120));
      return;
    }

    this.stats.linesParsed += 1;
    const correlationId = generateCorrelationId();

    if (packet.type === 'MSG' || packet.type === 'ACK') {
      logTrace(
        correlationId,
        'serial.in',
        `msgID=${packet.msgID} from=${packet.from || '-'} to=${packet.to || '-'} bytes=${Buffer.byteLength(rawLine, 'utf8')}`
      );
      logTrace(
        correlationId,
        'validate.ok',
        `payload=${packet.payload ? Buffer.byteLength(packet.payload, 'utf8') : 0}B type=${packet.type}`
      );
    }

    try {
      switch (packet.type) {
        case 'HEARTBEAT':
          return await this._handleHeartbeat(packet);
        case 'ACK':
          return await this._handleAck(packet, correlationId);
        case 'STATUS':
          return await this._handleStatus(packet);
        case 'MSG':
        case 'PING':
          return await this._handleMessage(packet, correlationId);
        default:
          return;
      }
    } catch (err: any) {
      console.error('[serial] failed handling packet:', err.message);
    }
  }

  private _isValidPacket(p: any) {
    if (!p || typeof p !== 'object') return false;
    if (!VALID_TYPES.includes(p.type)) return false;
    if (p.from && !VALID_NODES.includes(p.from)) return false;
    if (p.to && !VALID_NODES.includes(p.to)) return false;
    if (p.type === 'MSG') {
      if (typeof p.msgID !== 'number') return false;
      if (typeof p.payload !== 'string' || p.payload.length === 0) return false;
      if (Buffer.byteLength(p.payload, 'utf8') > 200) return false;
    }
    if (p.type === 'ACK' && typeof p.msgID !== 'number') return false;
    return true;
  }

  private async _handleMessage(packet: any, correlationId?: string) {
    const existing = await Message.findOne({ msgID: packet.msgID, isDemo: false });

    if (existing) {
      existing.relayCount = (existing.relayCount || 0) + 1;
      if (existing.status === 'queued' || existing.status === 'sent_to_bridge') {
        existing.status = 'relayed';
      }
      await existing.save();
      this.stats.messagesWritten += 1;
      if (correlationId) {
        logTrace(correlationId, 'db.write', `_id=${existing._id} relayCount=${existing.relayCount} isDemo=false (updated)`);
        logTrace(correlationId, 'socket.emit', `ns=/live event=message:relayed clients=active`);
      }
      this.emit('message:relayed', existing.toObject ? existing.toObject() : existing);
      return;
    }

    const dbStart = Date.now();
    const doc = await Message.create({
      msgID: packet.msgID,
      from: packet.from,
      to: packet.to,
      payload: packet.payload,
      type: packet.type,
      priority: packet.priority || 'routine',
      status: 'relayed',
      source: 'hardware',
      relayCount: packet.relayCount ?? 1,
      isDemo: false, // hardware data is never demo
      timestamp: new Date(),
    });
    const dbElapsed = Date.now() - dbStart;

    this.stats.messagesWritten += 1;
    if (correlationId) {
      logTrace(correlationId, 'db.write', `_id=${doc._id} isDemo=false (${dbElapsed}ms)`);
      logTrace(correlationId, 'socket.emit', `ns=/live event=message:received clients=active`);
    }
    this.emit('message:received', doc.toObject ? doc.toObject() : doc);
    await this._touchDevice(packet.from);
  }

  private async _handleAck(packet: any, correlationId?: string) {
    const original = await Message.findOne({ msgID: packet.msgID, isDemo: false });
    if (!original) return;

    original.status = 'delivered';
    original.ackReceivedAt = new Date();
    await original.save();

    if (correlationId) {
      logTrace(correlationId, 'db.write', `_id=${original._id} status=delivered ack=recorded`);
      logTrace(correlationId, 'socket.emit', `ns=/live event=message:delivered clients=active`);
    }
    this.emit('message:delivered', original.toObject ? original.toObject() : original);
    await this._touchDevice(packet.from);
  }

  private async _handleStatus(packet: any) {
    if (packet.status !== 'FAILED_NO_ACK' || typeof packet.msgID !== 'number') return;
    const msg = await Message.findOne({ msgID: packet.msgID, isDemo: false });
    if (!msg || msg.status === 'delivered') return;

    msg.status = 'failed';
    msg.failureReason = 'No acknowledgment received';
    await msg.save();
    this.emit('message:failed', msg.toObject ? msg.toObject() : msg);
  }

  private async _handleHeartbeat(packet: any) {
    await this._touchDevice(packet.from, packet.battery);
  }

  private async _touchDevice(deviceId: string, batteryVolts?: number) {
    if (!deviceId) return;
    const update: any = { status: 'online', lastSeen: new Date() };
    if (typeof batteryVolts === 'number') update.batteryVolts = batteryVolts;

    const device = await Device.findOneAndUpdate(
      { deviceId, isDemo: false },
      { $set: update },
      { new: true, upsert: true }
    );
    this.emit('device:online', device.toObject ? device.toObject() : device);
  }

  async send(packet: any) {
    if (!this.connected || !this.port?.isOpen) {
      const err: any = new Error('Serial bridge not connected');
      err.code = 'SERIAL_DISCONNECTED';
      throw err;
    }
    const line = JSON.stringify(packet) + '\n';
    return new Promise((resolve, reject) => {
      this.port.write(line, (err: any) => {
        if (err) return reject(err);
        this.port.drain((drainErr: any) => (drainErr ? reject(drainErr) : resolve(true)));
      });
    });
  }

  private async _logEvent(type: string, message: string) {
    try {
      await SystemEvent.create({ type, message, isDemo: false, timestamp: new Date() });
    } catch (err: any) {
      console.error('[serial] could not log system event:', err.message);
    }
  }
}

export const serialService = new SerialService();

export function startHeartbeatSweep(intervalMs: number = 5000) {
  const timeout = Number(process.env.HEARTBEAT_TIMEOUT_MS || 20000);
  return setInterval(async () => {
    const cutoff = new Date(Date.now() - timeout);
    const stale: any[] = await Device.find({ isDemo: false, status: 'online', lastSeen: { $lt: cutoff } });
    for (const device of stale) {
      device.status = 'offline';
      await device.save();
      serialService.emit('device:offline', device.toObject ? device.toObject() : device);
    }
  }, intervalMs);
}
