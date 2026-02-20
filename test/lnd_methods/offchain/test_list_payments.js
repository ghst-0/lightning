import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import listPayments from '../../../lnd_methods/offchain/list_payments.js';

const makeLnd = args => {
  return {
    default: {
      listPayments: ({}, cbk) => cbk(null, {
        first_index_offset: args.first_index_offset || '1',
        payments: [],
        last_index_offset: args.last_index_offset || '1',
      }),
    },
  };
};

const makeArgs = overrides => {
  const args = {lnd: makeLnd({})};

  for (const k of Object.keys(overrides)) {
    args[k] = overrides[k]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({is_failed: true, is_pending: true}),
    description: 'Both failed and pending cannot be set',
    error: [400, 'EitherFailedOrPendingPaymentsIsSupportedNotBoth'],
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => listPayments(args), error, 'Got expected error');
    } else {
      const res = await listPayments(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }
  });
}
