import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const action = 0;
const errorUnimplemented = 'unknown service peersrpc.Peers';
const method = 'updateNodeAnnouncement';
const type = 'peers';

/** Add a new advertised p2p socket address

  Note: this method is not supported in LND versions 0.14.5 and below

  Requires LND built with `peersrpc` build tag

  Requires `peers:write` permissions

  {
    lnd: <Authenticated LND API Object>
    socket: <Add Socket Address String>
  }

  @returns via cbk or Promise
*/
export default ({lnd, socket}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToAddExternalSocket']);
        }

        if (!socket) {
          return cbk([400, 'ExpectedHostAndPortOfSocketToAdd']);
        }

        return cbk();
      },

      // Add external socket to be advertised
      add: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          address_updates: [{action, address: socket}],
        },
        err => {
          if (err && err.details === errorUnimplemented) {
            return cbk([400, 'ExpectedPeersRpcLndBuildTagToAddSocket']);
          }

          if (err) {
            return cbk([503, 'UnexpectedErrorAddingExternalSocket', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
