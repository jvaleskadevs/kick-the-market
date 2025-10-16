import { generateScoreHash } from "../generateScoreHash.js";
import { signProof } from "../signProof.js";
import { uploadNftToIpfs, uploadImageToIpfs } from "../lighthouse.js";
import { APP_KEY, LIGHTHOUSE_URL } from "../../config.js";

export async function signScore(req, res) {
  const {
    score,
    anomalyLevel,
    blackSwanLevel,
    totalClicks,
    scoreHash,
    address
  } = req.body;
  
  const appKey = req.headers['authorization'];
  if (appKey !== APP_KEY) return res.status(403).json({ error: "KTM: Forbidden" });
                                     
  if (!score || !anomalyLevel || !blackSwanLevel || !scoreHash || !address) {
    return res.status(400).json({ error: "KTM: Invalid/Missing Parameters" });
  }
  
  const computedHash = generateScoreHash(score, anomalyLevel, blackSwanLevel, totalClicks);
  if (scoreHash !== computedHash) { 
    return res.status(403).json({ error: "KTM: Forbidden", scoreHash, computedHash });
  }
  
  try {
    const metadata = {
      name: "Kick The Market",
      description: "Score of Kick The Market game.",
      imageUri: "",//imageUri.replace("ipfs://", LIGHTHOUSE_URL),
      properties: {
        player: address,
        score,
        anomalyLevel,
        blackSwanLevel,
        totalClicks   
      }
    };
    console.log(metadata);

    let imageUri = await uploadImageToIpfs("");   /// TODO pass image  
    metadata.imageUri = imageUri.replace("ipfs://", LIGHTHOUSE_URL);
    console.log(imageUri);      
    let tokenUri = await uploadNftToIpfs(metadata);    
    tokenUri = tokenUri.replace("ipfs://", LIGHTHOUSE_URL);
    console.log(tokenUri);    
    
    if (!tokenUri) return res.status(400).json({ error: "Invalid/Missing TokenUri" });
    
    const signature = await signProof(tokenUri, address);
    console.log(signature);
    
    if (!signature) return res.status(400).json({ error: "KTM: Invalid/Missing Signature" });
    
    return res.status(200).json({
      tokenUri,
      imageUri: metadata.imageUri,
      signature
    });
  } catch (err) {
    console.log(err);
  }
  
  return res.status(500).json({ error: "KTM: Something went wrong" });
}
