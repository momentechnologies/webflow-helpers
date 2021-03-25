const getAllWebflowItems = require("./getAllWebflowItems");
const createOrUpdateWebflowItem = require("./createOrUpdateWebflowItem");

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
