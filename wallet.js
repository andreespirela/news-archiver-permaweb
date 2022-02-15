import { writeFileSync, readFileSync } from 'fs';
import { fileExists, arweave } from './utils.js';

export const generateWallet = async () => {
    if (!fileExists('./wallet.json')) {
        writeFileSync('wallet.json', JSON.stringify(await arweave.wallets.generate()));
        console.log("Generated wallet");
    } else {
        console.log("Ignoring wallet generation, as wallet.json already exists.");
    }
};

export const getWallet = () =>  {
    if (fileExists('./wallet.json')) {
        return JSON.parse(readFileSync('wallet.json', 'utf8'));
    } else {
        throw new Error('No wallet.json found.');
    }
}