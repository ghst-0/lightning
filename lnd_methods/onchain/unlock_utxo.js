import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from './../../lnd_requests/index.js';

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !Number.isNaN(n);
const method = 'releaseOutput';
const type = 'wallet';

/** Unlock UTXO

  Requires `onchain:write` permission

  Requires LND built with `walletrpc` build tag

  {
    id: <Lock Id Hex String>
    lnd: <Authenticated LND API Object>
    transaction_id: <Unspent Transaction Id Hex String>
    transaction_vout: <Unspent Transaction Output Index Number>
  }

  @returns via cbk or Promise
*/
export default (args, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHash(args.id)) {
          return cbk([400, 'ExpectedUtxoLockIdToUnlockUtxo']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToUnlockUtxo']);
        }

        if (!isHash(args.transaction_id)) {
          return cbk([400, 'ExpectedUnspentTransactionIdToUnlockUtxo']);
        }

        if (!isNumber(args.transaction_vout)) {
          return cbk([400, 'ExpectedTransactionOutputIndexToUnlockUtxo']);
        }

        return cbk();
      },

      // Unlock the UTXO
      unlock: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          id: hexAsBuffer(args.id),
          outpoint: {
            output_index: args.transaction_vout,
            txid_str: args.transaction_id,
          },
        },
        err => {
          if (err) {
            return cbk([503, 'UnexpectedErrorUnlockingUtxo', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
