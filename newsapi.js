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
}

export const newsApi = new NewsApi();