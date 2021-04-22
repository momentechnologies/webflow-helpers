const request = require('./request.js');
const getAllWebflowItems = require('./getAllWebflowItems.js');
const createOrUpdateWebflowItem = require('./createOrUpdateWebflowItem.js');

module.exports = class WebflowHelper {
    constructor(config) {
        this.config = config;
    }

    async authenticatedRequest(path, method, options = {}) {
        return request(this.config, path, method, options);
    }

    async updateItem({ collectionId, itemId, ...data }) {
        const response = await this.authenticatedRequest(
            `/collections/${collectionId}/items/${itemId}?live=true`,
            'PUT',
            {
                data,
            }
        );

        return response.data;
    }

    async createItem({ collectionId, ...data }) {
        const response = await this.authenticatedRequest(
            `/collections/${collectionId}/items?live=true`,
            'POST',
            {
                data,
            }
        );

        return response.data;
    }

    async deleteItem({ collectionId, itemId }) {
        if (this.config.debug) {
            console.log(
                `Deleting item ${itemId} from collection ${collectionId}`
            );
        }
        const response = await this.authenticatedRequest(
            `/collections/${collectionId}/items/${itemId}?live=true`,
            'DELETE'
        );

        return response.data;
    }

    async getAllWebflowItems(collection) {
        return getAllWebflowItems(
            this.authenticatedRequest.bind(this),
            collection
        );
    }

    async createOrUpdateWebflowItem(...params) {
        return createOrUpdateWebflowItem(this, ...params);
    }
};
