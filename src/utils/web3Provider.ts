
import { ethers } from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";

export const connectWallet = async () => {
  // Metamask/TrustWallet
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  
  // WalletConnect
  const provider = new WalletConnectProvider({
    rpc: {
      56: "https://bsc-dataseed.binance.org/",
      97: "https://data-seed-prebsc-1-s1.binance.org:8545/", // BSC Testnet
    },
  });
  await provider.enable();
  return new ethers.providers.Web3Provider(provider);
};

export const getGOINContract = (provider: ethers.providers.Web3Provider) => {
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
  return new ethers.Contract(contractAddress, abi, provider.getSigner());
};

export const addBSCNetwork = async () => {
  try {
    await window.ethereum.request({
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
