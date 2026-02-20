import EventEmitter from 'node:events';
import { strictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { subscribeToChainSpend } from '../../../lnd_methods/index.js';

const emptyTx = '01000000000000000000';

const tests = [
  {
    args: {
      min_height: 100,
      output_script: 'a914898ffd60ad6091221250047a9f2bd6456190263487',
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
    },
    description: 'Confirmation emitted for chain spend',
    expected: {height: 200, transaction: emptyTx, vin: 0},
  },
  {
    args: {},
    description: 'An lnd is required',
    error: 'ExpectedLndGrpcApiToSubscribeToSpendConfirmations',
  },
  {
    args: {lnd: {chain: {registerSpendNtfn: () => {}}}},
    description: 'Min height is required',
    error: 'ExpectedMinHeightToSubscribeToChainSpend',
  },
  {
    args: {lnd: {chain: {registerSpendNtfn: () => {}}}, min_height: 1},
    description: 'An address or output script is required',
    error: 'ExpectedRecognizedAddressFormatToWatchForSpend',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => subscribeToChainSpend(args), new Error(error), 'Got error');

      return end();
    }

    const emitter = new EventEmitter();

    args.lnd = {chain: {registerSpendNtfn: ({}) => emitter}};

    const sub = subscribeToChainSpend(args);

    sub.on('confirmation', ({height, transaction, vin}) => {
      strictEqual(height, expected.height, 'Got height');
      strictEqual(transaction, expected.transaction, 'Got transaction');
      strictEqual(vin, expected.vin, 'Got vin');

      return end();
    });

    emitter.emit('data', {
      spend: {
        raw_spending_tx: Buffer.from(emptyTx, 'hex'),
        spending_height: 200,
        spending_input_index: 0,
      },
    });
  });
}
