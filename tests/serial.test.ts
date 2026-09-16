import { serialService } from '../server/services/serialService';
import { Message } from '../server/models/Message';

export async function runSerialParsingTests(): Promise<void> {
  console.log('\n  Suite: Hardware Serial Ingestion & Parsing');

  // Test 1: Stores a valid JSON line
  {
    const validPacket = JSON.stringify({
      type: 'MSG',
      from: 'A',
      to: 'B',
      msgID: 7701,
      payload: 'BEACON TEST PACKET',
      relayCount: 1,
    });

    // Feed the line directly into serial handler
    await (serialService as any)._handleLine(validPacket);

    const doc = await Message.findOne({ msgID: 7701, isDemo: false });
    if (doc && doc.payload === 'BEACON TEST PACKET' && doc.source === 'hardware' && doc.isDemo === false) {
      console.log('    ✓ stores a valid JSON line from hardware into database');
    } else {
      throw new Error(`Failed to store valid serial packet: ${JSON.stringify(doc)}`);
    }
  }

  // Test 2: Skips a malformed line without dropping the next valid one
  {
    const initialDropped = serialService.stats.linesDropped;
    const malformedLine = '{"type":"MSG","from":INVALID_JSON,,,}';
    const nextValidPacket = JSON.stringify({
      type: 'MSG',
      from: 'B',
      to: 'A',
      msgID: 7702,
      payload: 'FOLLOW UP RECOVERY PACKET',
      relayCount: 1,
    });

    // Feed bad line
    await (serialService as any)._handleLine(malformedLine);
    // Immediately feed good line
    await (serialService as any)._handleLine(nextValidPacket);

    const recoveredDoc = await Message.findOne({ msgID: 7702, isDemo: false });

    if (serialService.stats.linesDropped > initialDropped && recoveredDoc) {
      console.log('    ✓ skips a malformed line without dropping the next valid one');
    } else {
      throw new Error('Parser crashed or dropped the subsequent valid packet');
    }
  }

  // Test 3: Increments relayCount instead of duplicating on a repeat msgID
  {
    const repeatPacket = JSON.stringify({
      type: 'MSG',
      from: 'A',
      to: 'B',
      msgID: 7701, // Identical msgID to Test 1!
      payload: 'BEACON TEST PACKET',
      relayCount: 1,
    });

    const countBefore = await Message.countDocuments({ msgID: 7701, isDemo: false });
    await (serialService as any)._handleLine(repeatPacket);
    const countAfter = await Message.countDocuments({ msgID: 7701, isDemo: false });
    const updatedDoc = await Message.findOne({ msgID: 7701, isDemo: false });

    if (countBefore === countAfter && updatedDoc.relayCount > 1) {
      console.log('    ✓ increments relayCount instead of duplicating on repeat msgID');
    } else {
      throw new Error(`Repeat msgID caused duplicate rows! Count before: ${countBefore}, after: ${countAfter}`);
    }
  }

  // Test 4: Marks a message delivered when its ACK arrives
  {
    const ackPacket = JSON.stringify({
      type: 'ACK',
      from: 'B',
      to: 'A',
      msgID: 7701,
    });

    await (serialService as any)._handleLine(ackPacket);

    const deliveredDoc = await Message.findOne({ msgID: 7701, isDemo: false });
    if (deliveredDoc && deliveredDoc.status === 'delivered' && deliveredDoc.ackReceivedAt) {
      console.log('    ✓ marks a message delivered when physical ACK arrives');
    } else {
      throw new Error(`Message was not marked delivered upon ACK arrival: ${JSON.stringify(deliveredDoc)}`);
    }
  }
}
