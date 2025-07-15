const axios = require("axios");
// https://github.com/Uniswap/interface/blob/main/src/constants/lists.ts
// const UNI_LIST = "https://gateway.ipfs.io/ipns/tokens.uniswap.org";
// const UNI_UNSUPPORTED_LIST = "https://ipfs.io/ipns/unsupportedtokens.uniswap.org";
// const COINGECKO_LIST = "https://tokens.coingecko.com/uniswap/all.json";
// const ARBITRUM = `https://tokenlist.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json`;



const DEFAULT_LIST_OF_LISTS = [
  // UNI_LIST,
  // UNI_UNSUPPORTED_LIST,
  // COINGECKO_LIST,
  // ARBITRUM,
];

module.exports = {
  DEFAULT_LIST_OF_LISTS,
};