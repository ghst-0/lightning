import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const errorUnimplemented = 'unknown service peersrpc.Peers';
const method = 'updateNodeAnnouncement';
const type = 'peers';

/** Update the node color as advertised in the graph

  Note: this method is not supported in LND versions 0.14.5 and below

  Requires LND built with `peersrpc` build tag

  Requires `peers:write` permissions

  {
    color: <Node Color String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
export default ({color, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!color) {
          return cbk([400, 'ExpectedColorToUpdateNodeAnnouncementColor']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToUpdateNodeAnnouncementColor']);
        }

        return cbk();
      },

      // Update the node alias with the updated alias
      updateAlias: ['validate', ({}, cbk) => {
        return lnd[type][method]({color}, (err, res) => {
          if (err && err.details === errorUnimplemented) {
            return cbk([400, 'ExpectedPeersRpcLndBuildTagToUpdateColor']);
          }

          if (err) {
            return cbk([503, 'UnexpectedErrorUpdatingNodeColor', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
