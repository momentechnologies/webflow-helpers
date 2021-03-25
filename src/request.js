const axios = require("axios");

module.exports = async (config, path, method, options = {}) => axios({
    ...options,
    url: `${config.url}${path}`,
    method,
    headers: {
        ...options.headers,
        Authorization: `Bearer ${config.apiToken}`,
        'accept-version': '1.0.0',
    },
});
