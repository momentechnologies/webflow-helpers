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

const create = async (
    webflow,
    webflowCollectionId,
    data,
    autoCreateSlugOnFailure = true,
    depth = 0
) => {
    const slug = createSlug(data.name, depth);

    try {
        return await webflow.createItem({
            collectionId: webflowCollectionId,
            fields: {
                _archived: false,
                _draft: false,
                ...data,
                slug,
            },
        });
    } catch (e) {
        if (
            autoCreateSlugOnFailure &&
            depth <= 5 &&
            e.response &&
            e.response.data.code === 400 &&
            e.response.data.problem_data &&
            e.response.data.problem_data.length !== 0 &&
            e.response.data.problem_data[0].slug === 'slug'
        ) {
            if (webflow.config.debug) {
                console.log(
                    `Slug "${slug} already exists for collection ${webflowCollectionId}. Going to depth ${
                        depth + 2
                    }`
                );
            }
            return await create(webflow, webflowCollectionId, data, depth + 1);
        } else {
            throw e;
        }
    }
};

const createOrUpdateWebflowItem = async (
    webflow,
    webflowCollectionId,
    webflowItemToUpdate,
    getExisting,
    shouldUpdateFn = null,
    autoCreateSlugOnFailure = true
) => {
    const existing = getExisting(webflowItemToUpdate);

    if (existing) {
        if (shouldUpdateFn && !shouldUpdateFn(webflowItemToUpdate, existing)) {
            if (webflow.config.debug) {
                console.log(
                    `Found existing webflow item for collection ${webflowCollectionId}. Not updating since shouldUpdateFn is false`
                );
            }
            return existing;
        } else {
            if (webflow.config.debug) {
                console.log(
                    `Found existing webflow item for collection ${webflowCollectionId}. Updating ${existing._id}`
                );
            }
        }
        return webflow.updateItem({
            collectionId: webflowCollectionId,
            itemId: existing._id,
            fields: {
                slug: existing.slug,
                _archived: existing._archived,
                _draft: existing._draft,
                ...webflowItemToUpdate,
            },
        });
    }

    if (webflow.config.debug) {
        console.log(
            `New webflow item for collection ${webflowCollectionId} with name ${webflowItemToUpdate.name}`
        );
    }

    return await create(
        webflow,
        webflowCollectionId,
        webflowItemToUpdate,
        autoCreateSlugOnFailure
    );
};

module.exports = createOrUpdateWebflowItem;
