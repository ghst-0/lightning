import EventEmitter from 'node:events';
import { emitSubscriptionError, handleRemoveListener } from './../../grpc/index.js';
import { isLnd } from './../../lnd_requests/index.js';
import { rpcPeerMessageAsMessage } from './../../lnd_responses/index.js';

const events = ['message_received'];
const method = 'SubscribeCustomMessages';
const type = 'default';

/** Subscribe to incoming peer messages

  Requires `offchain:read` permission

  This method is not supported in LND 0.13.4 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns
  <EventEmitter Object>

  // A message was received from a peer
  @event 'message_received'
  {
    message: <Message Hex String>
    public_key: <From Peer Public Key Hex String>
    type: <Message Type Number>
  }
*/
export default ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedLndToSubscribeToPeerMessages');
  }

  const emitter = new EventEmitter();
  const subscription = lnd[type][method]({});

  const errored = emitSubscriptionError({emitter, subscription});

  // Terminate subscription when all listeners are removed
  handleRemoveListener({subscription, emitter, events});

  subscription.on('end', () => emitter.emit('end'));
  subscription.on('error', err => errored(err));
  subscription.on('status', n => emitter.emit('status', n));

  subscription.on('data', message => {
    try {
      // Notify listeners of the message
      emitter.emit('message_received', rpcPeerMessageAsMessage(message));
    } catch (err) {
      return errored([503, err.message]);
    }
  });

  return emitter;
};
