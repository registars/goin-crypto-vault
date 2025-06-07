
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, GOIN_ABI, CONTRACT_OWNER } from './web3Provider';

// Enhanced provider setup with better configuration
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC, {
  name: 'bsc-testnet',
  chainId: 97
});

export const getOwnerContract = () => {
  const ownerPrivateKey = import.meta.env.VITE_OWNER_PRIVATE_KEY || process.env.OWNER_PRIVATE_KEY;
  if (!ownerPrivateKey) {
    console.error('Owner private key not configured');
    throw new Error('Owner private key not configured in environment variables');
  }
  
  const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, GOIN_ABI, ownerWallet);
};

export const verifySignature = (address: string, amount: string, signature: string, nonce: number): boolean => {
  try {
    const message = `Claim ${amount} GOIN for ${address} (nonce: ${nonce})`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

export const mintTokensToAddress = async (address: string, amount: string): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    const contract = getOwnerContract();
    
    // Convert amount to Wei (18 decimals for GOIN token)
    const amountInWei = ethers.parseEther(amount);
    
    console.log(`Attempting to mint ${amount} GOIN to ${address}`);
    console.log(`Amount in Wei: ${amountInWei.toString()}`);
    
    // Get owner wallet properly
    const ownerWallet = contract.runner as ethers.Wallet;
    const ownerAddress = ownerWallet.address;
    
    // Check owner wallet balance
    const balance = await provider.getBalance(ownerAddress);
    console.log(`Owner wallet balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.002")) {
      return { 
        success: false, 
        error: 'Insufficient BNB balance for gas fees in owner wallet. Need at least 0.002 BNB.' 
      };
    }
    
    // Get current gas price with multiplier for faster confirmation
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice ? feeData.gasPrice * BigInt(110) / BigInt(100) : undefined;
    
    // Estimate gas for the mint transaction
    let gasEstimate;
    try {
      gasEstimate = await contract.mint.estimateGas(address, amountInWei);
      console.log(`Estimated gas: ${gasEstimate.toString()}`);
    } catch (estimateError: any) {
      console.error('Gas estimation failed:', estimateError);
      
      // More specific error handling
      if (estimateError.message.includes('Ownable: caller is not the owner')) {
        return { 
          success: false, 
          error: 'Minting failed: Only contract owner can mint tokens. Please contact administrator.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to estimate gas. Contract may reject the transaction.' 
      };
    }
    
    // Execute mint transaction with optimized gas settings
    const txOptions: any = {
      gasLimit: gasEstimate * BigInt(130) / BigInt(100), // Add 30% buffer
    };
    
    if (gasPrice) {
      txOptions.gasPrice = gasPrice;
    }
    
    console.log('Transaction options:', txOptions);
    
    const tx = await contract.mint(address, amountInWei, txOptions);
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for transaction confirmation with timeout
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), 60000)
      )
    ]) as any;
    
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    return { 
      success: true, 
      txHash: tx.hash 
    };
  } catch (error: any) {
    console.error('Minting error:', error);
    
    // Enhanced error messages
    let errorMessage = 'Failed to mint tokens';
    
    if (error.message.includes('Ownable: caller is not the owner')) {
      errorMessage = 'Only the contract owner can mint tokens. Please contact administrator.';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient BNB for gas fees. Please add more BNB to owner wallet.';
    } else if (error.message.includes('execution reverted')) {
      errorMessage = 'Transaction reverted. The contract rejected the mint request.';
    } else if (error.message.includes('nonce too low')) {
      errorMessage = 'Transaction nonce error. Please try again.';
    } else if (error.message.includes('gas required exceeds allowance')) {
      errorMessage = 'Gas limit too low. Please try again.';
    } else if (error.message.includes('Transaction timeout')) {
      errorMessage = 'Transaction is taking too long. Please check BSC testnet status.';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

export const simulateBackendClaim = async (address: string, amount: string, signature: string, nonce: number): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  console.log('Starting backend claim simulation...');
  
  // Validate signature
  const isValid = verifySignature(address, amount, signature, nonce);
  
  if (!isValid) {
    console.error('Signature validation failed');
    return { success: false, error: 'Invalid signature' };
  }
  
  console.log('Signature validated successfully');
  
  // Check network status before proceeding
  try {
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
    
    if (network.chainId !== BigInt(97)) {
      return { success: false, error: 'Wrong network. Please connect to BSC Testnet.' };
    }
  } catch (networkError) {
    return { success: false, error: 'Failed to connect to BSC Testnet. Please check your internet connection.' };
  }
  
  // Try to mint tokens using owner contract
  const result = await mintTokensToAddress(address, amount);
  
  return result;
};

export const getContractBalance = async (address: string): Promise<string> => {
  try {
    const contract = getOwnerContract();
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

export const getContractInfo = async (): Promise<{ name: string; symbol: string; decimals: number; totalSupply: string }> => {
  try {
    const contract = getOwnerContract();
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    
    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatEther(totalSupply)
    };
  } catch (error) {
    console.error('Error getting contract info:', error);
    return {
      name: 'MyGOIN',
      symbol: 'GOIN',
      decimals: 18,
      totalSupply: '0'
    };
  }
};
