import 'node:assert';
import 'node:assert';
import test from 'node:test';
import 'node:assert';
import { ignoreAsIgnoredNodes } from './../../lnd_requests/index.js';

const tests = [
  {
    args: {
      ignore: [
        {from_public_key: '00'},
        {channel: '1x2x3', from_public_key: '01'},
      ],
    },
    description: 'From ignore node is returned',
    expected: {ignore: '00'},
  },
  {
    args: {
      ignore: [
        {channel: '1x2x3', to_public_key: '01'},
        {from_public_key: '00'},
      ],
    },
    description: 'To ignored node is returned',
    expected: {ignore: '00'},
  },
  {
    args: {},
    description: 'No ignore means empty result',
    expected: {},
  },
  {
    args: {ignore: 'foo'},
    description: 'Ignore must be array',
    error: 'ExpectedArrayOfIgnoresForIgnoredNodes',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (error) {
      throws(() => ignoreAsIgnoredNodes(args), new Error(error), 'Got error');
    } else if (!!expected.ignore) {
      const {ignored} = ignoreAsIgnoredNodes(args);

      const [ignore] = ignored;

      deepStrictEqual(ignore.toString('hex'), expected.ignore, 'Ignore map');
    } else {
      strictEqual(ignoreAsIgnoredNodes(args).ignored, undefined, 'No ignored');
    }

    return end();
  });
});
