import { leaderboardQuery } from "./queries.js";
import { ENVIO_DB_ENDPOINT } from "../config.js";

export const getLeaderboard = async () => {
  try {
    const response = await fetch(ENVIO_DB_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'testing',
      },
      body: JSON.stringify({ query: leaderboardQuery })
    });
    
    if (!response.ok) {
      console.error(response.message);
      return [];
    }
    
    const data = await response.json();
    console.log(data.data);
    
    return data.data.KickTheMarket_Mint;
  } catch (err) {
    console.error(err);
    return [];
  }
  return [];
}
