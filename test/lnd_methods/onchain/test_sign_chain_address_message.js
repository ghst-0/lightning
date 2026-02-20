import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { signChainAddressMessage } from '../../../index.js';

const makeArgs = override => {
  const args = {
    address: 'address',
    lnd: {
      wallet: {
        signMessageWithAddr: ({}, cbk) => cbk(null, {signature: '12345'}),
      },
    },
    message: 'message',
  };

  for (const attr of Object.keys(override)) {
    args[attr] = override[attr]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({address: undefined}),
    description: 'A chain address is required to sign a message',
    error: [400, 'ExpectedChainAddressToSignChainAddressMessage'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to sign a message',
    error: [400, 'ExpectedLndToSignChainAddressMessage'],
  },
  {
    args: makeArgs({message: undefined}),
    description: 'A message is required to sign a message',
    error: [400, 'ExpectedMessageToSignChainAddressMessage'],
  },
  {
    args: makeArgs({
      lnd: {
        wallet: {
          signMessageWithAddr: ({}, cbk) => cbk({
            details: 'unknown method SignMessageWithAddr for service walletrpc.WalletKit',
          }),
        },
      },
    }),
    description: 'Unsupported error is returned',
    error: [501, 'BackingLndDoesNotSupportSigningChainMessages'],
  },
  {
    args: makeArgs({
      lnd: {wallet: {signMessageWithAddr: ({}, cbk) => cbk('err')}},
    }),
    description: 'Unexpected error is returned',
    error: [503, 'UnexpectedSignChainAddressMessageError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {signMessageWithAddr: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseToSignChainAddrMessageRequest'],
  },
  {
    args: makeArgs({
      lnd: {wallet: {signMessageWithAddr: ({}, cbk) => cbk(null, {})}},
    }),
    description: 'A signature is expected',
    error: [503, 'ExpectedSignatureForChainMessageSignRequest'],
  },
  {
    args: makeArgs({}),
    description: 'Signature produced',
    expected: {signature: 'd76df8'},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => signChainAddressMessage(args), error, 'Got error');
    } else {
      deepStrictEqual(await signChainAddressMessage(args), expected, 'Result');
    }
  });
}
