import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { getPublicKey } from './../address/index.js';
import getWalletInfo from './get_wallet_info.js';

const family = 6;
const index = 0;

/** Lookup the identity key for a node

  LND with `walletrpc` build tag and `address:read` permission is suggested

  Otherwise, `info:read` permission is required

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    public_key: <Node Identity Public Key Hex String>
  }
*/
export default ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!lnd) {
          return cbk([400,  'ExpectedAuthenticatedLndToGetIdentityKey']);
        }

        return cbk();
      },

      // Derive identity key
      derive: ['validate', ({}, cbk) => {
        return getPublicKey({family, index, lnd}, (err, res) => {
          // Ignore errors getting the public key through derivation
          if (err) {
            return cbk(null, {});
          }

          return cbk(null, {public_key: res.public_key});
        });
      }],

      // Get all node info if necessary
      getInfo: ['derive', ({derive}, cbk) => {
        // Exit early when the public key was already derived
        if (derive.public_key) {
          return cbk();
        }

        return getWalletInfo({lnd}, cbk);
      }],

      // The final identity of the backing LND node
      identity: ['derive', 'getInfo', ({derive, getInfo}, cbk) => {
        return cbk(null, {
          public_key: derive.public_key || getInfo.public_key,
        });
      }],
    },
    returnResult({reject, resolve, of: 'identity'}, cbk));
  });
};
