import { Api, JsonRpc, JsSignatureProvider } from "eosjs";
import fetch from "node-fetch";
import fs from "fs";
import { endpoints, privateKey, contractAccount } from "./config.js";

const signatureProvider = new JsSignatureProvider([privateKey]);
const rpc = new JsonRpc(endpoints.testnet, { fetch });
const api = new Api({ rpc, signatureProvider });

async function deploy() {
  const wasm = fs.readFileSync("./build/mycontract.wasm");
  const abi = fs.readFileSync("./build/mycontract.abi");

  console.log("📦 Deploying contract...");

  await api.transact(
    {
      actions: [
        {
          account: "eosio",
          name: "setcode",
          authorization: [{ actor: contractAccount, permission: "active" }],
          data: {
            account: contractAccount,
            vmtype: 0,
            vmversion: 0,
            code: wasm.toString("hex"),
          },
        },
        {
          account: "eosio",
          name: "setabi",
          authorization: [{ actor: contractAccount, permission: "active" }],
          data: {
            account: contractAccount,
            abi: abi.toString("hex"),
          },
        },
      ],
    },
    { blocksBehind: 3, expireSeconds: 30 }
  );

  console.log("✅ Contract deployed");
}

deploy().catch(console.error);
