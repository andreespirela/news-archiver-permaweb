import { createTx } from "./send-news.js";
import Arweave from 'arweave';
import { getWallet } from "./wallet.js"

export const arweave = Arweave.init({
    host: 'www.arweave.run',
    port: 443,
    protocol: 'https'
});


console.log(`Public key: ${await arweave.wallets.jwkToAddress(getWallet())}`);
(async () => {
    console.log(JSON.stringify(await createTx(JSON.stringify({
        "greet": "Hello World"
    }), [], arweave)));
})();