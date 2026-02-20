import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { rpcPeerMessageAsMessage } from '../../lnd_responses/index.js';

const makeArgs = overrides => {
  const response = {
    data: Buffer.alloc(1),
    peer: Buffer.alloc(33, 3),
    type: 44444,
  };

  for (const key of Object.keys(overrides || {})) {
    response[key] = overrides[key]
  }

  return response;
};


const makeExpected = overrides => {
  const expected = {
    message: '00',
    public_key: '030303030303030303030303030303030303030303030303030303030303030303',
    type: 44444,
  };

  for (const key of Object.keys(overrides || {})) {
    expected[key] = overrides[key]
  }

  return expected;
};

const tests = [
  {
    description: 'RPC peer message is expected',
    error: 'ExpectedRpcMessageToDerivePeerMessage',
  },
  {
    args: makeArgs({data: undefined}),
    description: 'data is expected',
    error: 'ExpectedPeerMessageDataToDerivePeerMessage',
  },
  {
    args: makeArgs({peer: undefined}),
    description: 'peer public key is expected',
    error: 'ExpectedPeerPublicKeyBytesToDerivePeerMessage',
  },
  {
    args: makeArgs({type: undefined}),
    description: 'type is expected',
    error: 'ExpectedCustomMessageTypeNumberToDeriveMessage',
  },
  {
    args: makeArgs({}),
    description: 'RPC peer message is mapped to message',
    expected: makeExpected({}),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => rpcPeerMessageAsMessage(args), new Error(error), 'Got err');
    } else {
      deepStrictEqual(rpcPeerMessageAsMessage(args), expected, 'Mapped');
    }

    return end();
  });
}
