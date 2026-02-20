import EventEmitter from 'node:events';
import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { requestBatchedFeeIncrease } from '../../../lnd_methods/index.js';

const makeLnd = overrides => {
  const res = {status: 'status'};

  for (const k of Object.keys(overrides)) {
    res[k] = overrides[k]
  }

  return {
    chain: {
      registerBlockEpochNtfn: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => emitter.emit('data', {
          hash: Buffer.alloc(32),
          height: 500,
        }));

        return emitter;
      },
    },
    wallet: {bumpFee: (args, cbk) => cbk(null, res)},
  };
};

const makeArgs = overrides => {
  const args = {
    lnd: makeLnd({}),
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  for (const key of Object.keys(overrides)) {
    args[key] = overrides[key]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'An LND object is required',
    error: [400, 'ExpectedLndToRequestChainFeeIncrease'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A transaction id is required',
    error: [400, 'ExpectedTransactionIdToRequestChainFeeIncrease'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A tx output index is required',
    error: [400, 'ExpectedTransactionOutputIndexToRequestFeeBump'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {
          bumpFee: ({}, cbk) => cbk({
            details: 'the passed output does not belong to the wallet',
          }),
        },
      },
    }),
    description: 'Unknown UTXO error is passed back',
    error: [404, 'SpecifiedUtxoNotFoundInWalletUtxos'],
  },
  {
    args: makeArgs({lnd: {wallet: {bumpFee: ({}, cbk) => cbk('err')}}}),
    description: 'Errors are passed back',
    error: [503, 'UnexpectedErrorRequestingBatchIncrease', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {bumpFee: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseToBatchedFeeIncreaseRequest'],
  },
  {
    args: makeArgs({lnd: {wallet: {bumpFee: ({}, cbk) => cbk(null, {})}}}),
    description: 'A response status is expected',
    error: [503, 'ExpectedStatusOfBatchedFeeIncrease'],
  },
  {
    args: makeArgs({}),
    description: 'Fee bump is requested',
  },
  {
    args: makeArgs({max_height: 1000}),
    description: 'Fee bump is requested with a height',
  },
  {
    args: makeArgs({max_height: 2}),
    description: 'Fee bump is requested with a low height',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(requestBatchedFeeIncrease(args), error, 'Got error');
    } else {
      await requestBatchedFeeIncrease(args);
    }
  });
}
