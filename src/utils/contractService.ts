
import { ethers } from 'ethers';
import { getOwnerContract } from './web3Provider';

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
    
    // Check if the owner wallet has enough gas
    const balance = await contract.runner.provider.getBalance(await contract.runner.getAddress());
    console.log(`Owner wallet balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.001")) {
      return { 
        success: false, 
        error: 'Insufficient BNB balance for gas fees in owner wallet' 
      };
    }
    
    // Estimate gas for the mint transaction
    let gasEstimate;
    try {
      gasEstimate = await contract.mint.estimateGas(address, amountInWei);
      console.log(`Estimated gas: ${gasEstimate.toString()}`);
    } catch (estimateError) {
      console.error('Gas estimation failed:', estimateError);
      return { 
        success: false, 
        error: 'Failed to estimate gas. Contract may not allow minting or address is invalid.' 
      };
    }
    
    // Execute mint transaction with higher gas limit
    const tx = await contract.mint(address, amountInWei, {
      gasLimit: gasEstimate * BigInt(120) / BigInt(100), // Add 20% buffer
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    
    console.log(`Mint successful. TX Hash: ${tx.hash}`);
    
    return { 
      success: true, 
      txHash: tx.hash 
    };
  } catch (error) {
    console.error('Minting error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to mint tokens';
    if (error.message.includes('require(false)')) {
      errorMessage = 'Contract rejected the mint request. You may not have permission to mint.';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient BNB for gas fees';
    } else if (error.message.includes('execution reverted')) {
      errorMessage = 'Transaction reverted. Check contract permissions and parameters.';
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
  
  // Simulate backend delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
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
      name: 'GOIN',
      symbol: 'GOIN',
      decimals: 18,
      totalSupply: '0'
    };
  }
};
