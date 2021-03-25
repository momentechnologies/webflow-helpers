const axios = require('axios');

const getAllWebflowItems = async (config, collection, items = []) => {
    const response = await axios({
        url: `${config.url}/collections/${collection}/items?limit=3&offset=${items.length}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            'accept-version': '1.0.0',
        },
    });

    items = [...items, ...response.data.items];
    if (response.data.count + response.data.offset >= response.data.total) {
        console.log(
            `found ${items.length} webflow articles for collection ${collection}`
        );
        return items;
    }

    return getAllWebflowItems(collection, items);
};

module.exports = getAllWebflowItems;