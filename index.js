import { generateWallet } from "./wallet.js"
import express from "express";
import { newsApi } from "./newsapi.js";
import * as isofetch from "isomorphic-fetch";
import { config } from "dotenv";
import { arweave } from "./utils.js";
import { getWallet } from "./wallet.js"
import { sendNews } from "./send-news.js";

(async () => {
    await config();
    await generateWallet();
    
    const expressApp = express();
    expressApp.post('/', async (req, res) => {
        if(process.env.REQ_SECRET !== req.query.secret) {
            res.sendStatus(403);
        } else {
            const news = await newsApi.request("ukraine") || {};
            const russia = await newsApi.request("russia") || {};
            const all = [...(news.articles || []), ...(russia.articles || [])];
            res.send(await sendNews(all));

           
        }
    });

    const port = process.env.PORT || 3000;
    expressApp.listen(port, async () => {
        console.log(`Example app listening on port ${port}`);
        console.log(`Public key: ${await arweave.wallets.jwkToAddress(getWallet())}`);
    });

})();