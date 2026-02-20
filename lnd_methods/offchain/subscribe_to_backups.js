import EventEmitter from 'node:events';

import { backupsFromSnapshot } from '../../lnd_responses/index.js';
import { isLnd } from '../../lnd_requests/index.js';

const cancelError = 'Cancelled on client';
const method = 'subscribeChannelBackups';
const type = 'default';

/** Subscribe to backup snapshot updates

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'backup'
  {
    backup: <Backup Hex String>
    channels: [{
      backup: <Backup Hex String>
      transaction_id: <Funding Transaction Id Hex String>
      transaction_vout: <Funding Transaction Output Index Number>
    }]
  }
*/
export default ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToBackups');
  }

  const eventEmitter = new EventEmitter();
  const subscription = lnd[type][method]({});

  // Cancel the subscription when all listeners are removed
  eventEmitter.on('removeListener', () => {
    // Exit early when there are still listeners
    if (eventEmitter.listenerCount('backup')) {
      return;
    }

    subscription.cancel();
  });

  const emitError = err => {
    subscription.cancel();

    if (err && err.details === cancelError) {
      subscription.removeAllListeners();
    }

    // Exit early when there are no error listeners
    if (!eventEmitter.listenerCount('error')) {
      return;
    }

    eventEmitter.emit('error', err);
  };

  subscription.on('data', snapshot => {
    try {
      return eventEmitter.emit('backup', backupsFromSnapshot(snapshot));
    } catch (err) {
      return emitError([503, err.message]);
    }
  });

  subscription.on('end', () => eventEmitter.emit('end'));
  subscription.on('error', err => emitError(err));
  subscription.on('status', status => eventEmitter.emit('status', status));

  return eventEmitter;
};
