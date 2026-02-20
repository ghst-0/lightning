import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const method = 'walletBalance';
const type = 'default';

/** Get balance on the chain.

  Requires `onchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    chain_balance: <Confirmed Chain Balance Tokens Number>
  }
*/
export default ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToRetrieveChainBalance']);
        }

        return cbk();
      },

      // Get wallet chain balance
      getBalance: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (err) {
            return cbk([503, 'UnexpectedErrorWhenGettingChainBalance', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForChainBalanceRequest']);
          }

          if (res.confirmed_balance === undefined) {
            return cbk([503, 'ExpectedConfirmedBalanceInBalanceResponse']);
          }

          return cbk(null, {chain_balance: Number(res.confirmed_balance)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getBalance'}, cbk));
  });
};
