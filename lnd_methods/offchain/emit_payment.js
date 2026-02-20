import {
  confirmedFromPayment,
  failureFromPayment,
  pendingFromPayment,
  routingFailureFromHtlc
} from './../../lnd_responses/index.js';
import payment_states from './payment_states.json' with { type: 'json' };

const { states } = payment_states;
const failedStatus = 'FAILED';
const {isArray} = Array;

/** Emit payment from payment event

  {
    data: {
      status: <Status String>
    }
    emitter: <EventEmitter Object>
  }
*/
export default ({data, emitter}) => {
  try {
    switch (data.status) {
    case states.confirmed:
      return emitter.emit('confirmed', confirmedFromPayment(data));

    case states.failed:
      return emitter.emit('failed', failureFromPayment(data));

    case states.paying:
      const hasHtlcs = !!data && isArray(data.htlcs) && data.htlcs.length > 0;

      // Exit early when no HTLCs are attached
      if (!hasHtlcs) {
        return;
      }

      // Emit routing failures
      for (const htlc of data.htlcs.filter(n => n.status === failedStatus)) {
        emitter.emit('routing_failure', routingFailureFromHtlc(htlc))
      }

      // Exit early when the HTLCs have no pending payments
      if (!data.htlcs.some(n => n.status === states.paying)) {
        return;
      }

      return emitter.emit('paying', pendingFromPayment(data));

    default:
      return;
    }
  } catch (err) {
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', [503, err.message]);
  }
};
