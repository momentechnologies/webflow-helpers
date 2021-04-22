const axios = require('axios');
const Bottleneck = require('bottleneck');

const cooldownRatelimitSeconds = 10;
const limiter = new Bottleneck({
    maxConcurrent: 1,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (config, path, method, options = {}) => {
    try {
        return await axios({
            ...options,
            url: `${config.url}${path}`,
            method,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${config.apiToken}`,
                'accept-version': '1.0.0',
            },
        });
    } catch (e) {
        if (e.response && e.response.status === 429) {
            if (config.debug) {
                console.log('ratelimit hit. Going to cooldown');
                console.log({
                    limit: parseInt(e.response.headers['x-ratelimit-limit']),
                    remaining: parseInt(
                        e.response.headers['x-ratelimit-remaining']
                    ),
                });
            }
            await delay(cooldownRatelimitSeconds * 1000);
            return await request(config, path, method, options);
        }
        throw e;
    }
};

module.exports = (...props) => limiter.schedule(() => request(...props));
