class NewsApi {
    get apiKey() {
        return process.env.NEWS_KEY;
    }

    async request(term = "ukraine") {
        const date = new Date();
        const yearMonthDay = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const url = `https://newsapi.org/v2/everything?q=${term}&from=${yearMonthDay}&sortBy=publishedAt&apiKey=${this.apiKey}`;
        return (await fetch(url)).json();
    }

    async exists(originalUrl) {
        try {
            const url = 'https://arweave.net/graphql';
            const query = `query {
                transactions(
                    tags: [{
                        name: "Initiative",
                        values: ["AndresPirelaUkraineRussia"]
                    }, {
                    name: "Original-Url",
                    values: ["${originalUrl}"]
                    }]
                ) {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }`.trim();
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query, variables: {} }),
            });
            return await response.json();
        } catch(e) {
            return {};
        }
    }
}

export const newsApi = new NewsApi();