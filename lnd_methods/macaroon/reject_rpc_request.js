import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

const defaultRejectMessage = 'RpcRequestRejected';

/** Accept an RPC request

  {
    id: <Request or Response Id Number To Accept>
    [message]: <Rejection Message String>
    subscription: <RPC Request Stream Object>
  }

  @returns via cbk or Promise
*/
export default ({id, message, subscription}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!id) {
          return cbk([400, 'ExpectedRequestIdToRejectRpcRequest']);
        }

        if (!subscription) {
          return cbk([400, 'ExpectedRpcSubscriptionToRejectRpcRequest']);
        }

        return cbk();
      },

      // Send reject feedback to the stream
      reject: ['validate', ({}, cbk) => {
        return subscription.write({
          feedback: {
            error: message || defaultRejectMessage,
            replace_response: false,
          },
          ref_msg_id: id,
        },
        err => {
          if (err) {
            return cbk([503, 'UnexpectedErrorRejectingRpcRequest', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
