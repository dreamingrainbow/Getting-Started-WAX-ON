import { Api, JsonRpc, JsSignatureProvider } from 'eosjs';
import fetch from 'node-fetch';

const rpc = new JsonRpc('https://wax.greymass.com', { fetch });

const signatureProvider = new JsSignatureProvider([
  'YOUR_PRIVATE_KEY'
]);

const api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

/**
 * Send ANY token on WAX/EOSIO
 * @param {string} from - sender account
 * @param {string} to - receiver account
 * @param {string} contract - token contract (e.g. eosio.token, m.federation)
 * @param {string} symbol - token symbol (e.g. WAX, TLM)
 * @param {number} amount - numeric amount (e.g. 10.5)
 * @param {string} memo - memo text
 */
export async function sendAnyToken(from, to, contract, symbol, amount, memo = '') {
  // 1. Read token stats to get precision
  const stats = await rpc.get_table_rows({
    code: contract,
    scope: symbol,
    table: 'stat',
    limit: 1
  });

  if (!stats.rows.length) {
    throw new Error(`Token ${symbol} not found in contract ${contract}`);
  }

  const precision = stats.rows[0].max_supply.split(' ')[0].split('.')[1].length;

  // 2. Format quantity correctly
  const quantity = `${amount.toFixed(precision)} ${symbol}`;

  // 3. Build and send transaction
  const result = await api.transact({
    actions: [{
      account: contract,
      name: 'transfer',
      authorization: [{
        actor: from,
        permission: 'active'
      }],
      data: {
        from,
        to,
        quantity,
        memo
      }
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30
  });

  return result;
}
