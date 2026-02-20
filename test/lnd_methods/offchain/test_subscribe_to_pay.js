import test from 'node:test';
import { throws } from 'node:assert/strict';
import method from '../../../lnd_methods/offchain/subscribe_to_pay.js';

const tests = [
  {
    args: {cltv_delta: 1, request: 'request'},
    description: 'A CLTV delta cannot be specified when request is set',
    error: 'UnexpectedCltvDeltaWhenSubscribingToPayPaymentRequest',
  },
  {
    args: {},
    description: 'A destination or a request is required to pay',
    error: 'ExpectedDestinationWhenPaymentRequestNotSpecified',
  },
  {
    args: {destination: 'destination'},
    description: 'An id is required to pay to a destination',
    error: 'ExpectedPaymentHashWhenPaymentRequestNotSpecified',
  },
  {
    args: {request: 'request'},
    description: 'LND is required to subscribe to pay',
    error: 'ExpectedAuthenticatedLndToSubscribeToPayment',
  },
  {
    args: {
      destination: 'destination',
      id: 'id',
      lnd: {router: {sendPaymentV2: {}}},
    },
    description: 'LND is required to subscribe to pay',
    error: 'ExpectedTokenAmountToPayWhenPaymentRequestNotSpecified',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => method(args), new Error(error), 'Got err');

      return end();
    }
    return end();
  });
}
