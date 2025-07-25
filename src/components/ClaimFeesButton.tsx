/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { Network, NETWORKS } from "../services/fetcher";
import { Wallet, DollarSign, CheckCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";

// ABI simplifiée: inclure uniquement la fonction `collect`
const ABI = [
  {
    "inputs": [
      { "internalType": "tuple", "name": "params", "type": "tuple", "components": [
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
        { "internalType": "address", "name": "recipient", "type": "address" },
        { "internalType": "uint128", "name": "amount0Max", "type": "uint128" },
        { "internalType": "uint128", "name": "amount1Max", "type": "uint128" }
      ]}
    ],
    "name": "collect",
    "outputs": [
      { "internalType": "uint256", "name": "amount0", "type": "uint256" },
      { "internalType": "uint256", "name": "amount1", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

type ClaimFeesButtonProps = {
  positionId: string; 
  chainId: number;
};

type ComponentState = 
  | 'not-connected'
  | 'wrong-chain'
  | 'switching-chain'
  | 'ready-to-claim'
  | 'claiming'
  | 'confirming'
  | 'success'
  | 'error'
  | 'user-rejected';

const ClaimFeesButton: React.FC<ClaimFeesButtonProps> = ({ positionId, chainId }) => {
  const { address, isConnected, chainId: connectedChainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  
  const [state, setState] = useState<ComponentState>('not-connected');
  const [error, setError] = useState<string | null>(null);
  const [targetChain, setTargetChain] = useState<Network | null>(null);

  const { writeContract, data: hash, isPending: isWritePending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Déterminer l'état du composant
  useEffect(() => {
    const chain = NETWORKS.find(net => net.id === chainId);
    setTargetChain(chain || null);

    if (!isConnected) {
      setState('not-connected');
      return;
    }

    if (!chain) {
      setState('error');
      setError(`Chaîne non supportée: ${chainId}`);
      return;
    }

    if (isSwitchingChain) {
      setState('switching-chain');
      return;
    }

    if (connectedChainId !== chainId) {
      setState('wrong-chain');
      return;
    }

    if (isSuccess) {
      setState('success');
      // Déclencher la mise à jour des positions après un délai
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('positions-updated'));
      }, 2000); // Attendre 2 secondes pour que la transaction soit propagée
      return;
    }

    if (isWritePending) {
      setState('claiming');
      return;
    }

    if (isConfirming) {
      setState('confirming');
      return;
    }

    setState('ready-to-claim');
  }, [isConnected, connectedChainId, chainId, isSwitchingChain, isWritePending, isConfirming, isSuccess]);

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    connect({ connector: connectors[0] });
  };

  const handleSwitchChain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetChain) return;

    try {
      setError(null);
      await switchChain({ chainId: targetChain.id });
    } catch (err: any) {
      const errorMessage = err.message || "Échec du changement de chaîne";
      const isRejection = errorMessage.includes("rejected") || 
                         errorMessage.includes("denied") || 
                         errorMessage.includes("cancelled");
      
      if (isRejection) {
        setState('user-rejected');
        setTimeout(() => setState('wrong-chain'), 3000);
      } else {
        setState('error');
        setError(errorMessage);
      }
    }
  };

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address || !targetChain) return;

    try {
      setError(null);
      reset();

      const params = {
        tokenId: BigInt(positionId),
        recipient: address,
        amount0Max: BigInt("0xffffffffffffffffffffffffffffffff"),
        amount1Max: BigInt("0xffffffffffffffffffffffffffffffff"),
      };

      writeContract({
        address: targetChain.nonfungiblePositionManagerAddress as `0x${string}`,
        abi: ABI,
        functionName: "collect",
        args: [params],
      });
    } catch (err: any) {
      setState('error');
      setError(err.message || "Échec de la réclamation");
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    setState('ready-to-claim');
  };

  // Rendu basé sur l'état
  switch (state) {
    case 'not-connected':
      return (
        <button 
          onClick={handleConnect}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect</span>
        </button>
      );

    case 'wrong-chain':
      return (
        <button 
          onClick={handleSwitchChain}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Switch to {targetChain?.name}</span>
          <span className="sm:hidden">Switch</span>
        </button>
      );

    case 'switching-chain':
      return (
        <button 
          disabled
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Switching chain...</span>
          <span className="sm:hidden">Switching</span>
        </button>
      );

    case 'claiming':
      return (
        <button 
          disabled
          className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Confirming...</span>
          <span className="sm:hidden">Confirming</span>
        </button>
      );

    case 'confirming':
      return (
        <button 
          disabled
          className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Processing...</span>
          <span className="sm:hidden">Processing</span>
        </button>
      );

    case 'success':
      return (
        <button 
          disabled
          className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Claimed</span>
          <span className="sm:hidden">✓</span>
        </button>
      );

    case 'user-rejected':
      return (
        <button 
          onClick={handleSwitchChain}
          className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Try Again</span>
          <span className="sm:hidden">Retry</span>
        </button>
      );

    case 'error':
      return (
        <button 
          onClick={handleRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          title={error || undefined}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Retry</span>
          <span className="sm:hidden">Retry</span>
        </button>
      );

    case 'ready-to-claim':
    default:
      return (
        <button 
          onClick={handleClaim}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
        >
          <DollarSign className="w-4 h-4" />
          <span>Claim</span>
        </button>
      );
  }
};

export default ClaimFeesButton;