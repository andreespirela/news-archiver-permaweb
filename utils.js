import { statSync } from 'fs';
import { getWallet } from "./wallet.js";
import Arweave from 'arweave';
import { v4 } from "uuid";

export const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

export const fileExists = (path) => {
    try {
        statSync(path);
        return true;
    } catch (e) {
        return false;
    }
}

export const addToDrive = async ({ fileinfo: { filename, timestamp, size, dataTx, contentType }, driveID, folderID }) => {
  const wallet = getWallet();
  const transaction = await arweave.createTransaction(
    {
      data: JSON.stringify({
        name: filename,
        size,
        lastModifiedDate: timestamp,
        datatransactionId: dataTx,
        dataContentType: contentType
      }, null, 2)
    },
    wallet
  );

  transaction.addTag("App-Name", "ArDrive-Web");
  transaction.addTag("App-Version", "1.7.1");
  transaction.addTag("ArFS", "0.11");

  transaction.addTag("Content-Type", "application/json");
  transaction.addTag("Entity-Type", "file");
  transaction.addTag("Unix-Time", Math.round(timestamp / 1000).toString());

  transaction.addTag("Drive-Id", driveID);
  transaction.addTag("File-Id", v4());
  transaction.addTag("Parent-Folder-Id", folderID);

  await arweave.transactions.sign(transaction, wallet);

  const uploader = await arweave.transactions.getUploader(transaction);

  while (!uploader.isComplete) {
    await uploader.uploadChunk();
  }
};