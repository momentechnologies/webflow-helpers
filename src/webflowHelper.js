const getAllWebflowItems = require('./getAllWebflowItems.js');
const createOrUpdateWebflowItem = require('./createOrUpdateWebflowItem.js');

module.exports = class WebflowHelper {
    constructor(config) {
        this.config = config;
    }

    async getAllWebflowItems(collection) {
        return getAllWebflowItems(this.config, collection);
    }

    async createOrUpdateWebflowItem(...params) {
        return createOrUpdateWebflowItem(this.config, ...params);
    }
};
