const fetchUkraineRussiaData = async (after) => {
    let query = "";
    if(after) {
        query = `query {
            transactions(
                tags: [{
                    name: "Initiative",
                    values: ["AndresPirelaUkraineRussia"]
                }],
                first: 100,
                after: "${after}"
            ) {
                edges {
                    node {
                        id,
                    },
                cursor
                }
            }
        }`;
    } else { 
        query = `query {
            transactions(
                tags: [{
                    name: "Initiative",
                    values: ["AndresPirelaUkraineRussia"]
                }],
                first: 100
            ) {
                edges {
                    node {
                        id,
                    },
                cursor
                }
            }
        }`;
    }

    const url = 'https://arweave.net/graphql';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables: {} }),
    });
    return await response.json();
};

const firstFetch = await fetchUkraineRussiaData();
const firstEdges = firstFetch?.data?.transactions?.edges || [];
const results = [...firstEdges];

if(results.length === 100) {

    const getEdgesLength = () => results.length;

    while(true) {

        const lastCursor = results[getEdgesLength() - 1]?.cursor;

        if(lastCursor) {
            const nextFetch = await fetchUkraineRussiaData(lastCursor);
            const currentEdges = nextFetch?.data?.transactions?.edges || [];
            const currentEdgeLength = currentEdges.length || 0;

            if(currentEdgeLength === 0) {
                break;
            }

            results.push(...currentEdges);
        }
    }
}

console.log(results.length);