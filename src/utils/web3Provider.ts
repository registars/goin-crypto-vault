
import { ethers, BrowserProvider, Contract } from 'ethers';

// Konfigurasi jaringan dan kontrak
export const CONTRACT_ADDRESS = "0xf202f380d4e244d2b1b0c6f3de346a1ce154cc7a";
export const CONTRACT_OWNER = "0x4f0412CC1Ea121e553c9cC49B66affA2Ec9F9380";
export const BSC_TESTNET_CHAIN_ID = "0x61";

// Complete ABI JSON from the smart contract
export const GOIN_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Fungsi untuk koneksi wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
  }
  
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return new BrowserProvider(window.ethereum);
};

// Fungsi untuk mendapatkan instance kontrak
export const getGOINContract = (provider: BrowserProvider) => {
  return new Contract(CONTRACT_ADDRESS, GOIN_ABI, provider);
};

// Export the getOwnerContract function for compatibility
export const getOwnerContract = (provider?: BrowserProvider) => {
  if (provider) {
    return getGOINContract(provider);
  }
  // For backend usage, this will be handled in contractService
  throw new Error('Provider required for getOwnerContract');
};

// Fungsi untuk memeriksa jaringan
export const checkNetwork = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  
  if (network.chainId !== BigInt(parseInt(BSC_TESTNET_CHAIN_ID, 16))) {
    throw new Error("Please connect to BSC Testnet");
  }
};

// Fungsi untuk menambahkan BSC Testnet ke wallet
export const addBSCNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: BSC_TESTNET_CHAIN_ID,
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
    return true;
  } catch (error) {
    console.error("Error adding BSC network:", error);
    return false;
  }
};

// Fungsi untuk transfer token (frontend) - using standard ERC20 transfer
export const transferTokens = async (provider: BrowserProvider, toAddress: string, amount: string) => {
  try {
    await checkNetwork();
    
    const signer = await provider.getSigner();
    const contract = getGOINContract(provider).connect(signer);
    
    if (!ethers.isAddress(toAddress)) {
      throw new Error("Invalid recipient address");
    }

    // Convert amount to Wei (18 decimals for GOIN token)
    const amountInWei = ethers.parseEther(amount);

    // Estimasi gas dengan buffer 20%
    const estimatedGas = await contract.transfer.estimateGas(toAddress, amountInWei);
    const gasLimit = estimatedGas * 120n / 100n;
    
    const tx = await contract.transfer(toAddress, amountInWei, { gasLimit });
    return await tx.wait();
  } catch (error) {
    console.error("Transfer error:", error);
    throw new Error(`Transfer failed: ${error.reason || error.message}`);
  }
};
