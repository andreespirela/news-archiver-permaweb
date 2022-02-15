import { statSync } from 'fs';
import Arweave from 'arweave';

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