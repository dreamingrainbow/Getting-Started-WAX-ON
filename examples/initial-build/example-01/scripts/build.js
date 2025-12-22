import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const cmd = `
docker run --rm \
  -v ${projectRoot}:/project \
  waxteam/wax-cdt \
  eosio-cpp -abigen \
    -I /project/contract/include \
    -R /project/contract/ricardian \
    -contract mycontract \
    -o /project/build/mycontract.wasm \
    /project/contract/src/mycontract.cpp
`;

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error("❌ Compile error:", stderr);
    process.exit(1);
  }
  console.log("✅ Contract compiled successfully");
});
