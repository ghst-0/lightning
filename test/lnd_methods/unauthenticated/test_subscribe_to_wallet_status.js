import EventEmitter from 'node:events';
import { deepStrictEqual } from 'node:assert/strict';
import test from 'node:test';
import { subscribeToWalletStatus } from '../../../lnd_methods/index.js';

const makeLnd = overrides => {
  const data = {state: 'LOCKED'};

  for (const k of Object.keys(overrides)) {
    data[k] = overrides[k]
  }

  return {
    status: {
      subscribeState: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        if (overrides.data === undefined) {
          process.nextTick(() => emitter.emit('data', data));
        } else {
          process.nextTick(() => emitter.emit('data', overrides.data));
        }

        return emitter;
      },
    },
  };
};

const tests = [
  {
    args: {
      lnd: {
        status: {
          subscribeState: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are returned',
    error: 'err',
  },
  {
    args: {
      lnd: {
        status: {
          subscribeState: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', {
              details: 'Cancelled on client',
            }));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are returned',
    error: {details: 'Cancelled on client'},
  },
  {
    args: {lnd: makeLnd({data: null})},
    description: 'A state is expected',
    error: new Error('ExpectedStateFromWalletStatus'),
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Wallet state emitted',
  },
  {
    args: {lnd: makeLnd({state: 'NON_EXISTING'})},
    description: 'Absent wallet state emitted',
  },
  {
    args: {lnd: makeLnd({state: 'RPC_ACTIVE'})},
    description: 'Active wallet state emitted',
  },
  {
    args: {lnd: makeLnd({state: 'SERVER_ACTIVE'})},
    description: 'Active server state emitted',
  },
  {
    args: {lnd: makeLnd({state: 'WAITING_TO_START'})},
    description: 'Server waiting to start',
  },
  {
    args: {lnd: makeLnd({state: 'undefined_state'})},
    description: 'Server emitted an unknown event',
  },
  {
    args: {lnd: makeLnd({state: 'UNLOCKED'})},
    description: 'Starting state emitted',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    try {
      subscribeToWalletStatus({});
    } catch (err) {
      deepStrictEqual(
        err,
        new Error('ExpectedAuthenticatedLndToSubscribeToWalletStatus'), 'lnd');
    }

    const sub = subscribeToWalletStatus(args);

    if (error) {
      sub.once('error', err => {
        deepStrictEqual(err, error, 'Got expected error');

        subscribeToWalletStatus(args);

        process.nextTick(() => {
          sub.removeAllListeners();

          return end();
        });
      });
    } else {
      if (!expected) {
        return end();
      }

      sub.once('absent', () => end());
      sub.once('active', () => end());
      sub.once('locked', () => end());
      sub.once('starting', () => end());
    }
  });
}
