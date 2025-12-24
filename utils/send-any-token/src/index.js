import { Api, JsonRpc, JsSignatureProvider } from "eosjs";
import fetch from "node-fetch";

let hasKeyFlag = false;
let hasRPCFlag = false;
let keyFromArgv = null;
let rpcFromArgv = null;
let args = {
  from: null,
  to: null,
  contract: null,
  symbol: null,
  amount: null,
  memo: null,
  blocksBehind: null,
  expireSeconds: null,
};
for (const arg of process.argv) {
  if (arg.match(/^--key=.+$/)) {
    hasKeyFlag = true;
    keyFromArgv = arg;
  }
  if (arg.match(/^--rpc=.+$/)) {
    hasRPCFlag = true;
    rpcFromArgv = arg;
  }
  if (arg.match(/^--from=.+$/)) {
    let temp = arg.slice();
    args.from = temp;
  }
  if (arg.match(/^--to=.+$/)) {
    let temp = arg.slice();
    args.to = temp;
  }
  if (arg.match(/^--contract=.+$/)) {
    let temp = arg.slice();
    args.contract = temp;
  }
  if (arg.match(/^--symbol=.+$/)) {
    let temp = arg.slice();
    args.symbol = temp;
  }
  if (arg.match(/^--amount=.+$/)) {
    let temp = arg.slice();
    args.amount = temp;
  }
  if (arg.match(/^--memo=.+$/)) {
    let temp = arg.slice();
    args.memo = temp;
  }
  if (arg.match(/^--bb=.+$/)) {
    let temp = arg.slice();
    args.blocksBehind = temp;
  }
  if (arg.match(/^--expires=.+$/)) {
    let temp = arg.slice();
    args.expireSeconds = temp;
  }
  if (arg.match(/^--help$/)) {
    console.log("Help Screen.");
  }
}

const getKeyFromArgv = () => {
  return keyFromArgv !== null ? keyFromArgv.slice(6) : "";
};

const getRPCFromArgv = () => {
  return rpcFromArgv !== null ? rpcFromArgv.slice(6) : "";
};

const getRPCProvider = () => {
  const defaultRPC = "https://wax.greymass.com";
  let override = false;
  let overrideRPC = "https://wax.greymass.com";
  if (process) {
    if (process.env.WAX_RPC_URL !== undefined && !hasRPCFlag) {
      override = true;
      overrideRPC = process.env.WAX_RPC_URL;
    }
  }
  if (hasRPCFlag) {
    override = true;
    overrideRPC = getRPCFromArgv();
  }
  const rpc = new JsonRpc(override ? overrideRPC : defaultRPC, { fetch });
  return rpc;
};

const getSignatureProvider = () => {
  let keyString = "";
  if (process) {
    if (process.env.WAX_PRIVATE_KEY !== undefined && !hasKeyFlag) {
      keyString = process.env.WAX_PRIVATE_KEY;
    }
  }
  if (hasKeyFlag) {
    keyString = getKeyFromArgv();
  }
  if (!keyString) throw Error("Private Key Not Found.");
  const signatureProvider = new JsSignatureProvider([keyString]);
  return signatureProvider;
};

const getApiConnector = ({ rpc, signatureProvider }) => {
  const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
  });
  return api;
};

const getTokenStats = async ({ rpc, contract, symbol }) => {
  const stats = await rpc.get_table_rows({
    code: contract,
    scope: symbol,
    table: "stat",
    limit: 1,
  });

  if (!stats.rows.length) {
    return {
      contract,
      symbol,
      stats,
      error: `Token ${symbol} not found in contract ${contract}`,
    };
  }

  console.log("stats : \n", stats);

  const precision = stats.rows[0].max_supply.split(" ")[0].split(".")[1].length;
  return {
    contract,
    symbol,
    stats,
    precision,
  };
};

const formatTokenAmount = ({ symbol, precision, amount }) => {
  // 2. Format quantity correctly
  const quantity = `${amount.toFixed(precision)} ${symbol}`;
  return {
    symbol,
    precision,
    amount,
    quantity,
  };
};

const buildTransaction = ({
  contract,
  name = "transfer",
  from,
  permission = "active",
  to,
  quantity,
  memo,
}) => {
  return {
    actions: [
      {
        account: contract,
        name,
        authorization: [
          {
            actor: from,
            permission,
          },
        ],
        data: {
          from,
          to,
          quantity,
          memo,
        },
      },
    ],
  };
};

/**
 * Send ANY token on WAX/EOSIO
 * @param {string} from - sender account
 * @param {string} to - receiver account
 * @param {string} contract - token contract (e.g. eosio.token, m.federation)
 * @param {string} symbol - token symbol (e.g. WAX, TLM)
 * @param {number} amount - numeric amount (e.g. 10.5)
 * @param {string} memo - memo text
 */
export async function sendAnyToken(
  from,
  to,
  contract,
  symbol,
  amount,
  memo = "",
  blocksBehind = 3,
  expireSeconds = 30
) {
  // Get the RPC Provider
  const rpc = getRPCProvider();
  // Fetch the stats and precision
  const { precision } = await getTokenStats({ rpc, contract, symbol });
  // Format quantity correctly
  const { quantity } = formatTokenAmount({ symbol, precision, amount });
  // Load the signature Provider
  const { signatureProvider } = getSignatureProvider();
  const { api } = getApiConnector({ rpc, signatureProvider });
  // Build the transaction
  const { actions } = buildTransaction({
    contract,
    name: "transfer",
    from,
    permission: "active",
    to,
    quantity,
    memo,
  });
  // send transaction
  const result = await api.transact(
    {
      actions,
    },
    {
      blocksBehind,
      expireSeconds,
    }
  );

  return result;
}
