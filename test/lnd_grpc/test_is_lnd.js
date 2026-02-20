import { equal } from 'node:assert/strict';
import test from 'node:test';
import { isLnd } from '../../lnd_grpc/index.js';

const tests = [
  {
    args: {},
    description: 'No LND passed means it is not an LND',
    expected: false,
  },
  {
    args: {lnd: {}},
    description: 'There is an LND but the type is missing',
    expected: false,
  },
  {
    args: {lnd: {}, type: 'type'},
    description: 'There is an LND but the type is missing',
    expected: false,
  },
  {
    args: {lnd: {type: {}}, type: 'type'},
    description: 'There is an LND but the method is missing',
    expected: false,
  },
  {
    args: {lnd: {type: {method: 'method'}}, method: 'method', type: 'type'},
    description: 'There is an LND but the method is missing',
    expected: true,
  },
];

for (const { args, description, expected } of tests) {
  test(description, (t, end) => {
    const res = isLnd(args);

    equal(res, expected, 'LND status is as expected');

    return end();
  });
}
