import { deepStrictEqual, rejects } from 'node:assert/strict';
import EventEmitter from 'node:events';
import test from 'node:test';
import { isDestinationPayable } from '../../../index.js';

const makePaymentData = overrides => {
  const data = {
    creation_date: '1',
    creation_time_ns: '0',
    failure_reason: 'FAILURE_REASON_TIMEOUT',
    fee_msat: '1000',
    fee_sat: '1',
    htlcs: [{
      attempt_time_ns: '1000000',
      failure: {
        channel_update: {
          base_fee: '1000',
          chain_hash: Buffer.alloc(32),
          chan_id: '1',
          channel_flags: 1,
          extra_opaque_data: Buffer.alloc(1),
          fee_rate: 1,
          htlc_maximum_msat: '1000',
          htlc_minimum_msat: '1000',
          message_flags: 1,
          signature: Buffer.alloc(71),
          time_lock_delta: 1,
          timestamp: 1,
        },
        code: 'UNREADABLE_FAILURE',
        failure_source_index1: 1,
        height: 1,
        htlc_msat: '1000',
      },
      resolve_time_ns: '1000000',
      route: {
        hops: [{
          amt_to_forward_msat: '1000',
          chan_id: '1',
          chan_capacity: 1,
          expiry: 1,
          fee_msat: '1000',
          mpp_record: {
            payment_addr: Buffer.alloc(32),
            total_amt_msat: '1000',
          },
          pub_key: Buffer.alloc(33).toString('hex'),
          tlv_payload: true,
        }],
        total_amt: '1',
        total_amt_msat: '1000',
        total_fees: '1',
        total_fees_msat: '1000',
        total_time_lock: 1,
      },
      status: 'FAILED',
    }],
    path: [Buffer.alloc(33).toString('hex'), Buffer.alloc(33).toString('hex')],
    payment_hash: Buffer.alloc(32).toString('hex'),
    payment_index: '1',
    payment_preimage: Buffer.alloc(32).toString('hex'),
    payment_request: 'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4uh4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgzufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4',
    status: 'FAILED',
    value: '1',
    value_msat: '1000',
    value_sat: '1',
  };

  for (const k of Object.keys(overrides)) {
    data[k] = overrides[k]
  }

  return data;
};

const makeLnd = args => {
  return {
    chain: {
      registerBlockEpochNtfn: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => emitter.emit('error', 'err'));

        return emitter;
      },
    },
    default: {
      getInfo: ({}, cbk) => {
        return cbk(null, {
          alias: 'alias',
          best_header_timestamp: 1,
          block_hash: '00',
          block_height: 1,
          chains: [{chain: 'chain', network: 'network'}],
          color: '#000000',
          features: {'1': {is_known: true, is_required: false}},
          identity_pubkey: Buffer.alloc(33).toString('hex'),
          num_active_channels: 1,
          num_peers: 1,
          num_pending_channels: 1,
          synced_to_chain: true,
          uris: [],
          version: 'version',
        });
      },
    },
    router: {
      sendPaymentV2: ({}) => {
        const data = args.data || makePaymentData({});
        const emitter = new EventEmitter();

        if (args.is_end) {
          process.nextTick(() => emitter.emit('end'));
        } else if (args.err) {
          process.nextTick(() => emitter.emit('error', args.err));
        } else {
          process.nextTick(() => emitter.emit('data', data));
        }

        return emitter;
      },
    },
  };
};

const makeArgs = overrides => {
  const args = {
    cltv_delta: 1,
    destination: Buffer.alloc(33).toString('hex'),
    features: [{bit: 1}],
    id: Buffer.alloc(32).toString('hex'),
    incoming_peer: Buffer.alloc(33).toString('hex'),
    lnd: makeLnd({}),
    max_fee: 1,
    max_fee_mtokens: '1000',
    messages: [{
      type: '1',
      value: Buffer.alloc(1).toString('hex'),
    }],
    mtokens: '1000',
    outgoing_channel: '0x0x1',
    pathfinding_timeout: 1,
    routes: [[{
      base_fee_mtokens: '1000',
      channel: '0x0x1',
      cltv_delta: 1,
      fee_rate: 1,
      public_key: Buffer.alloc(33).toString('hex'),
    }]],
    tokens: 1,
  };

  for (const k of Object.keys(overrides)) {
    args[k] = overrides[k]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({destination: undefined}),
    description: 'The payment destination is required',
    error: [400, 'ExpectedDestinationToCheckPayability'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndWithRouterToTestPayable'],
  },
  {
    args: makeArgs({
      lnd: {
        chain: {
          registerBlockEpochNtfn: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
        default: {
          getInfo: ({}, cbk) => {
            return cbk('err');
          },
        },
        router: {
          sendPaymentV2: ({}) => {
            const emitter = new EventEmitter();

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
      },
    }),
    description: 'A payment attempt times out',
    error: [
      503,
      'UnexpectedErrorCheckingPayability',
      {err: [503, 'UnexpectedPaymentError', {err: 'err'}]},
    ],
  },
  {
    args: makeArgs({}),
    description: 'A payment attempt times out',
    expected: {is_payable: false},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => isDestinationPayable(args), error, 'Got error');
    } else {
      const payment = await isDestinationPayable(args);

      deepStrictEqual(payment, expected, 'Got expected payment');
    }
  });
}
