import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { payViaRouteRequest } from '../../lnd_messages/index.js';

const makeArgs = overrides => {
  const args = {
    payment_hash: Buffer.alloc(32),
    route: {
      hops: [{
        amt_to_forward_msat: '1',
        chan_id: '1',
        chan_capacity: 1,
        custom_records: {},
        expiry: 1,
        pub_key: Buffer.alloc(33, 3).toString('hex'),
        fee_msat: '1',
        tlv_payload: true,
      }],
      total_amt_msat: '1',
      total_fees_msat: '1',
      total_time_lock: 1,
    },
  };

  for (const k of Object.keys(overrides)) {
    args[k] = overrides[k]
  }

  return args;
};

const makeExpected = overrides => {
  const args = {
    id: Buffer.alloc(32).toString('hex'),
    route: {
      fee: 0,
      fee_mtokens: '1',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 0,
        fee_mtokens: '1',
        forward: 0,
        forward_mtokens: '1',
        public_key: Buffer.alloc(33, 3).toString('hex'),
        timeout: 1,
      }],
      mtokens: '1',
      payment: undefined,
      timeout: 1,
      tokens: 0,
      total_mtokens: undefined,
    },
  };

  for (const k of Object.keys(overrides)) {
    args[k] = overrides[k]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Pay via route request is converted to pay details',
    expected: makeExpected({}),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => payViaRouteRequest(args), new Error(error), 'Got error');
    } else {
      const res = payViaRouteRequest(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return end();
  });
}
