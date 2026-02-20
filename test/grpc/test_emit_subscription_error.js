import test from 'node:test';
import { emitSubscriptionError } from '../../grpc/index.js';

const tests = [
  {
    args: {
      emitter: {
        emit: (event, err) => {
          if (err.details === 'Cancelled on client') {
            return;
          }

          if (err === 'error') {
            return;
          }

          throw new Error('UnexpectedErrorEmitted');
        },
        listenerCount: () => 1,
      },
      subscription: {
        cancel: () => {},
        removeAllListeners: () => {},
      },
    },
    description: 'An error is emitted',
  },
  {
    args: {
      emitter: {
        emit: (event, err) => {
          if (!err || err === 'error') {
            return;
          }

          throw new Error('ExpectedNoErrorEmitted');
        },
        listenerCount: () => Number(),
      },
      subscription: {
        cancel: () => {},
        removeAllListeners: () => {},
      },
    },
    description: 'An error is emitted',
  },
  {
    args: {
      emitter: {
        emit: (event, err) => {
          if (!err) {
            return;
          }

          throw new Error('ExpectedNoErrorEmitted');
        },
        listenerCount: () => Number(),
      },
      subscription: {
        cancel: () => {},
        removeAllListeners: () => {},
      },
    },
    description: 'An error is emitted',
  },
];

for (const { args, description, expected } of tests) {
  test(description, (t, end) => {
    const emitErr = emitSubscriptionError(args);

    emitErr('error');
    emitErr({details: 'Cancelled on client'});

    return end();
  });
}
