import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import EventEmitter from 'node:events';
import test from 'node:test';
import { subscribeToBlocks } from '../../../lnd_methods/index.js';

const makeLnd = overrides => {
  const data = {hash: Buffer.alloc(32), height: 1};

  for (const k of Object.keys(overrides)) {
    data[k] = overrides[k]
  }

  return {
    chain: {
      registerBlockEpochNtfn: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => emitter.emit('data', data));

        return emitter;
      },
    },
  };
};

const tests = [
  {
    args: {
      lnd: {
        chain: {
          registerBlockEpochNtfn: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
      },
    },
    description: 'Errors are returned',
    error: [503, 'UnexpectedErrInBlocksSubscription', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({hash: undefined})},
    description: 'Block data is expected',
    error: [503, 'ExpectedBlockHashInAnnouncement'],
  },
  {
    args: {lnd: makeLnd({hash: Buffer.alloc(1)})},
    description: 'Block hash is expected',
    error: [503, 'UnexpectedBlockEventHashLength'],
  },
  {
    args: {lnd: makeLnd({height: undefined})},
    description: 'Height is expected',
    error: [503, 'ExpectedHeightInBlockEvent'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Block data emitted',
    expected: {height: 1, id: Buffer.alloc(32).toString('hex')},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    try {
      subscribeToBlocks({});
    } catch (err) {
      deepStrictEqual(err, new Error('ExpectedLndToSubscribeToBlocks'), 'err');
    }

    const sub = subscribeToBlocks(args);

    if (error) {
      sub.once('block', () => {});
      sub.once('error', err => {
        deepStrictEqual(err, error, 'Got expected error');

        subscribeToBlocks(args);

        process.nextTick(() => {
          sub.removeAllListeners();

          return end();
        });
      });
    } else {
      sub.once('block', ({height, id}) => {
        strictEqual(height, expected.height, 'Got height');
        strictEqual(id, expected.id, 'Got id');

        return end();
      });
    }
  });
}
