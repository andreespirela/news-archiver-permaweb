import { newsApi } from "./newsapi.js";
import { addToDrive, arweave } from "./utils.js"
import { getWallet } from "./wallet.js";
import puppeteer from "puppeteer";
import { readFileSync } from "fs";

function getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

const createTx = async (data, tags) => {
    const walletKey = getWallet();
    const ARDRIVE_DRIVE = process.env.ARDRIVE_DRIVE;
    const ARDRIVE_FOLDER = process.env.ARDRIVE_FOLDER;

    const transaction = await arweave.createTransaction({
        data
    }, walletKey);

    Object.keys(tags).forEach(key => {
        transaction.addTag(key, tags[key]);
    });

    await arweave.transactions.sign(transaction, walletKey);
    await arweave.transactions.post(transaction);

    const contentType = tags["Content-Type"];
    // await addToDrive({
    //     fileinfo: {
    //       filename: `${data.title}-AndresPirelaUkraineRussia.${contentType === "application/pdf" ? "pdf" : "json"}`,
    //       contentType,
    //       timestamp: Math.round(new Date(tags["publishedAt"]).getTime() / 1000).toString(),
    //       size: data?.length || 0,
    //       dataTx: transaction.id
    //     },
    //     driveID: ARDRIVE_DRIVE,
    //     folderID: ARDRIVE_FOLDER
    //   });

    return transaction;

}

export const sendNews = async (news, initiative) => {

    if(!news) return [];

    const transactions = [];

    if(news && Array.isArray(news) && news.length > 0) {
        let processedArticles = getUniqueListBy(news, "url");
        for(let article of processedArticles) {
            const uuid = guidGenerator();
            const pdfFile = `${uuid}.pdf`;
            try {

            let articleUrl = article.url;
            let exists = await newsApi.exists(articleUrl);
            if(exists.data?.transactions?.edges?.length > 0) {
                continue;
            }

            const data = {
                title: article.title,
                content: article.content,
                description: article.description,
                author: article.author,
                publishedAt: article.publishedAt,
                imageBinary: []
            };

            if(article && article.urlToImage) {
                try {
                    const image = await fetch(article.urlToImage);
                    const imageBinary = await image.arrayBuffer();
                    data.imageBinary = Object.values(new Uint8Array(imageBinary));
                } catch(e) {}
            }

            let withPdf = false;
            try {
                if(article && article.url) {
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.goto(article.url, {
                    waitUntil: 'networkidle2',
                    });
                    await page.pdf({ path: pdfFile, format: 'a4' });
                
                    await browser.close();
                    withPdf = true;
                    console.log(`${uuid}.pdf created`);
                }
            } catch(e) { console.log("Error creating pdf", e) }

            const key = getWallet();
            const txData = JSON.stringify(data || {}, null, 2);

            let pdfTransaction = undefined;

            if(withPdf) {
                pdfTransaction = await createTx(readFileSync(pdfFile).buffer, {
                    "App-Version": "0.1.0",
                    "App-Name": "ArDrive-Web",
                    "Content-Type": "application/pdf",
                    "Initiative": initiative || "AndresPirelaUkraineRussia",
                    "Original-Url": articleUrl,
                    "publishedAt": article.publishedAt || new Date().toString(),
                });
            }

            const transaction = await createTx(txData, {
                "Initiative": initiative || "AndresPirelaUkraineRussia",
                "Original-Url": article.url || "",
                "author": article.author || "Unknown",
                "publishedAt": article.publishedAt || new Date().toString(),
                "Content-Type": "application/json",
                "App-Version": "0.1.0",
                "App-Name": "ArDrive-Web",
                "Pdf-View": pdfTransaction?.id || "",
            });

            
            transactions.push(transaction.id);
        } catch (e) {
            console.error(e);
        }
    }
    return transactions;
}
}
