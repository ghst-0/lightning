import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from './../../lnd_requests/index.js';

const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const method = 'labelTransaction';
const notSupportedError = 'unknown service walletrpc.WalletKit';
const type = 'wallet';
const unknownTransactionErr = 'cannot label transaction not known to wallet';

/** Update an on-chain transaction record metadata

  Requires LND built with `walletrpc` build tag

  Requires `onchain:write` permission

  {
    description: <Transaction Label String>
    id: <Transaction Id Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
export default ({description, id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!description) {
          return cbk([400, 'ExpectedDescriptionForChainTransaction']);
        }

        if (!isHash(id)) {
          return cbk([400, 'ExpectedTransactionIdToUpdateChainTransaction']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToUpdateChainTransaction']);
        }

        return cbk();
      },

      // Update the transaction record description
      update: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          label: description,
          overwrite: true,
          txid: Buffer.from(id, 'hex').reverse(),
        },
        err => {
          if (err && err.details === notSupportedError) {
            return cbk([501, 'BackingLndDoesNotSupportUpdatingTransactions']);
          }

          if (err && err.details === unknownTransactionErr) {
            return cbk([404, 'FailedToFindTransactionToUpdate']);
          }

          if (err) {
            return cbk([503, 'UnexpectedErrUpdatingChainTransaction', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
