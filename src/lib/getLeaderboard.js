import { leaderboardQuery } from "./queries.js";
import { ENVIO_DB_ENDPOINT, FREE_KTM_SCORE_NFT_ADDRESS, KTM_SCORE_NFT_ADDRESS } from "../config.js";

export const getLeaderboard = async (leaderboardType) => {
  try {
    const response = await fetch(ENVIO_DB_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'x-hasura-admin-secret': 'testing',
      },
      body: JSON.stringify({ 
        query: leaderboardQuery,
        variables: {
          ktm: leaderboardType === 'free' ? 
            FREE_KTM_SCORE_NFT_ADDRESS : 
            KTM_SCORE_NFT_ADDRESS
        }
      })
    });
    
    if (!response.ok) {
      console.error(response.message);
      return [];
    }
    
    const data = await response.json();
    //console.log(data.data);
    
    return data.data.KickTheMarket_Mint;
  } catch (err) {
    console.error(err);
    return [];
  }
  return [];
}
