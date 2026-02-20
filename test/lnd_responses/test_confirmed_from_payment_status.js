import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { confirmedFromPaymentStatus } from '../../lnd_responses/index.js';

const makeHtlc = overrides => {
  const htlc = {
    attempt_time_ns: (1e6).toString(),
    resolve_time_ns: (1e6).toString(),
    route: {
      hops: [{
        amt_to_forward_msat: '1000',
        chan_capacity: '1',
        chan_id: '1',
        custom_records: {
          '1': Buffer.alloc(1),
        },
        expiry: 1,
        fee_msat: '1000',
        mpp_record: {
          total_amt_msat: '1000',
          payment_addr: Buffer.alloc(32),
        },
        pub_key: Buffer.alloc(33).toString('hex'),
        tlv_payload: true,
      }],
      total_amt_msat: '1000',
      total_fees_msat: '1000',
      total_time_lock: 1,
    },
    status: 'SUCCEEDED',
  };

  for (const k of Object.keys(overrides)) {
    htlc[k] = overrides[k]
  }

  return htlc;
};

const makeRoute = () => {
  return {
    hops: [{
      amt_to_forward_msat: '1000',
      chan_capacity: 1,
      chan_id: '1',
      custom_records: {
        '1': Buffer.alloc(1),
      },
      expiry: 1,
      fee_msat: '1000',
      mpp_record: {
        total_amt_msat: '1000',
        payment_addr: Buffer.alloc(32),
      },
      pub_key: Buffer.alloc(33).toString('hex'),
      tlv_payload: true,
    }],
    total_amt_msat: '1000',
    total_fees_msat: '1000',
    total_time_lock: 1,
  };
};

const makeArgs = overrides => {
  const args = {
    htlcs: [makeHtlc({})],
    preimage: Buffer.alloc(32),
  };

  for (const k of Object.keys(overrides)) {
    args[k] = overrides[k]
  }

  return args;
};

const makeExpected = overrides => {
  const expected = {
    fee: 1,
    fee_mtokens: '1000',
    hops: [{
      channel: '0x0x1',
      channel_capacity: 1,
      fee: 1,
      fee_mtokens: '1000',
      forward: 1,
      forward_mtokens: '1000',
      public_key: Buffer.alloc(33).toString('hex'),
      timeout: 1,
    }],
    paths: [{
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward: 1,
        forward_mtokens: '1000',
        public_key: Buffer.alloc(33).toString('hex'),
        timeout: 1,
      }],
      mtokens: '1000',
      safe_fee: 1,
      safe_tokens: 1,
      timeout: 1,
      tokens: 1,
    }],
    id: '66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925',
    mtokens: '1000',
    safe_fee: 1,
    safe_tokens: 1,
    secret: Buffer.alloc(32).toString('hex'),
    timeout: 1,
    tokens: 1,
  };

  for (const k of Object.keys(overrides)) {
    expected[k] = overrides[k]
  }

  return expected;
};

const tests = [
  {
    args: makeArgs({htlcs: undefined}),
    description: 'An array of HTLCs is expected',
    error: 'ExpectedArrayOfHtlcsToDeriveConfirmedFromPaymentStatus',
  },
  {
    args: makeArgs({preimage: undefined}),
    description: 'A preimage is expected',
    error: 'ExpectedPreimageBufferToDeriveConfirmFromPaymentStatus',
  },
  {
    args: makeArgs({htlcs: [], route: undefined}),
    description: 'A route or htlc attempt is expected',
    error: 'ExpectedEitherRouteOrAttemptHtlcs',
  },
  {
    args: makeArgs({htlcs: [makeHtlc({status: undefined})]}),
    description: 'A route or htlc attempt is expected',
    error: 'ExpectedSuccessfulHtlcAttemptForConfirmedStatus',
  },
  {
    args: makeArgs({}),
    description: 'Payment status is mapped to confirmed payment details',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({htlcs: [], route: makeRoute({})}),
    description: 'Payment route is mapped to confirmed payment details',
    expected: makeExpected({}),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => confirmedFromPaymentStatus(args), new Error(error), 'Err');
    } else {
      deepStrictEqual(confirmedFromPaymentStatus(args), expected, 'Mapped');
    }

    return end();
  });
}
