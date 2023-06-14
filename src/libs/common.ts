import { BigNumberish, Contract, Signature, Wallet, ethers } from "ethers";
import config from "../config/chain-config.json";
import Web3Services from "../web3/web3-service";

const _this: {
    getPermitSignature: (
        signer: Wallet,
        token: Contract,
        permitName: string,
        spender: string,
        value: BigNumberish,
        deadline: BigNumberish,
        nonce?: BigNumberish,
    ) => Promise<Signature>;
    toHex: (str: string) => string;
    getRpcByChainId: (chainId: string) => string;
    chunk: (array: object[], size: number) => object[][];
    getAddressesInput: (accounts: { address: string, privateKey: string }[]) => string[];
    getPermitSignaturesInput: (
        accounts: { address: string, privateKey: string }[], 
        targetToken: string, 
        abi: ethers.InterfaceAbi,
        permitName: string,
        chainId: string,
    ) => Promise<{ signatures: [BigNumberish, string, string][], addresses: string[] }>;
} = {
    getPermitSignature: async function (
        signer: Wallet,
        token: Contract,
        permitName: string,
        spender: string,
        value: BigNumberish,
        deadline: BigNumberish,
        nonce?: BigNumberish
    ): Promise<Signature> {
        throw new Error("Function not implemented.");
    },
    toHex: function (str: string): string {
        throw new Error("Function not implemented.");
    },
    getRpcByChainId: function (chainId: string): string {
        throw new Error("Function not implemented.");
    },
    chunk: function (array: object[], size: number): object[][] {
        throw new Error("Function not implemented.");
    },
    getAddressesInput: function (accounts: { address: string, privateKey: string }[]): string[] {
        throw new Error("Function not implemented.");
    },
    getPermitSignaturesInput: async function (
        accounts: { address: string, privateKey: string }[], 
        targetToken: string, 
        abi: ethers.InterfaceAbi,
        permitName: string,
        chainId: string,
    ): Promise<{ signatures: [BigNumberish, string, string][], addresses: string[] }> {
        throw new Error("Function not implemented.");
    },
};

_this.chunk = (array, size) => {
    const chunked: object[][] = [];
    let chunk: object[] = [];

    array.forEach((item: object) => {
        if (chunk.length === size) {
            chunked.push(chunk);
            chunk = [item];
        } else {
            chunk.push(item);
        }
    });

    if (chunk.length) {
        chunked.push(chunk);
    }

    return chunked;
};

_this.getRpcByChainId = (chainId) => {
    const chainConfigs: Object = config.ChainConfigs;
    const configCheck = Object.values(chainConfigs).find(config => config.chainId == chainId);
    return configCheck ? configCheck.freeRpc : "";
}

_this.getPermitSignature = async (
    signer,
    token,
    permitName,
    spender,
    value,
    deadline,
) => {
    const [nonce, name, version, chainId] = await Promise.all([
        token.nonces(signer.address),
        permitName,
        "1",
        "43113",
    ]);

    return Signature.from(
        await signer.signTypedData(
            {
                name,
                version,
                chainId,
                verifyingContract: await token.getAddress(),
                // salt: ethers.zeroPadValue(_this.toHex(chainId), 32),
            },
            {
                Permit: [
                    {
                        name: "owner",
                        type: "address",
                    },
                    {
                        name: "spender",
                        type: "address",
                    },
                    {
                        name: "value",
                        type: "uint256",
                    },
                    {
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        name: "deadline",
                        type: "uint256",
                    },
                ],
            },
            {
                owner: signer.address,
                spender,
                value,
                nonce,
                deadline,
            }
        )
    );
}

_this.toHex = (str) => {
    return "0x" + parseInt(str).toString(16);
}

_this.getAddressesInput = (accounts) => {
    return accounts.map((account) => account.address);
}

_this.getPermitSignaturesInput = async (accounts, targetToken, abi, permitName, chainId) => {
    const addresses: string[] = [];
    const signatures: [BigNumberish, string, string][] = [];
    const rpc = _this.getRpcByChainId(chainId);
    const provider = Web3Services.createProvider(rpc);
    const deadline = 1718137220;
    const spender = process.env.SPENDER;
    const approveAmount = process.env.AMOUNT_APPROVE;
    for (let i = 0; i < accounts.length; i++) {
        try {
            let account = Web3Services.createSigner(provider, accounts[i].privateKey);
            const erc20 = Web3Services.createContract(account, targetToken, abi);
            const sign = await _this.getPermitSignature(
                account,
                erc20,
                permitName,
                spender,
                approveAmount,
                deadline
            );
            addresses.push(accounts[i].address);
            signatures.push([sign.v, sign.r, sign.s]);
            console.log(
                `[debug::transact] TX has been submitted. Waiting for response..`
            );
        } catch (error) {
            console.log(error);
        }
    }
    return {signatures, addresses};
}

export default _this;
