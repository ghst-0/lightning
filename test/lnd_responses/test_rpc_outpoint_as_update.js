import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { rpcOutpointAsUpdate } from '../../lnd_responses/index.js';

const makeInfo = overrides => {
  const details = {funding_txid_bytes: Buffer.alloc(32), output_index: 0};

  for (const key of Object.keys(overrides || {})) {
    details[key] = overrides[key]
  }

  return details;
};

const makeExpected = overrides => {
  const expected = {
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  for (const key of Object.keys(overrides || {})) {
    expected[key] = overrides[key]
  }

  return expected;
};

const tests = [
  {
    description: 'Outpoint info is expected',
    error: 'ExpectedUpdateDetailsForRpcOutpointUpdate',
  },
  {
    args: makeInfo({funding_txid_bytes: undefined}),
    description: 'Funding transaction id bytes are expected',
    error: 'ExpectedTransactionIdBufferForRpcOutpoint',
  },
  {
    args: makeInfo({output_index: undefined}),
    description: 'Funding transaction output indexes are expected',
    error: 'ExpectedOutputIndexForRpcOutpoint',
  },
  {
    args: makeInfo({}),
    description: 'Outpoint details are mapped',
    expected: makeExpected({}),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => rpcOutpointAsUpdate(args), new Error(error), 'Got error');
    } else {
      deepStrictEqual(rpcOutpointAsUpdate(args), expected, 'Info mapped');
    }

    return end();
  });
}
