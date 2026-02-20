import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const connectionFailure = '14 UNAVAILABLE: Connect Failed';
const expectedMnemonicLength = 24;
const {isArray} = Array;
const method = 'genSeed';
const type = 'unlocker';
const utf8AsBuffer = utf8 => Buffer.from(utf8, 'utf8');

/** Create a wallet seed

  Requires unlocked lnd and unauthenticated LND API Object

  {
    lnd: <Unauthenticated LND API Object>
    [passphrase]: <Seed Passphrase String>
  }

  @returns via cbk or Promise
  {
    seed: <Cipher Seed Mnemonic String>
  }
*/
export default ({lnd, passphrase}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedNonAuthenticatedLndForSeedCreation']);
        }

        return cbk();
      },

      // Create seed
      createSeed: ['validate', ({}, cbk) => {
        const pass = passphrase ? utf8AsBuffer(passphrase) : undefined;

        return lnd[type][method]({aezeed_passphrase: pass}, (err, res) => {
          if (err && err.message === connectionFailure) {
            return cbk([503, 'UnexpectedConnectionFailure']);
          }

          if (err) {
            return cbk([503, 'UnexpectedCreateSeedError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForSeedCreation']);
          }

          if (!isArray(res.cipher_seed_mnemonic)) {
            return cbk([503, 'ExpectedCipherSeedMnemonic']);
          }

          if (res.cipher_seed_mnemonic.length !== expectedMnemonicLength) {
            return cbk([503, 'UnexpectedCipherSeedMnemonicLength']);
          }

          return cbk(null, {seed: res.cipher_seed_mnemonic.join(' ')});
        });
      }],
    },
    returnResult({reject, resolve, of: 'createSeed'}, cbk));
  });
};
