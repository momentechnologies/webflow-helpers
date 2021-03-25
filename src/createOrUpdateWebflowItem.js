const request = require('./request.js');

const createSlug = (name, depth) => {
    const rawSlug = name
        .replace(/ø/gim, 'o')
        .replace(/æ/gim, 'ae')
        .replace(/å/gim, 'aa')
        .replace(/[^a-z0-9]/gim, '-')
        .replace(/\s+/g, ' ')
        .replace(/-+/g, '-')
        .replace(/^-+/g, '')
        .replace(/-+$/g, '')
        .toLowerCase();

    if (depth === 0) {
        return rawSlug;
    }

    return `${rawSlug}-${depth + 1}`;
};

const create = async (config, webflowCollection, data, depth = 0) => {
    const slug = createSlug(data.name, depth);

    try {
        return await request(
            config,
            `/collections/${webflowCollection}/items?live=true`,
            'POST',
            {
                data: {
                    fields: {
                        _archived: false,
                        _draft: false,
                        ...data,
                        slug,
                    },
                },
            }
        );
    } catch (e) {
        if (
            depth <= 5 &&
            e.response &&
            e.response.data.code === 400 &&
            e.response.data.problem_data &&
            e.response.data.problem_data.length !== 0 &&
            e.response.data.problem_data[0].slug === 'slug'
        ) {
            console.log(
                `Slug "${slug} already exists for collection ${webflowCollection}. Going to depth ${
                    depth + 2
                }`
            );
            await create(config, webflowCollection, data, depth + 1);
        } else {
            throw e;
        }
    }
};

const createOrUpdateWebflowItem = async (
    config,
    webflowCollection,
    webflowItemToUpdate,
    getExisting
) => {
    const existing = getExisting(webflowItemToUpdate);

    if (existing) {
        console.log(
            `Found existing webflow article for collection ${webflowCollection}. Updating ${existing._id}`
        );
        return request(
            config,
            `/collections/${webflowCollection}/items/${existing._id}?live=true`,
            'PUT',
            {
                data: {
                    fields: {
                        slug: existing.slug,
                        _archived: existing._archived,
                        _draft: existing._draft,
                        ...webflowItemToUpdate,
                    },
                },
            }
        );
    }

    console.log(
        `New webflow article for collection ${webflowCollection} with name ${webflowItemToUpdate.name}`
    );

    return await create(config, webflowCollection, webflowItemToUpdate);
};

module.exports = createOrUpdateWebflowItem;
