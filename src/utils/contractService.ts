
import { ethers } from 'ethers';
import { getGOINContract } from './web3Provider';

export const verifySignature = (address: string, amount: string, signature: string, nonce: number): boolean => {
  try {
    const message = `Claim ${amount} GOIN for ${address} (nonce: ${nonce})`;
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

export const simulateBackendClaim = async (address: string, amount: string, signature: string, nonce: number): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  // Simulasi validasi backend
  const isValid = verifySignature(address, amount, signature, nonce);
  
  if (!isValid) {
    return { success: false, error: 'Invalid signature' };
  }
  
  // Simulasi delay backend
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulasi transaction hash
  const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
  
  return { 
    success: true, 
    txHash: mockTxHash 
  };
};
