
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
  const contractAddress = "0xf202f380d4e244d2b1b0c6f3de346a1ce154cc7a"; // GOIN contract address
  const abi = [
    // Standard BEP20 ABI + additional functions
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function owner() view returns (address)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
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

// Create a contract instance with owner private key for backend operations
export const getOwnerContract = () => {
  const ownerPrivateKey = "e43cea9d111153f17b0923a4c3917bf8774b3772fce4ccb56b39dbd4751de0ff";
  const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
  const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
  
  const contractAddress = "0xf202f380d4e244d2b1b0c6f3de346a1ce154cc7a";
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function owner() view returns (address)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ];
  
  return new Contract(contractAddress, abi, ownerWallet);
};
