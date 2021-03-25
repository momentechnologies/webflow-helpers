const axios = require("axios");
const config = require("./config");

const createSlug = (name, depth) => {
  const rawSlug = name
    .replace(/ø/gim, "o")
    .replace(/æ/gim, "ae")
    .replace(/å/gim, "aa")
    .replace(/[^a-z0-9]/gim, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .replace(/^-+/g, "")
    .replace(/-+$/g, "")
    .toLowerCase();

  if (depth === 0) {
    return rawSlug;
  }

  return `${rawSlug}-${depth + 1}`;
};

const create = async (config, webflowCollection, data, depth = 0) => {
  const slug = createSlug(data.name, depth);

  try {
    return await axios({
      url: `${config.url}/collections/${webflowCollection}/items?live=true`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "accept-version": "1.0.0",
      },
      data: {
        fields: {
          _archived: false,
          _draft: false,
          ...data,
          slug,
        },
      },
    });
  } catch (e) {
    if (
      depth <= 5 &&
      e.response &&
      e.response.data.code === 400 &&
      e.response.data.problem_data.length !== 0 &&
      e.response.data.problem_data[0].slug === "slug"
    ) {
      console.log(
        `Slug "${slug} already exists for collection ${webflowCollection}. Going to depth ${
          depth + 2
        }`
      );
      await create(webflowCollection, data, depth + 1);
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
    return axios({
      url: `${config.url}/collections/${webflowCollection}/items/${existing._id}?live=true`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "accept-version": "1.0.0",
      },
      data: {
        fields: {
          slug: existing.slug,
          _archived: existing._archived,
          _draft: existing._draft,
          ...webflowItemToUpdate,
        },
      },
    });
  }

  console.log(
    `New webflow article for collection ${webflowCollection} with name ${webflowItemToUpdate.name}`
  );

  return await create(config, webflowCollection, webflowItemToUpdate);
};

module.exports = createOrUpdateWebflowItem;
