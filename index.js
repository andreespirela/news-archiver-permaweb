import { generateWallet } from "./wallet.js"
import express from "express";
import { newsApi } from "./newsapi.js";
import * as isofetch from "isomorphic-fetch";
import { config } from "dotenv";
import { arweave } from "./utils.js";
import { getWallet } from "./wallet.js"
import { sendNews } from "./send-news.js";

export const getNews = async (date, keywords) => {
    const keyWords = (keywords || (process.env.NEWS_KEYWORDS || "russia,ukraine")).split(",");

    const news = [];
    for(const keyWord of keyWords) {
        const data = await newsApi.request(keyWord, date) || {};
        news.push(...(data.articles || []));
    }
    return news;
}

export const run = async (date, keywords, initiative) => {
    await config();
    await generateWallet();

    console.log(`Public key: ${await arweave.wallets.jwkToAddress(getWallet())}`);

    const news = await getNews(date, keywords);

    console.log(await sendNews(news, initiative));
    process.exit(0);
};

run();