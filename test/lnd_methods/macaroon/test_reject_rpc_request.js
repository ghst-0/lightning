import { rejects } from 'node:assert/strict';
import test from 'node:test';
import method from '../../../lnd_methods/macaroon/reject_rpc_request.js';

const tests = [
  {
    args: {},
    description: 'A request id is required to reject an RPC request',
    error: [400, 'ExpectedRequestIdToRejectRpcRequest'],
  },
  {
    args: {id: 1},
    description: 'A subscription is required to reject an RPC request',
    error: [400, 'ExpectedRpcSubscriptionToRejectRpcRequest'],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk('err')}},
    description: 'Request error passed back',
    error: [503, 'UnexpectedErrorRejectingRpcRequest', {err: 'err'}],
  },
  {
    args: {id: 1, subscription: {write: ({}, cbk) => cbk()}},
    description: 'Request accepted',
  },
  {
    args: {id: 1, message: 'msg', subscription: {write: ({}, cbk) => cbk()}},
    description: 'Request accepted with message',
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
