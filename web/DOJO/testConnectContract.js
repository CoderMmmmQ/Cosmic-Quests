const starknet = require('starknet');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
async function main() {
    const provider = new starknet.RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io" }); 
    console.log("Provider connected to RPC");

    // Connect the deployed Test instance in devnet
    const testAddress = "0x01e3f27a76abc1e41742fa163579108d1454d606cb3fb5bff8306b912298677c";
    const compiledTest = starknet.json.parse(fs.readFileSync("contracts_Game.contract_class.json").toString("ascii"));
    const myTestContract = new starknet.Contract(compiledTest.abi, testAddress, provider);
    console.log('? Test Contract connected at =', myTestContract.address);
    const res = await myTestContract.is_in_game();
    console.log('? Test Is In Game =', res);
    const adv = await myTestContract.get_current_adventure();
    console.log('? Test Is In Game =', adv._genesis_timestamp);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });