import methods from './methods';
import { packageTypes, serviceTypes } from './../../grpc/index.js';


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
export default ({method}) => {
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
