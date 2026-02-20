import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { rpcFailedPolicyAsFail } from '../../lnd_responses/index.js';

const makeArgs = override => {
  const args = {
    outpoint: {
      txid_bytes: Buffer.alloc(32),
      output_index: 0,
    },
    reason: 'reason',
    update_error: 'description',
  };

  for (const key of Object.keys(override)) {
    args[key] = override[key]
  }

  return args;
};

const tests = [
  {
    args: null,
    description: 'Rpc failure is required to derive failure details',
    error: 'ExpectedPolicyFailureToDeriveFailureDetails',
  },
  {
    args: makeArgs({outpoint: undefined}),
    description: 'A funding tx outpoint is expected',
    error: 'ExpectedFundingTransactionOutpointForPolicyFailDetails',
  },
  {
    args: makeArgs({outpoint: {}}),
    description: 'Funding tx bytes are expected',
    error: 'ExpectedFundingTxIdBytesForPolicyFailDetails',
  },
  {
    args: makeArgs({outpoint: {txid_bytes: Buffer.alloc(32)}}),
    description: 'Funding tx output index is expected',
    error: 'ExpectedFundingTxOutputIndexForPolicyFailDetails',
  },
  {
    args: makeArgs({}),
    description: 'RPC policy fail is mapped to update fail',
    expected: {
      failure: 'description',
      is_pending_channel: false,
      is_unknown_channel: false,
      is_invalid_policy: false,
      transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
      transaction_vout: 0,
    },
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => rpcFailedPolicyAsFail(args), new Error(error), 'Got error');
    } else {
      const res = rpcFailedPolicyAsFail(args);

      deepStrictEqual(res, expected, 'Got expected details');
    }

    return end();
  });
}
