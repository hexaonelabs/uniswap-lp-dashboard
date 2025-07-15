const fs = require("fs");
const axios = require("axios");
const { DEFAULT_LIST_OF_LISTS } = require("./tokenLists.cjs");
const { base, mainnet, arbitrum } = require("viem/chains");
const uniJsonTOkensList = require("./uni-tokens-list.json");
const TOKEN_URLS = DEFAULT_LIST_OF_LISTS;

const CHAINID_MAPPING = {
  [mainnet.id]: "ethereum",
  [arbitrum.id]: "arbitrum",
  [base.id]: "base",
};
const tokensFromJson = [
  {data: uniJsonTOkensList},
];
console.log(`Using token lists from: `, uniJsonTOkensList.name);
Promise.all(TOKEN_URLS.map((url) => axios.get(url)))
  .then((lists) => {
    return [
      ...lists,
      ...tokensFromJson,
    ].map((list) => list.data.tokens).flat();
  })
  .then((tokens) => {
    return tokens
      .filter((t) => t !== undefined && t.logoURI)
      .reduce((result, curr) => {
        const platform = CHAINID_MAPPING[+curr.chainId];
        if (platform === undefined) return result;
        if (!result[platform]) result[platform] = {};

        let logoURI = curr.logoURI;
        if (logoURI.indexOf("ipfs://") !== -1) {
          logoURI = logoURI.replace(`ipfs://`, `https://ipfs.io/ipfs/`);
        }
        result[platform][curr.address.toLowerCase()] = logoURI;
        return result;
      }, {});
  })
  .then((data) => {
    const filepath = "./src/utils/uniswap/tokenImageURI.json";

    fs.writeFileSync(filepath, JSON.stringify(data, 2, 2));
    console.log(`[DONE] Generated token image URI mapping file to ${filepath}`);
  })
  .catch((error) => {
    console.error(`[Error] ${error.message}`);
  });