import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { closeChannelRequest } from '../../lnd_messages/index.js';

const makeArgs = overrides => {
  const args = {
    channel_point: {
      funding_txid_bytes: Buffer.from('010203', 'hex'),
      output_index: 0,
    },
    delivery_address: 'delivery_address',
    force: true,
    sat_per_vbyte: '1',
    target_conf: 1,
  };

  for (const k of Object.keys(overrides)) {
    args[k] = overrides[k]
  }

  return args;
};

const makeExpected = overrides => {
  const args = {
    address: 'delivery_address',
    is_force_close: true,
    max_tokens_per_vbyte: undefined,
    target_confirmations: 1,
    tokens_per_vbyte: 1,
    transaction_id: '030201',
    transaction_vout: 0,
  };

  for (const k of Object.keys(overrides)) {
    args[k] = overrides[k]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Close request is converted to close request details',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      delivery_address: '',
      force: false,
      sat_per_vbyte: '0',
      target_conf: 0,
    }),
    description: 'Defaults are selected',
    expected: makeExpected({
      address: undefined,
      is_force_close: undefined,
      target_confirmations: undefined,
      tokens_per_vbyte: undefined,
    }),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => closeChannelRequest(args), new Error(error), 'Got error');
    } else {
      const res = closeChannelRequest(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return end();
  });
}
