import React, { useCallback, useEffect, useRef, useState } from 'react';
import sdk from "@farcaster/frame-sdk";
import { parseEventLogs, parseEther } from 'viem'; 
import { useAccount, useBalance, useReadContract, useWaitForTransactionReceipt, useWatchContractEvent, useWriteContract, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { erc721Abi } from './abis/erc721';
import { ktmAbi } from './abis/ktm';
import Game from './Game';
import { 
  APP_KEY, 
  FREE_KTM_SCORE_NFT_ADDRESS, 
  KTM_SCORE_NFT_ADDRESS, 
  JACKPOT_ADDRESS,
  SPONSORS_ADDRESS
} from './config';
import { jackpotAbi } from './abis/jackpot';
import { sponsorsAbi } from './abis/sponsors';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

//import { getSponsorsByWeek } from './lib/getSponsors';

function App() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState();
  const [hapticsOn, setHapticsOn] = useState(false);
  const [mintParams, setMintParams] = useState(null);
  const [sponsorParams, setSponsorParams] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  
  const gameRef = useRef(null);
  
  const { address, isConnected } = useAccount();
  const { writeContract, data, error } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const { data: jackpotFee } = useReadContract({
    address: JACKPOT_ADDRESS,
    abi: jackpotAbi,
    functionName: 'getJackpotFee',
    chainId: baseSepolia.id,
  });

  const { data: mintPrice } = useReadContract({
    address: KTM_SCORE_NFT_ADDRESS,
    abi: ktmAbi,
    functionName: 'mintPrice',
    chainId: baseSepolia.id,
  });
  
  const { data: sponsors } = useReadContract({
    address: SPONSORS_ADDRESS,
    abi: sponsorsAbi,
    functionName: 'currentAds',
    chainId: baseSepolia.id,
  });
  
  const { data: walletBalance } = useBalance({
    address,
    chainId: baseSepolia.id,
  });
  
  const { data: txReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: baseSepolia.id,
  });
  
  useWatchContractEvent({
    address: JACKPOT_ADDRESS,
    abi: jackpotAbi,
    eventName: 'RandomNumberResult',
    args: { sequenceNumber: ticketId },
    chainId: baseSepolia.id,
    enabled: !!ticketId,
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log;
        const { isWinner } = args;
        console.log("isWinner: ", isWinner);
        
        if (isWinner) {                          
          document.dispatchEvent(
            new CustomEvent('jackpot-result', {
              detail: { 
                success: true, 
                message: `🎉 Congrats! You won the jackpot!` 
              },
            })
          );
        } else {
          document.dispatchEvent(
            new CustomEvent('jackpot-result', {
              detail: { 
                success: false, 
                message: 'You did not win the jackpot. Good luck next time!' 
              },
            })
          );
        }
      }
      setTicketId(null);
    }
  }); 
