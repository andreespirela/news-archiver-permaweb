import { addToDrive, arweave } from "./utils.js"
import { getWallet } from "./wallet.js";

const ARDRIVE_DRIVE = process.env.ARDRIVE_DRIVE;
const ARDRIVE_FOLDER = process.env.ARDRIVE_FOLDER;

function getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

export const sendNews = async (news) => {
    if(!news) return [];

    const transactions = [];

    if(news && Array.isArray(news) && news.length > 0) {
        let processedArticles = getUniqueListBy(news, "url");
        for(let article of processedArticles) {
            try {
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

            const key = getWallet();
            const txData = JSON.stringify(data || {}, null, 2);

            const transaction = await arweave.createTransaction({
                data: txData
            }, key);
            
            transaction.addTag("Initiative", "AndresPirelaUkraineRussia");
            transaction.addTag("Original-Url", article.url || "");
            transaction.addTag("author", article.author || "Unknown");
            transaction.addTag("publishedAt", article.publishedAt || new Date().toString());
            transaction.addTag("Content-Type", "application/json");

            // add ardrive tags
            transaction.addTag("App-Name", "ArDrive-Web");
            transaction.addTag("App-Version", "0.1.0");

            await arweave.transactions.sign(transaction, key);
            await arweave.transactions.post(transaction);
            transactions.push(transaction.id);

            await addToDrive({
              fileinfo: {
                filename: data.title + " - AndresPirelaUkraineRussia.json",
                contentType: "application/json",
                timestamp: Math.round(new Date(article.publishedAt).getTime() / 1000).toString(),
                size: new TextEncoder().encode(txData).length,
                dataTx: transaction.id
              },
              driveID: ARDRIVE_DRIVE,
              folderID: ARDRIVE_FOLDER
            });
        } catch (e) {
            console.error(e);
        }
    }
    return transactions;
}
}
