const getAllWebflowItems = async (request, collection, items = []) => {
    const response = await request(
        `/collections/${collection}/items?limit=3&offset=${items.length}`,
        'GET'
    );

    items = [...items, ...response.data.items];
    if (response.data.count + response.data.offset >= response.data.total) {
        console.log(
            `found ${items.length} webflow articles for collection ${collection}`
        );
        return items;
    }

    return getAllWebflowItems(request, collection, items);
};

module.exports = getAllWebflowItems;
