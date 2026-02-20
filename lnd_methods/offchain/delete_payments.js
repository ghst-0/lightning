import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from './../../lnd_requests/index.js';

const method = 'deleteAllPayments';
const type = 'default';

/** Delete all records of payments

  Requires `offchain:write` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
export default ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToDeleteAllPayments']);
        }

        return cbk();
      },

      // Delete all payments
      deletePayments: ['validate', ({}, cbk) => {
        return lnd[type][method]({all_payments: true}, err => {
          if (err) {
            return cbk([503, 'UnexpectedErrorDeletingAllPayments', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
