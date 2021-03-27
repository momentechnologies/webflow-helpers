const axios = require('axios');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1100,
});

module.exports = async (config, path, method, options = {}) =>
    limiter.schedule(() =>
        axios({
            ...options,
            url: `${config.url}${path}`,
            method,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${config.apiToken}`,
                'accept-version': '1.0.0',
            },
        })
    );
