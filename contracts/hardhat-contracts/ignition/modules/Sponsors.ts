import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Sponsors0Module", (m) => {
  const JACKPOT_ADDRESS = "0x8fe2e15D644baF41D40ba42f858c8B3b6Cb09b80";
  
  const sponsors = m.contract(
    "Sponsors", 
    [JACKPOT_ADDRESS],
    { id: "SPONSORSS"} 
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
  const description1 = "Building the future we deserver";
  const website1 = "https://farcaster.xyz/~/diamondlabs";
  
  const tierBronze = 2;
  const name2 = "OBA";
  const cta2 = "GENERATE IMAGE";
  const cta3 = "BEEP BOOP";
  const cta4 = "GENERATE GIFS";
  const description2 = "Onchain Blocks Agency";
  const website2 = "https://obagents.vercel.app";
  
  const logoUrl = "ipfs://logo";
  
  // 1 gold
  //const valueGold = m.call(sponsors, "GOLD_PRICE", []);

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
    { id: "GOLD", value: BigInt(1000000000000)}
  );
  
  // 2 silver
  //const valueSilver = m.call(sponsors, "SILVER_PRICE", []);
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
    { id: "SILVER_0",  value: BigInt(690000000000)}   
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
    { id: "SILVER_1", value: BigInt(690000000000)}   
  );
  
  // 3 bronze
  //const valueBronze = m.call(sponsors, "BRONZE_PRICE", []);

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
    { id: "BRONZE_0", value: BigInt(420000000000)}   
  );
  
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
    { id: "BRONZE_1", value: BigInt(420000000000)} 
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
    { id: "BRONZE_2", value: BigInt(420000000000)} 
  );
 
  return { sponsors };
});