/*  
  useWatchContractEvent(config, {
    address: jackpotAddress,
    abi: jackpotAbi,
    eventName: 'JackpotWinner',
    args: { ticketId },
    chainId: baseSepolia.id,
    onLogs: (logs) => {
      for (const log of logs) {
        const { args } = log;
        document.dispatchEvent(
          new CustomEvent('jackpot-result', {
            detail: { 
              success: true, 
              message: `${args.player} just won ${Number(args.prize) / 1e18} ETH!` 
            },
          })
        );
      }
    }
  });
*/
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
      
      console.log(mintParams);
      const isFree = mintParams.isFree || false;
      const ktmContract = isFree ? FREE_KTM_SCORE_NFT_ADDRESS : KTM_SCORE_NFT_ADDRESS;
      
      if (!jackpotFee || (!mintPrice && !isFree)) {
        console.error("Jackpot fee or mint price not loaded");
        document.dispatchEvent(
          new CustomEvent('mint-result', {
            detail: { success: false, message: "Please, try again" },
          })
        );
        return;
      }

      const requiredETH = BigInt(isFree ? '0': mintPrice) + BigInt(jackpotFee) + BigInt(11111);
      console.log("requiredETH", requiredETH);
      
      if (walletBalance && walletBalance.value < requiredETH) {
        document.dispatchEvent(
          new CustomEvent('mint-result', {
            detail: { success: false, message: "Insufficient ETH for mint + fee" },
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
              address: ktmContract,
              abi: erc721Abi,
              functionName: 'mint',
              chainId: baseSepolia.id,
              args: [ 
                tokenUri,                
                mintParams?.score || '1', 
                mintParams?.anomalyLevel || '1', 
                mintParams?.blackSwanLevel || '1', 
                mintParams?.totalClicks || '1',
                signature
              ],
              value: requiredETH
            }, 
            {
              onSuccess: async (hash) => {
                console.log('hash', hash);
                document.dispatchEvent(
                  new CustomEvent('mint-result', {
                    detail: { success: true, message: "Minted " + hash, hash },
                  })
                );                
                setTxHash(hash);
                setMintParams(null);
              },
              onError: (e) => {
                console.error('error', e);
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
    [writeContract, mintParams, switchChain, jackpotFee, mintPrice, address]
  );
  
  const sponsorize = useCallback(
    async () => {
      if (!sponsorParams || !sponsorParams.name || !sponsorParams.description || !sponsorParams.cta || !sponsorParams.website || !sponsorParams.logoUrl || !sponsorParams.tier) {
        console.error("missing sponsorParams", sponsorParams);
        document.dispatchEvent(
          new CustomEvent('sponsorize-result', {
            detail: { success: false, message: "Missing sponsor data" },
          })
        );
        return;
      }
      
      console.log(sponsorParams);
      const requiredETH = sponsorParams.tier === "gold" ? 
        parseEther('0.01') :
          sponsorParams.tier === "silver" ? 
            parseEther('0.0069') : parseEther('0.0042');
      console.log("requiredETH", requiredETH);
      
      const sponsorTier = sponsorParams.tier === "gold" ? 
        BigInt(0) :
          sponsorParams.tier === "silver" ? 
            BigInt(1) : BigInt(2);
      
      if (walletBalance && walletBalance.value < requiredETH) {
        document.dispatchEvent(
          new CustomEvent('sponsorize-result', {
            detail: { success: false, message: "Insufficient ETH for sponsorship tier" },
          })
        );
        return;
      }

      switchChain(
        { chainId: baseSepolia.id },
        { 
          onSuccess: () => {
            writeContract({
              address: SPONSORS_ADDRESS,
              abi: sponsorsAbi,
              functionName: 'sponsorize',
              chainId: baseSepolia.id,
              args: [ 
                '1', // TODO: select future weeks
                sponsorTier,
                sponsorParams.name,
                sponsorParams.cta,
                sponsorParams.description,
                sponsorParams.website,
                sponsorParams.logoUrl
              ],
              value: requiredETH
            }, 
            {
              onSuccess: async (hash) => {
                console.log('hash', hash);
                document.dispatchEvent(
                  new CustomEvent('sponsorize-result', {
                    detail: { success: true, message: "Success " + hash, hash },
                  })
                );                
                setTxHash(hash);
                setSponsorParams(null);
              },
              onError: (e) => {
                console.error('error', e);
                document.dispatchEvent(
                  new CustomEvent('sponsorize-result', {
                    detail: { success: false, message: e.shortMessage || e.message },
                  })
                );
              }
            })
          },
          onError: (err) => {
            console.error('Error changing network:', err);
            document.dispatchEvent(
              new CustomEvent('sponsorize-result', {
                detail: { success: false, message: 'Failed to switch to Base' },
              })
            );
          }
        }
      )
    },
    [writeContract, sponsorParams, switchChain, address]
  );
  
  useEffect(() => {
    function parseLogsFromReceipt() {
      let ticketId = null;

      try {        
        const parsedLogs = parseEventLogs({
          abi: jackpotAbi,
          eventName: 'TicketAssigned',
          args: {
            player: address.toLowerCase()
          },
          logs: txReceipt.logs,
        });       
        console.log(parsedLogs);
        
        const ticketAssignedLog = parsedLogs.find(
          (log) =>
            log.eventName === 'TicketAssigned' &&
            log.args.player.toLowerCase() === address.toLowerCase()
        );

        if (ticketAssignedLog) {
          ticketId = ticketAssignedLog.args.ticketId;
          console.log('Found ticketId:', ticketId);
        } else {
          console.error('No TicketAssigned event found for this player');
        }
      } catch (err) {
        console.error('Failed to parse event logs:', err);
      }                 

      if (!ticketId) {
        console.error('No TicketAssigned event found for player');
        document.dispatchEvent(
          new CustomEvent('jackpot-result', {
            detail: { success: false, message: 'Could not find the ticketId' },
          })
        );
      } else {
        setTicketId(ticketId);
      } 
    }
    
    if (txReceipt) parseLogsFromReceipt(); 
  }, [txReceipt]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);        
      await sdk.actions.ready({ disableNativeGestures: true });
      const capabilities = await sdk.getCapabilities();
      if (capabilities?.includes('haptics.impactOccurred')) {
        setHapticsOn(true);
      }
            // const allSponsors = await getSponsorsByWeek(0);
           //console.log(allSponsors);
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
        gameRef.current, { address, isConnected, mintScore, setMintParams, setSponsorParams, sponsors }
      );
    }

    return () => {
      if (window.phaserGame) {
        window.phaserGame.destroy(true);
        window.phaserGame = null;
      }
    };
  }, [isConnected, address, setMintParams, setSponsorParams, sponsors]);

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
      <button
        id="sponsor-trigger"
        style={{ position: 'absolute', left: -9999, pointerEvents: 'none' }}
        onClick={sponsorize}
      >
        Sponsorize
      </button>
    </div>
  );
}

export default App;
