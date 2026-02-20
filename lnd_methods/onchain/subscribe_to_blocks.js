import EventEmitter from 'node:events';

import { isLnd } from './../../lnd_requests/index.js';

const blockHashByteLen = 32;
const event = 'block';
const {isBuffer} = Buffer;
const method = 'registerBlockEpochNtfn';
const type = 'chain';

/** Subscribe to blocks

  This method will also immediately emit the current height and block id

  Requires LND built with `chainrpc` build tag

  Requires `onchain:read` permission

  {
    lnd: <Authenticated LND Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'block'
  {
    height: <Block Height Number>
    id: <Block Hash Hex String>
  }
*/
export default ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedLndToSubscribeToBlocks');
  }

  const eventEmitter = new EventEmitter();
  const sub = lnd[type][method]({});

  // Cancel the subscription when all listeners are removed
  eventEmitter.on('removeListener', () => {
    // Exit early when there are still listeners on the subscription
    if (eventEmitter.listenerCount(event)) {
      return;
    }

    // There are no more listeners to this subscription, so stop listening
    sub.cancel();
  });

  const emitError = err => {
    // Errors should stop the subscription
    sub.cancel();

    sub.removeAllListeners();

    // Exit early when there are no error listeners
    if (!eventEmitter.listenerCount('error')) {
      return;
    }

    eventEmitter.emit('error', err);
  };

  sub.on('error', err => {
    return emitError([503, 'UnexpectedErrInBlocksSubscription', {err}]);
  });

  sub.on('data', data => {
    if (!isBuffer(data.hash)) {
      return emitError([503, 'ExpectedBlockHashInAnnouncement']);
    }

    if (data.hash.length !== blockHashByteLen) {
      return emitError([503, 'UnexpectedBlockEventHashLength']);
    }

    if (data.height === undefined) {
      return emitError([503, 'ExpectedHeightInBlockEvent']);
    }

    eventEmitter.emit(event, {
      height: data.height,
      id: data.hash.slice().reverse().toString('hex'),
    });
  });

  return eventEmitter;
};
