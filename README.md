### News Archiver for Arweave

This project is for public use to store the latest news in the world based on key words.

### API 

The news provider used in this project is [https://newsapi.org](https://newsapi.org) which fetches news in different languages, countries and media outlets based on the chosen keywords.

### Environmental Variables

- `NEWS_KEY` : API key for the API provider
- `NEWS_KEYWORDS` : A list of keywords separated by commas. Ex: `russia,ukraine`
- `WALLET` : A encoded version of your Arweave wallet in base64 format
- `DEFAULT` : Run default parameters in `index.js`


### Usage

- Fill the environmental variables with the wanted values
- Run `node index.js`