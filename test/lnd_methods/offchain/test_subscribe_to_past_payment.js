import test from 'node:test';
import 'node:assert';
import { subscribeToPastPayment } from './../../../index.js';

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

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (error) {
      throws(() => subscribeToPastPayment(args), new Error(error), 'Got err');
    } else {
      subscribeToPastPayment(args);
    }

    return end();
  });
});
