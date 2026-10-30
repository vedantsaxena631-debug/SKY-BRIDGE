import { Router, Request, Response } from 'express';
import { requireGatewaySecret } from '../middleware/auth';
import { Message } from '../models/Message';
import { Device } from '../models/Device';
import { serialService } from '../services/serialService';

const router = Router();

const VALID_NODES = ['A', 'B', 'DRONE'];

router.use(requireGatewaySecret);

// GET /api/v1/gateway/outbox
router.get('/outbox', async (req: Request, res: Response) => {
  try {
    const gatewayId = String(req.query.gatewayId || '').trim();

    if (!gatewayId || gatewayId.length > 80) {
      return res.status(400).json({
        error: 'Valid gatewayId is required.',
      });
    }

    const message = await Message.claimNextQueued(gatewayId, 30000);

    if (!message) {
      return res.json({ message: null });
    }

    return res.json({
      message: {
        id: String(message._id),
        msgID: message.msgID,
        from: message.from,
        to: message.to,
        payload: message.payload,
        priority: message.priority,
        type: message.type,
      },
    });
  } catch (error: any) {
    console.error('[gateway] outbox error:', error.message);

    return res.status(500).json({
      error: 'Could not retrieve gateway outbox.',
    });
  }
});

// POST /api/v1/gateway/events
router.post('/events', async (req: Request, res: Response) => {
  try {
    const {
      event,
      gatewayId,
      msgID,
      nodeId,
      from,
      to,
      payload,
    } = req.body;

    if (
      typeof gatewayId !== 'string' ||
      !gatewayId.trim() ||
      gatewayId.length > 80
    ) {
      return res.status(400).json({
        error: 'Invalid gatewayId.',
      });
    }

    // DEVICE HEARTBEAT
    if (event === 'heartbeat') {
      if (!VALID_NODES.includes(nodeId)) {
        return res.status(400).json({
          error: 'Invalid nodeId.',
        });
      }

      const device = await Device.findOneAndUpdate(
        {
          deviceId: nodeId,
          isDemo: false,
        },
        {
          $set: {
            status: 'online',
            lastSeen: new Date(),
            role: `Team ${nodeId} Station`,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      const deviceData = device.toObject
        ? device.toObject()
        : device;

      serialService.emit('device:online', deviceData);

      return res.json({
        success: true,
        event,
      });
    }

    // VALIDATE EVENT
    if (
      !['dispatched', 'delivered', 'failed', 'received'].includes(event)
    ) {
      return res.status(400).json({
        error: 'Unsupported gateway event.',
      });
    }

    // INCOMING HARDWARE MESSAGE
    if (event === 'received') {
      if (
        !VALID_NODES.includes(from) ||
        !VALID_NODES.includes(to) ||
        from === to ||
        typeof payload !== 'string' ||
        !payload.trim() ||
        Buffer.byteLength(payload, 'utf8') > 200
      ) {
        return res.status(400).json({
          error: 'Invalid received message.',
        });
      }

      let incomingId = Number.isInteger(msgID) ? msgID : 0;

      if (!incomingId) {
        incomingId = Date.now() % 1000000000;
      }

      const existing = await Message.findOne({
        msgID: incomingId,
        isDemo: false,
      });

      if (existing) {
        return res.status(409).json({
          error: 'Message ID already exists.',
        });
      }

      const incoming = await Message.create({
        msgID: incomingId,
        from,
        to,
        payload,
        type: 'MSG',
        priority: 'routine',
        status: 'relayed',
        source: 'hardware',
        relayCount: 1,
        isDemo: false,
        timestamp: new Date(),
      });

      const data = incoming.toObject
        ? incoming.toObject()
        : incoming;

      serialService.emit('message:received', data);

      return res.json({
        success: true,
        msgID: incomingId,
      });
    }

    // VALIDATE MESSAGE ID
    if (!Number.isInteger(msgID)) {
      return res.status(400).json({
        error: 'Numeric msgID is required.',
      });
    }

    const message = await Message.findOne({
      msgID,
      isDemo: false,
    });

    if (!message) {
      return res.status(404).json({
        error: 'Live message not found.',
      });
    }

    // MESSAGE DISPATCHED TO HARDWARE
    if (event === 'dispatched') {
      if (message.claimedBy !== gatewayId) {
        return res.status(409).json({
          error: 'Message is not claimed by this gateway.',
        });
      }

      if (message.status !== 'queued') {
        return res.status(409).json({
          error: 'Message is no longer queued.',
        });
      }

      message.status = 'sent_to_bridge';
      message.claimedBy = undefined;
      message.leaseUntil = null;

      await message.save();

      return res.json({
        success: true,
        status: message.status,
      });
    }

    // MESSAGE DELIVERED
    if (event === 'delivered') {
      if (message.status === 'delivered') {
        return res.json({
          success: true,
          status: 'delivered',
        });
      }

      message.status = 'delivered';
      message.ackReceivedAt = new Date();
      message.claimedBy = undefined;
      message.leaseUntil = null;

      await message.save();

      const data = message.toObject
        ? message.toObject()
        : message;

      serialService.emit('message:delivered', data);

      return res.json({
        success: true,
        status: 'delivered',
      });
    }

    // MESSAGE DELIVERY FAILED
    if (event === 'failed') {
      if (message.status === 'delivered') {
        return res.status(409).json({
          error: 'Delivered message cannot be marked failed.',
        });
      }

      message.status = 'failed';

      message.failureReason =
        'Hardware gateway reported delivery failure.';

      message.claimedBy = undefined;
      message.leaseUntil = null;

      await message.save();

      const data = message.toObject
        ? message.toObject()
        : message;

      serialService.emit('message:failed', data);

      return res.json({
        success: true,
        status: 'failed',
      });
    }
  } catch (error: any) {
    console.error('[gateway] event error:', error.message);

    return res.status(500).json({
      error: 'Could not process gateway event.',
    });
  }
});

export default router;