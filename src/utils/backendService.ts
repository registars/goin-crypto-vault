import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { CONTRACT_ADDRESS, GOIN_ABI } from './walletUtils';

dotenv.config();

// Inisialisasi provider (BSC Testnet)
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');

// Fungsi untuk mendapatkan kontrak dengan akses owner (AMAN - di backend)
export const getOwnerContract = () => {
  const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY; // Dari environment variable
  if (!ownerPrivateKey) {
    throw new Error('Owner private key not configured');
  }
  
  const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, GOIN_ABI, ownerWallet);
};

// Fungsi untuk backend minting
export const ownerMint = async (toAddress: string, amount: string) => {
  try {
    const contract = getOwnerContract();
    
    if (!ethers.isAddress(toAddress)) {
      throw new Error("Invalid recipient address");
    }

    const tx = await contract.mint(toAddress, amount);
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error("Owner minting error:", error);
    return { success: false, error: error.message };
  }
};
