import { keccak256, encodePacked, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

export const signProof = async (tokenUri, address) => {
  if (!tokenUri || !address) return undefined;

  const signer = await privateKeyToAccount(process.env.OBPKM); 
  const chainId = base.id;
  
  if (!signer || !chainId) return undefined;
  
  /*
  const params: readonly [bigint, string, `0x${string}`] = 
    [BigInt(chainId), tokenUri, address];
  */
  const params = [BigInt(chainId), tokenUri, address];
  console.log(params);
  
  const message = keccak256(
    encodePacked(
      [
        'uint256',
        'string',
        'address'
      ],
      params
    )
  );

  return await signer.signMessage({
    message: {
      raw: toBytes(message)
    }  
  });
}
