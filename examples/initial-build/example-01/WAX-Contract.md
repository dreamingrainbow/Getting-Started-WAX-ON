# This example will go through the steps of setting up an environment to work with wax contracts.

## Prerequesits - Nodejs

`node scripts/build.js`

`node scripts/deploy.js`

`cleos push action mycontract setmsg '["michael", "Hello WAX!"]' -p michael`

`cleos push action mycontract erase '["michael"]' -p michael`

`cleos push action mycontract ping '["michael"]' -p mycontract`
