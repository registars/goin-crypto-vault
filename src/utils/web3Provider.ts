import { ethers, BrowserProvider, Contract } from 'ethers';

// Konfigurasi jaringan dan kontrak
export const CONTRACT_ADDRESS = "0xf202f380d4e244d2b1b0c6f3de346a1ce154cc7a";
export const CONTRACT_OWNER = "0x4f0412CC1Ea121e553c9cC49B66affA2Ec9F9380";
export const BSC_TESTNET_CHAIN_ID = "0x61";

// ABI Kontrak (sederhana)
export const GOIN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
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

// Fungsi untuk mint token (frontend)
export const mintTokens = async (provider: BrowserProvider, toAddress: string, amount: string) => {
  try {
    await checkNetwork();
    
    const signer = await provider.getSigner();
    const contract = getGOINContract(provider).connect(signer);
    
    if (!ethers.isAddress(toAddress)) {
      throw new Error("Invalid recipient address");
    }

    // Estimasi gas dengan buffer 20%
    const estimatedGas = await contract.mint.estimateGas(toAddress, amount);
    const gasLimit = estimatedGas * 120n / 100n;
    
    const tx = await contract.mint(toAddress, amount, { gasLimit });
    return await tx.wait();
  } catch (error) {
    console.error("Minting error:", error);
    throw new Error(`Minting failed: ${error.reason || error.message}`);
  }
};
