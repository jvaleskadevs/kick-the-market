export const APP_KEY = "afbwnaj54jq5ng2";
export const SITE_URL = process.env.NODE_ENV === "development" ? 
  "http://localhost:5173" : 
  "https://kickthemarket.vercel.app";

export const FREE_KTM_SCORE_NFT_ADDRESS = "0x88D7188ce5afDb4B6148aBCFcbdCe14911E68D91";
export const KTM_SCORE_NFT_ADDRESS = "0x6ECFf023610e5F1e8047A5fE93c1Ab7b71E78BF8";
export const JACKPOT_ADDRESS = "0x8fe2e15D644baF41D40ba42f858c8B3b6Cb09b80";
//export const KTM_SCORE_NFT_ADDRESS = "0x21A169686c2bcDc19Ca38d94Fcb24153cbda5B05";


export const LIGHTHOUSE_URL = "https://gateway.lighthouse.storage/ipfs/";
export const ENVIO_DB_ENDPOINT = process.env.NODE_ENV === "development" ? 
  "http://localhost:8080/v1/graphql" :
  "";
