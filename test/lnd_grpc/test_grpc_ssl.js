import 'node:assert';
import test from 'node:test';
import grpcSsl from './../../lnd_grpc/grpc_ssl.js';

const tests = [
  {
    args: {cert: Buffer.alloc(1).toString('hex')},
    description: 'A hex cert returns a GRPC object',
  },
  {
    args: {cert: Buffer.alloc(1).toString('base64')},
    description: 'A base64 cert returns a GRPC object',
  },
  {
    args: {},
    description: 'No cert returns a GRPC object',
  },
];

tests.forEach(({args, description}) => {
  return test(description, (t, end) => {
    const res = grpcSsl(args);

    equal(!!res.ssl, true, 'Has SSL object');

    return end();
  });
});
