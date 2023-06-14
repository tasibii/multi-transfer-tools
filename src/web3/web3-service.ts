import { BigNumberish, ethers } from "ethers";

class Web3Services {
    static createProvider (rpc: string) {
        return new ethers.JsonRpcProvider(rpc);
    }
    
    static createSigner (provider: ethers.Provider, privateKey: string) {
        return new ethers.Wallet(privateKey, provider);
    }

    static createContract (signer: ethers.Signer | ethers.Provider, address: string, abi: ethers.InterfaceAbi) {
        return new ethers.Contract(address, abi, signer);
    }

    static async simulateTx (
        contractAddress: string, 
        provider: ethers.Provider, 
        abi: ethers.InterfaceAbi, 
        simulateFrom: string, 
        functionName: string, 
        params: ethers.ParamType[]
    ): Promise<any> {
        const contract = this.createContract(provider, contractAddress, abi);
        const result = await contract[functionName].staticCall(...params, {from: simulateFrom});
    }

    static async sendTransaction ( 
        rpc: string, 
        privateKey: string, 
        contractAddress: string, 
        abi: ethers.InterfaceAbi, 
        functionName: string,
        value: BigNumberish,
        params: any, 
        waitSuccess = false 
    ) {
        const provider = Web3Services.createProvider(rpc);
        const signer = Web3Services.createSigner(provider, privateKey);
        const contract = Web3Services.createContract(signer, contractAddress, abi);
        const txPending = await contract[functionName](...params, {value});
        if (waitSuccess) {
            await txPending.wait();
            console.log("DONE: ", txPending.hash);
        }
    }
}

export default Web3Services;