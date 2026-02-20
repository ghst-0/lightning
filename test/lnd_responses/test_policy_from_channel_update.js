import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { policyFromChannelUpdate } from '../../lnd_responses/index.js';

const makeInput = ({overrides, update}) => {
  const response = {
    key: 'aa',
    keys: ['aa', 'ab'],
    update: {
      base_fee: 1,
      channel_flags: 1,
      fee_rate: 1,
      htlc_maximum_msat: 1,
      htlc_minimum_msat: 1,
      time_lock_delta: 1,
      timestamp: 1,
    },
  };

  for (const key of Object.keys(overrides || {})) {
    response[key] = overrides[key]
  }

  for (const key of Object.keys(update || {})) {
    response.update[key] = update[key]
  }

  return response;
};


const makeExpected = overrides => {
  const expected = {
    base_fee_mtokens: '1',
    cltv_delta: 1,
    fee_rate: 1,
    is_disabled: true,
    max_htlc_mtokens: 1,
    min_htlc_mtokens: 1,
    public_key: 'aa',
    updated_at: '1970-01-01T00:00:01.000Z',
  };

  for (const key of Object.keys(overrides || {})) {
    expected[key] = overrides[key]
  }

  return expected;
};

const tests = [
  {
    args: {},
    description: 'A channel update is expected',
    error: 'ExpectedChannelUpdateToDerivePolicy',
  },
  {
    args: makeInput({update: {base_fee: undefined}}),
    description: 'A base fee is expected',
    error: 'ExpectedBaseFeeInChannelUpdate',
  },
  {
    args: makeInput({update: {channel_flags: undefined}}),
    description: 'Channel flags are expected',
    error: 'ExpectedChannelFlagsInChannelUpdate',
  },
  {
    args: makeInput({update: {fee_rate: undefined}}),
    description: 'Fee rate is expected',
    error: 'ExpectedFeeRateWhenDerivingPolicyFromChannelUpdate',
  },
  {
    args: makeInput({update: {htlc_minimum_msat: undefined}}),
    description: 'HTLC minimum msat is expected',
    error: 'ExpectedMinHtlcMillitokensInChannelUpdate',
  },
  {
    args: makeInput({update: {time_lock_delta: undefined}}),
    description: 'CLTV delta is expected',
    error: 'ExpectedCltvDeltaToConvertChannelUpdateToPolicy',
  },
  {
    args: makeInput({update: {timestamp: undefined}}),
    description: 'A timestamp is expected',
    error: 'ExpectedTimestampForChannelUpdatePolicy',
  },
  {
    args: makeInput({}),
    description: 'A channel update is mapped to a policy',
    expected: makeExpected({}),
  },
  {
    args: makeInput({overrides: {key: 'aa', keys: ['aa']}}),
    description: 'Disabled is unknown when a peer pubkey is missing',
    expected: makeExpected({is_disabled: undefined}),
  },
  {
    args: makeInput({overrides: {key: 'ab'}}),
    description: 'Disabled is flipped on pubkey ordering',
    expected: makeExpected({is_disabled: false, public_key: 'ab'}),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => policyFromChannelUpdate(args), new Error(error), 'Got err');
    } else {
      deepStrictEqual(policyFromChannelUpdate(args), expected, 'Map policy');
    }

    return end();
  });
}
