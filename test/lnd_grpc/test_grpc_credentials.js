import 'node:assert';
import test from 'node:test';
import 'node:assert';
import grpcCredentials from './../../lnd_grpc/grpc_credentials.js';

const tests = [
  {
    args: {macaroon: '00'},
    description: 'gRPC credentials are returned',
    expected: {},
  },
];

tests.forEach(({args, error, description}) => {
  return test(description, (t, end) => {
    if (error) {
      throws(() => grpcCredentials(args), new Error(error), 'Got error');
    } else {
      equal(!!grpcCredentials(args).credentials, true, 'Got credentials');
    }

    return end();
  });
});
