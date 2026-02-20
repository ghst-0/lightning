import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from './../../lnd_requests/index.js';

const isPublicKey = n => !!n && /^[0-9A-F]{66}$/i.test(n);
const method = 'disconnectPeer';
const type = 'default';

/** Remove a peer if possible

  Requires `peers:remove` permission

  {
    lnd: <Authenticated LND API Object>
    public_key: <Public Key Hex String>
  }

  @returns via cbk or Promise
*/
export default (args, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndForPeerDisconnection']);
        }

        if (!isPublicKey(args.public_key)) {
          return cbk([400, 'ExpectedPublicKeyOfPeerToRemove']);
        }

        return cbk();
      },

      // Disconnect
      disconnect: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({pub_key: args.public_key}, err => {
          if (err) {
            return cbk([503, 'UnexpectedErrorRemovingPeer', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
