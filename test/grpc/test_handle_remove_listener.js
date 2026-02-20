import test from 'node:test';
import { handleRemoveListener } from '../../grpc/index.js';

const tests = [
  {
    args: {
      emitter: {listenerCount: () => 0, on: (eventName, cbk) => cbk()},
      events: ['event'],
      subscription: {cancel: () => {}},
    },
    description: 'An error is emitted',
  },
  {
    args: {
      emitter: {listenerCount: () => 1, on: (eventName, cbk) => cbk()},
      events: ['event'],
      subscription: {
        cancel: () => {
          throw new Error('SubscriptionShouldNotBeCanceled');
        },
      },
    },
    description: 'An error is emitted',
  },
];

for (const { args, description, expected } of tests) {
  test(description, (t, end) => {
    handleRemoveListener(args);

    return end();
  });
}
