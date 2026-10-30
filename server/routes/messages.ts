
import { Router, Request, Response } from 'express';
import { requireAuth, requireRole, scopeToSessionMode, enforceSenderIdentity } from '../middleware/auth';
import { Message } from '../models/Message';
import { generateCorrelationId, logTrace } from '../utils/trace';

const router = Router();

// GET /api/v1/messages
router.get('/', requireAuth, scopeToSessionMode, async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({ ...req.modeFilter }).sort({ timestamp: -1 });
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message, code: 'INTERNAL_ERROR' });
  }
});

// POST /api/v1/messages
router.post(
  '/',
  requireAuth,
  scopeToSessionMode,
  async (req: Request, res: Response, next) => {
    const { from, to, payload } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        error: 'Both from and to nodes are required.',
        code: 'MISSING_NODES',
      });
    }

    if (from === to) {
      return res.status(400).json({
        error: 'Message cannot be self-addressed (from and to cannot be identical).',
        code: 'SELF_ADDRESSED_MESSAGE',
      });
    }

    if (payload === undefined || payload === null || typeof payload !== 'string' || payload.trim().length === 0) {
      return res.status(400).json({
        error: 'Payload must be a non-empty string.',
        code: 'EMPTY_PAYLOAD',
      });
    }

    const payloadBytes = Buffer.byteLength(payload, 'utf8');

    if (payloadBytes > 200) {
      return res.status(400).json({
        error: `Payload size (${payloadBytes} bytes) exceeds maximum LoRa transmission limit of 200 bytes.`,
        code: 'PAYLOAD_TOO_LARGE',
        bytes: payloadBytes,
      });
    }

    next();
  },
  enforceSenderIdentity,
  async (req: Request, res: Response) => {
    const { from, to, payload, priority, type, msgID: explicitMsgID } = req.body;
    const isDemo = req.isDemo;
    const correlationId = generateCorrelationId();
    const payloadBytes = Buffer.byteLength(payload, 'utf8');

    logTrace(
      correlationId,
      'rest.post',
      `from=${from} to=${to} bytes=${payloadBytes} role=${req.user.role} mode=${req.sessionMode}`
    );

    const msgID = typeof explicitMsgID === 'number'
      ? explicitMsgID
      : Math.floor(1000 + Math.random() * 9000);

    // Check duplicate message IDs within the same mode.
    const existing = await Message.findOne({ msgID, isDemo });

    if (existing) {
      return res.status(409).json({
        error: `Message with msgID ${msgID} already exists in ${isDemo ? 'demo' : 'live'} mode.`,
        code: 'DUPLICATE_MSG_ID',
      });
    }

    logTrace(
      correlationId,
      'validate.ok',
      `msgID=${msgID} payload=${payloadBytes}B type=${type || 'MSG'}`
    );

    // Live messages wait for the authenticated laptop gateway.
    // Demo messages continue through the existing simulator flow.
    const status = isDemo ? 'sent_to_bridge' : 'queued';

    if (!isDemo) {
      logTrace(
        correlationId,
        'gateway.queue',
        `msgID=${msgID} bytes=${payloadBytes}`
      );
    }

    const dbStart = Date.now();

    const newDoc = await Message.create({
      msgID,
      from,
      to,
      payload,
      type: type || 'MSG',
      priority: priority || 'routine',
      status,
      source: isDemo ? 'simulator' : 'hardware',
      relayCount: 0,
      isDemo,
      timestamp: new Date(),
    });

    const dbElapsed = Date.now() - dbStart;

    logTrace(
      correlationId,
      'db.write',
      `_id=${newDoc._id} isDemo=${isDemo} status=${status} (${dbElapsed}ms)`
    );

    return res.status(201).json(
      newDoc.toObject ? newDoc.toObject() : newDoc
    );
  }
);

// Admin-only demo purge endpoint
router.delete('/demo', requireAuth, requireRole('admin'), async (_req: Request, res: Response) => {
  const result = await Message.deleteMany({ isDemo: true });

  res.json({
    message: `Purged ${result.deletedCount} demo records.`,
    count: result.deletedCount,
  });
});

export default router;
