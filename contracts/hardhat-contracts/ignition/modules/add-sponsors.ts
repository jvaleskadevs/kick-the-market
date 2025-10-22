import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AddSponsorsModule", (m) => {
  const SPONSORS_ADDRESS = "0x4f17a5529B4E3e20467774708435740792E460eE";
  
  const sponsors = m.contractAt(
    "Sponsors", 
    SPONSORS_ADDRESS
  );
  
  const week = 0;
  const tierGold = 0;
  const name0 = "Onchain Blocks";
  const cta0 = "Join Channel";
  const description0 = "Let the fun begin anon blockmate";
  const website0 = "https://farcaster.xyz/~/channel/onchain-blocks";
  
  const tierSilver = 1;
  const name1 = "Diamond Labs";
  const cta1 = "Build with us";
  const description1 = "Building the future we deserve";
  const website1 = "https://farcaster.xyz/~/diamondlabs";
  
  const tierBronze = 2;
  const name2 = "OBA";
  const cta2 = "GENERATE IMAGE";
  const cta3 = "BEEP BOOP";
  const cta4 = "GENERATE GIFS";
  const description2 = "Onchain Blocks Agency";
  const website2 = "https://obagents.vercel.app";
  
  const logoUrl = "ipfs://logo";

  // set normal prices back

  m.call(sponsors, "setPrices",
    [
      BigInt(1000000000000),
      BigInt(690000000000),
      BigInt(420000000000)
    ],
    { id: "BACKPRICES__"}
  );


  // set the prices on zero to set our default ads for free
/*
  m.call(sponsors, "setPrices",
    [
      BigInt(0),
      BigInt(0),
      BigInt(0)
    ],
    { id: "ZEROPRICES_"}
  );
*/ 
  // 1 gold
  //const valueGold = m.staticCall(sponsors, "GOLD_PRICE", []);

  m.call(sponsors, "sponsorize",
    [
      week,
      tierGold,
      name0,
      cta0,
      description0,
      website0,
      logoUrl
    ],
    { id: "GOLD_", value: BigInt(0)}
  );
  
  // 2 silver
  //const valueSilver = m.staticCall(sponsors, "SILVER_PRICE", []);
/*
  m.call(sponsors, "sponsorize",
    [
      week,
      tierSilver,
      name1,
      cta1,
      description1,
      website1,
      logoUrl
    ] ,
    { id: "SILVER_0__",  value: BigInt(0)}   
  );
  
  m.call(sponsors, "sponsorize",
    [
      week,
      tierSilver,
      name1,
      cta1,
      description1,
      website1,
      logoUrl
    ],
    { id: "SILVER_1__", value: BigInt(0)}   
  );
*/  
  // 3 bronze
  //const valueBronze = m.staticCall(sponsors, "BRONZE_PRICE", []);
/*
  m.call(sponsors, "sponsorize",
    [
      week,
      tierBronze,
      name2,
      cta2,
      description2,
      website2,
      logoUrl
    ],
    { id: "BRONZE_0__", value: BigInt(0)}   
  );
*/
/*  
  m.call(sponsors, "sponsorize",
    [
      week,
      tierBronze,
      name2,
      cta3,
      description2,
      website2,
      logoUrl
    ],
    { id: "BRONZE_1__", value: BigInt(0)} 
  );
 
  m.call(sponsors, "sponsorize",
    [
      week,
      tierBronze,
      name2,
      cta4,
      description2,
      website2,
      logoUrl
    ],
    { id: "BRONZE_2__", value: BigInt(0)} 
  );
  // okay.. hardhat starts running these calls from the last one..
  // setting prices on zero here.. and back to normal on top !!
/*
  m.call(sponsors, "setPrices",
    [
      BigInt(0),
      BigInt(0),
      BigInt(0)
    ],
    { id: "ZEROPRICES__"}
  );
*/  
  // set normal prices back
/*
  m.call(sponsors, "setPrices",
    [
      BigInt(1000000000000),
      BigInt(690000000000),
      BigInt(420000000000)
    ],
    { id: "BACKPRICES"}
  );
*/ 
  return { sponsors };
});
