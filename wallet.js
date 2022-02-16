import { writeFileSync, readFileSync } from 'fs';
import { fileExists, arweave } from './utils.js';
import { Buffer as BufferImp } from 'buffer';

global.Buffer = global.Buffer || BufferImp;

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
  };
}

export const generateWallet = async () => {
    if(process.env.WALLET) {
        console.log("Env wallet found");
        return;
    }
    if (!fileExists('./wallet.json')) {
        writeFileSync('wallet.json', JSON.stringify(await arweave.wallets.generate()));
        console.log("Generated wallet");
    } else {
        console.log("Ignoring wallet generation, as wallet.json already exists.");
    }
};

export const getWallet = () =>  {

    if(process.env.WALLET) {
        console.log("Env wallet found");
        return JSON.parse(atob(process.env.WALLET));
    }

    if (fileExists('./wallet.json')) {
        return JSON.parse(readFileSync('wallet.json', 'utf8'));
    } else {
        throw new Error('No wallet.json found.');
    }
}