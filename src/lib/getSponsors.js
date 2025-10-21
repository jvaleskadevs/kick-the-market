import { allSponsorsQuery, sponsorsByWeekQuery } from "./queries.js";
import { ENVIO_DB_ENDPOINT } from "../config.js";

export const getAllSponsors = async () => {
  try {
    const response = await fetch(ENVIO_DB_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'testing',
      },
      body: JSON.stringify({ 
        query: allSponsorsQuery
      })
    });
    
    if (!response.ok) {
      console.error(response.message);
      return [];
    }
    
    const data = await response.json();
    //console.log(data.data);
    
    return data.data.Sponsors_NewSponsor;
  } catch (err) {
    console.error(err);
    return [];
  }
  return [];
}

export const getSponsorsByWeek = async (week) => {
  try {
    const response = await fetch(ENVIO_DB_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'testing',
      },
      body: JSON.stringify({ 
        query: sponsorsByWeekQuery,
        variables: {
          week: { _eq: week }
        }
      })
    });
    
    if (!response.ok) {
      console.error(response.message);
      return [];
    }
    
    const data = await response.json();
    //console.log(data.data);
    
    return data.data.Sponsors_NewSponsor;
  } catch (err) {
    console.error(err);
    return [];
  }
  return [];
}
