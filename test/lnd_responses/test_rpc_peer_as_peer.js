import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { rpcPeerAsPeer } from '../../lnd_responses/index.js';

const makePeer = overrides => {
  const response = {
    address: 'address',
    bytes_recv: '1',
    bytes_sent: '1',
    features: {
      '1': {
        is_known: true,
        is_required: false,
      },
    },
    flap_count: 0,
    inbound: true,
    last_flap_ns: '0',
    ping_time: '1',
    pub_key: '00',
    sat_recv: '1',
    sat_sent: '1',
    sync_type: 'ACTIVE_SYNC',
  };

  for (const key of Object.keys(overrides || {})) {
    response[key] = overrides[key]
  }

  return response;
};

const makeExpected = overrides => {
  const expected = {
    bytes_received: 1,
    bytes_sent: 1,
    features: [{
      bit: 1,
      is_known: true,
      is_required: false,
      type: 'data_loss_protection',
    }],
    is_inbound: true,
    is_sync_peer: true,
    last_reconnection: undefined,
    ping_time: 1,
    public_key: '00',
    reconnection_rate: undefined,
    socket: 'address',
    tokens_received: 1,
    tokens_sent: 1,
  };

  for (const key of Object.keys(overrides || {})) {
    expected[key] = overrides[key]
  }

  return expected;
};

const tests = [
  {
    description: 'RPC peer is expected',
    error: 'ExpectedRpcPeerToDerivePeerDetails',
  },
  {
    args: makePeer({address: undefined}),
    description: 'The peer address is expected',
    error: 'ExpectedPeerAddressInRpcPeer',
  },
  {
    args: makePeer({bytes_recv: undefined}),
    description: 'Bytes received is expected',
    error: 'ExpectedPeerBytesReceivedInRpcPeer',
  },
  {
    args: makePeer({bytes_sent: undefined}),
    description: 'Bytes sent is expected',
    error: 'ExpectedPeerBytesSentInRpcPeer',
  },
  {
    args: makePeer({features: undefined}),
    description: 'The peer features are expected',
    error: 'ExpectedPeerFeaturesInRpcPeer',
  },
  {
    args: makePeer({flap_count: undefined}),
    description: 'Flat count is expected',
    error: 'ExpectedPeerFlapCounterInRpcPeer',
  },
  {
    args: makePeer({inbound: undefined}),
    description: 'Inbound peer status is expected',
    error: 'ExpectedPeerInboundStatusInRpcPeer',
  },
  {
    args: makePeer({last_flap_ns: undefined}),
    description: 'Last flap time is expected',
    error: 'ExpectedPeerLastFlapTimeInRpcPeer',
  },
  {
    args: makePeer({ping_time: undefined}),
    description: 'Peer ping time is expected',
    error: 'ExpectedPeerPingTimeInRpcPeer',
  },
  {
    args: makePeer({pub_key: undefined}),
    description: 'Peer public key is expected',
    error: 'ExpectedPeerPublicKeyInRpcPeer',
  },
  {
    args: makePeer({sat_recv: undefined}),
    description: 'Peer received amount is expected',
    error: 'ExpectedReceiveAmountInRpcPeer',
  },
  {
    args: makePeer({sat_sent: undefined}),
    description: 'Peer sent amount is expected',
    error: 'ExpectedSentAmountInRpcPeer',
  },
  {
    args: makePeer({}),
    description: 'RPC peer is mapped to peer details',
    expected: makeExpected({}),
  },
  {
    args: makePeer({ping_time: '-1'}),
    description: 'Ping time is set to zero when negative',
    expected: makeExpected({ping_time: 0}),
  },
  {
    args: makePeer({sync_type: 'PASSIVE_SYNC'}),
    description: 'RPC passive sync peer is mapped to peer details',
    expected: makeExpected({is_sync_peer: false}),
  },
  {
    args: makePeer({sync_type: 'UNKNOWN'}),
    description: 'RPC unknown sync peer is mapped to peer details',
    expected: makeExpected({is_sync_peer: undefined}),
  },
  {
    args: makePeer({flap_count: 1, last_flap_ns: '1'}),
    description: 'Flapping data is mapped to reconnection details',
    expected: makeExpected({
      last_reconnection: '1970-01-01T00:00:00.000Z',
      reconnection_rate: 1,
    }),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => rpcPeerAsPeer(args), new Error(error), 'Got expected err');
    } else {
      deepStrictEqual(rpcPeerAsPeer(args), expected, 'RPC peer mapped');
    }

    return end();
  });
}
