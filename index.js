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
    
    console.log(`Public key: ${await arweave.wallets.jwkToAddress(getWallet())}`);
    
    const news = await newsApi.request("ukraine") || {};
    const russia = await newsApi.request("russia") || {};
    const all = [...(news.articles || []), ...(russia.articles || [])];
    console.log(await sendNews(all));
})();