# This example will go through the steps of setting up an environment to work with wax contracts.

## Prerequesits - Nodejs

`node scripts/build.js`

`node scripts/deploy.js`

`cleos push action mycontract setmsg '["michael", "Hello WAX!"]' -p michael`

`cleos push action mycontract erase '["michael"]' -p michael`

`cleos push action mycontract ping '["michael"]' -p mycontract`

```
exec(
  `docker run --rm -v ${process.cwd()}:/project waxteam/wax-cdt eosio-cpp -abigen -o /project/build/mycontract.wasm /project/src/mycontract.cpp`,
  ...
);
```

```
import { exec } from "child_process";

exec(
  `eosio-cpp -abigen -I include -R resources -contract mycontract -o mycontract.wasm src/mycontract.cpp`,
  (err, stdout, stderr) => {
    if (err) {
      console.error("Compile error:", stderr);
      return;
    }
    console.log("Compiled successfully:", stdout);
  }
);
```
