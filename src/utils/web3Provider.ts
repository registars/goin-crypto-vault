
import { ethers, BrowserProvider, Contract } from 'ethers';

export const connectWallet = async () => {
  // Metamask/TrustWallet
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return new BrowserProvider(window.ethereum);
  }
  
  throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
};

export const getGOINContract = (provider: BrowserProvider) => {
  const contractAddress = "0xf202f380d4e244d2b1b0c6f3de346a1ce154cc7a"; // Alamat kontrak GOIN
  const abi = [
    // Standard BEP20 ABI + fungsi tambahan
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
  ];
  return new Contract(contractAddress, abi, provider);
};

export const addBSCNetwork = async () => {
  try {
    await window.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x61', // BSC Testnet
        chainName: 'BSC Testnet',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'tBNB',
          decimals: 18
        },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com/']
      }]
    });
  } catch (error) {
    console.error("Error adding BSC network:", error);
  }
};
