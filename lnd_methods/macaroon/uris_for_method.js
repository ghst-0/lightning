import methods from './methods.json' with { type: 'json' };
import grpc_services from '../../grpc/grpc_services.json' with { type: 'json' };

const { packageTypes, serviceTypes } = grpc_services;
const flatten = arr => arr.flat(Infinity);
const type = n => [methods[n]].concat((methods[n].depends_on || []).map(type));
const uriForMethod = (rpc, service, method) => `/${rpc}.${service}/${method}`;

/** Given a method, derive URI macaroon permission strings required

  {
    method: <Method Name String>
  }

  @throws
  <Error>

  @returns
  {
    uris: [<Permission URI String>]
  }
*/
const urisForMethod = ({method}) => {
  if (!method) {
    throw new Error('ExpectedMethodNameToDeriveMacaroonUris');
  }

  if (!methods[method]) {
    throw new Error('ExpectedKnownMethodNameToDeriveMacaroonUris');
  }

  const requiredMethods = flatten(type(method)).filter(({type}) => type);

  const uris = flatten(requiredMethods.map(({method, methods, type}) => {
    const service = serviceTypes[type];

    if (!service) {
      throw new Error('ExpectedKnownMethodServiceToDeriveMacaroonUris');
    }

    const rpc = packageTypes[service];

    return (methods || [method]).map(methodName => {
      return uriForMethod(rpc, service, methodName);
    });
  }));

  uris.sort();

  return {uris};
};

export { urisForMethod }
