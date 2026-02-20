import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const method = 'walletBalance';
const type = 'default';

/** Get pending chain balance in simple unconfirmed outputs.

  Pending channels limbo balance is not included

  Requires `onchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    pending_chain_balance: <Pending Chain Balance Tokens Number>
  }
*/
export default ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForPendingChainBalance']);
        }

        return cbk();
      },

      // Determine the balance that is in unconfirmed chain outputs
      getUnconfirmed: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (err) {
            return cbk([503, 'GetChainBalanceError', {err}]);
          }

          if (!res || res.unconfirmed_balance === undefined) {
            return cbk([503, 'ExpectedUnconfirmedBalance']);
          }

          return cbk(null, Number(res.unconfirmed_balance));
        });
      }],

      // Sum the chain balance with the timelocked balance
      pendingChainBalance: ['getUnconfirmed', ({getUnconfirmed}, cbk) => {
        return cbk(null, {pending_chain_balance: getUnconfirmed});
      }],
    },
    returnResult({reject, resolve, of: 'pendingChainBalance'}, cbk));
  });
};
