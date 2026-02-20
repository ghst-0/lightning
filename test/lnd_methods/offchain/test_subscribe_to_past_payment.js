import test from 'node:test';
import { throws } from 'node:assert/strict';
import { subscribeToPastPayment } from '../../../index.js';

const tests = [
  {
    args: {},
    description: 'The id of a past payment is required',
    error: 'ExpectedIdOfPastPaymentToSubscribeTo',
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'LND is required',
    error: 'ExpectedAuthenticatedLndToSubscribeToPastPaymentStatus',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => subscribeToPastPayment(args), new Error(error), 'Got err');
    } else {
      subscribeToPastPayment(args);
    }

    return end();
  });
}
