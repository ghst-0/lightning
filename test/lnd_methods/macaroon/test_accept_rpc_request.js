import { rejects } from 'node:assert/strict';
import test from 'node:test';
import method from '../../../lnd_methods/macaroon/accept_rpc_request.js';

const tests = [
  {
    args: {},
    description: 'A request id is required to accept an RPC request',
    error: [400, 'ExpectedRequestIdToAcceptRpcRequest'],
  },
  {
    args: {id: 1},
    description: 'A subscription is required to accept an RPC request',
    error: [400, 'ExpectedRpcSubscriptionToAcceptRpcRequest'],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk('err')}},
    description: 'Request error passed back',
    error: [503, 'UnexpectedErrorAcceptingRpcRequest', {err: 'err'}],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk()}},
    description: 'Request accepted',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => method(args), error, 'Got expected error');
    } else {
      await method(args);
    }
  });
}
