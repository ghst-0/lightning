import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { getPeers } from '../../../index.js';

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToGetConnectedPeers'],
  },
  {
    args: {lnd: {default: {disconnectPeer: ({}, cbk) => cbk('err')}}},
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToGetConnectedPeers'],
  },
  {
    args: {lnd: {default: {listPeers: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedGetPeersError', {err: 'err'}],
  },
  {
    args: {lnd: {default: {listPeers: ({}, cbk) => cbk()}}},
    description: 'A response is expected',
    error: [503, 'ExpectedResponseForListPeers'],
  },
  {
    args: {lnd: {default: {listPeers: ({}, cbk) => cbk(null, {})}}},
    description: 'An array response is expected',
    error: [503, 'ExpectedPeersArrayWhenListingPeers'],
  },
  {
    args: {lnd: {default: {listPeers: ({}, cbk) => cbk(null, {peers: [{}]})}}},
    description: 'An array of valid peers is expected',
    error: [503, 'ExpectedPeerAddressInRpcPeer'],
  },
  {
    args: {lnd: {default: {listPeers: ({}, cbk) => cbk(null, {peers: []})}}},
    description: 'Peers are returned',
    expected: {peers: []},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => getPeers(args), error, 'Got expected error');
    } else {
      const {peers} = await getPeers(args);

      deepStrictEqual(peers, expected.peers, 'Got expected peers');
    }
  });
}
