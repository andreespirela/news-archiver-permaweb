import { generateWallet } from "./wallet.js"
import express from "express";
import { newsApi } from "./newsapi.js";
import * as isofetch from "isomorphic-fetch";
import { config } from "dotenv";
import { arweave } from "./utils.js";
import { getWallet } from "./wallet.js"
import { sendNews } from "./send-news.js";
import { getNews } from "./index.js";

const getDaysArray = function(start, end) {
    for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt));
    }
    return arr;
};

(async () => {
    await config();
    await generateWallet();

    console.log(`Public key: ${await arweave.wallets.jwkToAddress(getWallet())}`);

    const ids = [];

    const dates = getDaysArray(new Date("2021-12-01"), new Date());
    const newsCollection = [];
    for(let i = 0; i < dates.length; i++) {
        const date = dates[i];
        try {
            newsCollection.push(...((await getNews(date)) || []));
        } catch(e) {
            console.log(e);
        }
    }
    console.log(`Detected a total of ${newsCollection.length} news articles.`);
    ids.push(...(await sendNews(newsCollection)));
    console.log(ids);
    process.exit(0);
})();