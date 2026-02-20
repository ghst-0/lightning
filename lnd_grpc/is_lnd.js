/** Determine if object is an expected LND Object

  {
    [lnd]: <LND Object>
    [method]: <Method Name String>
    [type]: <Method Type String>
  }

  @returns
  <Is Expected LND Object Bool>
*/
export default ({lnd, method, type}) => {
  return !!lnd && !!lnd[type] && !!lnd[type][method];
};
