declare global {
    namespace NodeJS {
        interface ProcessEnv {
            AMOUNT_APPROVE: string;
            ERC20: string;
            MULTI_TRANSFER: string;
            SPENDER: string;
            MY_ADDRESS: string;
            PRIVATE_KEY: string;
        }
    }
}
export {};