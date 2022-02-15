import { arweave } from "./utils.js"
import { getWallet } from "./wallet.js";

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

            const transaction = await arweave.createTransaction({
                data: JSON.stringify(data || {})
            }, key);
            
            transaction.addTag("Initiative", "AndresPirelaUkraineRussia");
            transaction.addTag("Original-Url", article.url || "");
            transaction.addTag("author", article.author || "Unknown");
            transaction.addTag("publishedAt", article.publishedAt || new Date().toString());

            await arweave.transactions.sign(transaction, key);
            await arweave.transactions.post(transaction);
            transactions.push(transaction.id);
        } catch (e) {
            console.error(e);
        }
    }
    return transactions;
}
}
