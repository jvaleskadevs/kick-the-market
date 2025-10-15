import React, { useCallback, useEffect, useRef, useState } from 'react';
import sdk from "@farcaster/frame-sdk";
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { erc721Abi } from './abis/erc721';
import Game from './Game';
import { APP_KEY } from './config';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

const GAME_SCORE_NFT_ADDRESS = '0x3BEB5a1A7a6d5A77f0e570a68EF35580106E455F';
const DEFAULT_HASH = '0x0000000000000000000000000000000000000000000000000000000000000001';

function App() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState();
  const [hapticsOn, setHapticsOn] = useState(false);
  const [mintParams, setMintParams] = useState(null);
  
  const gameRef = useRef(null);
  
  const { address, isConnected } = useAccount();
  const { writeContract, data, error } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const signProof = async (mintParams, address) => {
    try {
      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: {
          'Authorization': APP_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: mintParams.score,
          anomalyLevel: mintParams.anomalyLevel,
          blackSwanLevel: mintParams.blackSwanLevel,
          scoreHash: mintParams.hash,
          totalClicks: mintParams.totalClicks,
          address
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }

      return await response.json();
    } catch (err) {
      console.error(err.message);
    }
    return { error: "Something went wrong" };
  };


  const mintScore = useCallback(
    async () => {
      if (!mintParams || !mintParams.score || !mintParams.anomalyLevel || !mintParams.blackSwanLevel || !mintParams.totalClicks || !mintParams.hash) {
        console.error("missing mintParams", mintParams);
        document.dispatchEvent(
          new CustomEvent('mint-result', {
            detail: { success: false, message: "Missing game data" },
          })
        );
        return;
      }
      
      const { signature, tokenUri, imageUri } = await signProof(mintParams, address);
      console.log(signature);
      console.log(tokenUri);
      console.log(imageUri);
      
      if (!signature || !tokenUri || !imageUri) {
        console.error("missing proof", { signature, tokenUri, imageUri });
        document.dispatchEvent(
          new CustomEvent('mint-result', {
            detail: { success: false, message: "Missing signature/tokenUri" },
          })
        );
        return;      
      }

      switchChain(
        { chainId: baseSepolia.id },
        { 
          onSuccess: () => {
            writeContract({
              address: GAME_SCORE_NFT_ADDRESS,
              abi: erc721Abi,
              functionName: 'mint',
              chainId: baseSepolia.id,
              args: [ 
                //tokenUri,                
                mintParams?.score || '1', 
                mintParams?.anomalyLevel || '1', 
                mintParams?.blackSwanLevel || '1', 
                //mintParams?.totalClicks || '1',
                mintParams?.hash || DEFAULT_HASH
                //signature,
              ]
            }, 
            {
              onSuccess: (hash) => {
                console.log('hash', hash)
                document.dispatchEvent(
                  new CustomEvent('mint-result', {
                    detail: { success: true, message: "Minted " + hash, hash },
                  })
                );
                setMintParams(null);
              },
              onError: (e) => {
                console.error('mierror', e),
                document.dispatchEvent(
                  new CustomEvent('mint-result', {
                    detail: { success: false, message: e.shortMessage || e.message },
                  })
                );
              }
            })
          },
          onError: (err) => {
            console.error('Error changing network:', err);
            document.dispatchEvent(
              new CustomEvent('mint-result', {
                detail: { success: false, message: 'Failed to switch to Base' },
              })
            );
          }
        }
      )
    },
    [writeContract, mintParams, switchChain]
  );

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);        
      await sdk.actions.ready({ disableNativeGestures: true });
      const capabilities = await sdk.getCapabilities();
      if (capabilities?.includes('haptics.impactOccurred')) {
        setHapticsOn(true);
      }
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);  

  useEffect(() => {
    const handleOpenConnectModal = async () => {
      if (!address || !isConnected) {
        const connectWalletBtn = document.querySelector('[data-testid="rk-connect-button"]');
        if (connectWalletBtn) {
          connectWalletBtn.click();
        } else {
          console.error("nobutton");
        }
      }
    };

    document.addEventListener('open-wallet-modal', handleOpenConnectModal);

    return () => {
      document.removeEventListener('open-wallet-modal', handleOpenConnectModal);
    };
  }, []);

  useEffect(() => {
    if (gameRef.current && !window.phaserGame) {
      window.phaserGame = new Game(
        gameRef.current, { address, isConnected, mintScore, setMintParams }
      );
    }

    return () => {
      if (window.phaserGame) {
        window.phaserGame.destroy(true);
        window.phaserGame = null;
      }
    };
  }, [isConnected, address, setMintParams]);

  return (
    <div className="App">
      <div ref={gameRef} id="game-container" style={{ width: '100vw', height: '100vh' }} />
      <ConnectButton />
      <button
        id="mint-trigger"
        style={{ position: 'absolute', left: -9999, pointerEvents: 'none' }}
        onClick={mintScore}
      >
        Mint
      </button>
    </div>
  );
}

export default App;
