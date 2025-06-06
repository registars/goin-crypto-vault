
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
    const amountInWei = ethers.parseEther(amount);
    
    console.log(`Minting ${amount} GOIN to ${address}`);
    
    // Execute mint transaction
    const tx = await contract.mint(address, amountInWei);
    await tx.wait();
    
    console.log(`Mint successful. TX Hash: ${tx.hash}`);
    
    return { 
      success: true, 
      txHash: tx.hash 
    };
  } catch (error) {
    console.error('Minting error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to mint tokens' 
    };
  }
};

export const simulateBackendClaim = async (address: string, amount: string, signature: string, nonce: number): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  // Validate signature
  const isValid = verifySignature(address, amount, signature, nonce);
  
  if (!isValid) {
    return { success: false, error: 'Invalid signature' };
  }
  
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
