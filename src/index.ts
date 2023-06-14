import 'dotenv/config';
import {ethers} from "ethers";
import common from "./libs/common";
import Web3Services from "./web3/web3-service";
import tokenAbi from "../contracts/USDC/abi.json";
require('console-stamp')(console, '[HH:MM:ss.l]');
import accounts from "../data/testnet/accounts.json-1.json";
import multiTransferAbi from "../contracts/MultiTransfer/abi.json";

(async () => {
    const {signatures, addresses} = await common.getPermitSignaturesInput(
        accounts, 
        "0x3AfB052aD80637a3e979a935Bd784e3E07D258d3",
        tokenAbi,
        "USDC",
        "43113"
    );
    console.log("Generate signature done!");
    
    // [token, spender, deadline, address[]]
    const details: any = [process.env.ERC20,process.env.MY_ADDRESS,1718137220,addresses];
    const rpc = common.getRpcByChainId("43113");

    // const addresses = common.getAddressesInput(accounts);
    await Web3Services.sendTransaction(
        rpc, 
        process.env.PRIVATE_KEY, 
        process.env.MULTI_TRANSFER, 
        multiTransferAbi,
        "multiPermit", 
        0,
        [details, signatures],
        true,
    );
    console.log("Multi permit done!");

    await Web3Services.sendTransaction(
        rpc,
        process.env.PRIVATE_KEY,
        process.env.MULTI_TRANSFER,
        multiTransferAbi,
        "multiTransferERC20",
        0,
        [process.env.ERC20,addresses,1000000],
        true,
    );
    console.log("Multi transfer token done!");

    await Web3Services.sendTransaction(
        rpc,
        process.env.PRIVATE_KEY,
        process.env.MULTI_TRANSFER,
        multiTransferAbi,
        "multiTransferETH",
        ethers.parseEther("0.5"),
        [addresses],
        true,
    );
    console.log("Multi transfer native done!");

    process.exit();
})();
