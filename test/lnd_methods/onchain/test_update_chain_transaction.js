import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { updateChainTransaction } from '../../../lnd_methods/index.js';

const makeLnd = ({err}) => {
  return {
    wallet: {
      labelTransaction: (args, cbk) => {
        return cbk(err);
      },
    },
  };
};

const makeArgs = overrides => {
  const args = {
    description: 'description',
    id: Buffer.alloc(32).toString('hex'),
    lnd: makeLnd({}),
  };

  for (const key of Object.keys(overrides)) {
    args[key] = overrides[key]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({description: undefined}),
    description: 'A description is expected when updating chain transactions',
    error: [400, 'ExpectedDescriptionForChainTransaction'],
  },
  {
    args: makeArgs({id: undefined}),
    description: 'A transaction id is expected to update a chain transaction',
    error: [400, 'ExpectedTransactionIdToUpdateChainTransaction'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND API Object is expected when updating chain transactions',
    error: [400, 'ExpectedLndToUpdateChainTransaction'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service walletrpc.WalletKit'}}),
    }),
    description: 'Unsupported service returns unsupported error',
    error: [501, 'BackingLndDoesNotSupportUpdatingTransactions'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        err: {details: 'cannot label transaction not known to wallet'},
      }),
    }),
    description: 'Unknown transaction returns error',
    error: [404, 'FailedToFindTransactionToUpdate'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrUpdatingChainTransaction', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Normally a transaction is updated successfully',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => updateChainTransaction(args), error, 'Got error');
    } else {
      await updateChainTransaction(args);
    }
  });
}
