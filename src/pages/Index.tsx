import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap, Coins, TrendingUp, Award, Clock, Eye, Gift, Wallet, Key, Download, Upload, Copy, Shield, RefreshCw, Send, Users, Trophy, Link, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ethers, BrowserProvider } from 'ethers';
import { connectWallet, getGOINContract, addBSCNetwork } from '../utils/web3Provider';
import { simulateBackendClaim, getContractBalance } from '../utils/contractService';
import { saveTokens, loadTokens, saveMiningState, loadMiningState } from '../utils/localStorage';

// GOIN Token Contract Address on Testnet
const GOIN_CONTRACT_ADDRESS = '0xf202f380d4e244d2b1b0c6f3de346a1ce154cc7a';
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

const CryptoMiningApp = () => {
  const [isMining, setIsMining] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [miningRate, setMiningRate] = useState(0.1);
  const [adsWatched, setAdsWatched] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(null);
  const [currentTab, setCurrentTab] = useState('mining');
  const [wallet, setWallet] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyBonus, setDailyBonus] = useState(true);
  const [achievements, setAchievements] = useState([]);

  // Web3 state variables
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [isConnectedToBlockchain, setIsConnectedToBlockchain] = useState(false);

  // New state variables for additional features
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const { toast } = useToast();

  // Load saved data when user address changes
  useEffect(() => {
    if (userAddress) {
      console.log('Loading saved data for address:', userAddress);
      const savedTokens = loadTokens(userAddress);
      const savedState = loadMiningState(userAddress);
      
      if (savedTokens > 0) {
        setTokens(savedTokens);
        console.log('Loaded saved tokens:', savedTokens);
      }
      
      if (savedState) {
        setMiningRate(savedState.miningRate || 0.1);
        setLevel(savedState.level || 1);
        setExperience(savedState.experience || 0);
        setStreak(savedState.streak || 0);
        setAdsWatched(savedState.adsWatched || 0);
        console.log('Loaded saved mining state:', savedState);
      }
    }
  }, [userAddress]);

  // Save tokens whenever they change
  useEffect(() => {
    if (userAddress && tokens > 0) {
      saveTokens(userAddress, tokens);
    }
  }, [tokens, userAddress]);

  // Save mining state whenever it changes
  useEffect(() => {
    if (userAddress) {
      saveMiningState(userAddress, {
        miningRate,
        level,
        experience,
        streak,
        adsWatched,
        lastActivity: Date.now()
      });
    }
  }, [miningRate, level, experience, streak, adsWatched, userAddress]);

  // Wallet Generation (BEP20 compatible)
  const generateWallet = () => {
    try {
      // Generate a new random wallet
      const randomWallet = ethers.Wallet.createRandom();
      
      const newWallet = {
        address: randomWallet.address,
        privateKey: randomWallet.privateKey,
        mnemonic: randomWallet.mnemonic?.phrase || '',
        network: 'BSC Testnet',
        contractAddress: GOIN_CONTRACT_ADDRESS,
        created: new Date().toISOString()
      };
      
      setWallet(newWallet);
      setUserAddress(newWallet.address);
      setWalletBalance(0);
      generateUserReferralCode();
      toast({
        title: "Wallet Created!",
        description: "BEP20 wallet on BSC Testnet created successfully",
      });
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast({
        title: "Error",
        description: "Failed to generate wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateMnemonic = () => {
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert'];
    return Array.from({length: 12}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  };

  const importWallet = () => {
    if (!importKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter Private Key or Mnemonic Phrase",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let importedWallet;
      
      if (importKey.startsWith('0x') && importKey.length === 66) {
        // Import from private key
        importedWallet = new ethers.Wallet(importKey);
      } else if (importKey.split(' ').length === 12 || importKey.split(' ').length === 24) {
        // Import from mnemonic
        importedWallet = ethers.Wallet.fromPhrase(importKey);
      } else {
        toast({
          title: "Error",
          description: "Invalid Private Key or Mnemonic format",
          variant: "destructive",
        });
        return;
      }
      
      const walletData = {
        address: importedWallet.address,
        privateKey: importedWallet.privateKey,
        mnemonic: importedWallet.mnemonic?.phrase || 'N/A',
        network: 'BSC Testnet',
        contractAddress: GOIN_CONTRACT_ADDRESS,
        created: new Date().toISOString(),
        imported: true
      };
      
      setWallet(walletData);
      setUserAddress(walletData.address);
      setWalletBalance(Math.random() * 1000); // Simulate balance
      setImportKey('');
      setShowImportModal(false);
      generateUserReferralCode();
      
      toast({
        title: "Success",
        description: "Wallet imported successfully!",
      });
    } catch (error) {
      console.error('Error importing wallet:', error);
      toast({
        title: "Error",
        description: "Invalid Private Key or Mnemonic format",
        variant: "destructive",
      });
    }
  };

  const exportWallet = () => {
    if (!wallet) return;
    
    const walletData = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic,
      network: wallet.network,
      contractAddress: wallet.contractAddress,
      exported: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(walletData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GOIN_Wallet_${wallet.address.substring(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  // Connect to blockchain
  const connectToBlockchain = async () => {
    try {
      setIsLoading(true);
      
      // Add BSC network first
      await addBSCNetwork();
      
      const web3Provider = await connectWallet();
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(web3Provider);
      setContract(getGOINContract(web3Provider));
      setUserAddress(address);
      setIsConnectedToBlockchain(true);
      
      // Load balance from contract
      try {
        const contractBalance = await getContractBalance(address);
        setWalletBalance(parseFloat(contractBalance));
        console.log(`Loaded balance: ${contractBalance} GOIN`);
      } catch (error) {
        console.error("Error loading balance:", error);
        setWalletBalance(0);
      }
      
      // Update wallet info
      setWallet({
        address: address,
        privateKey: 'Connected via Web3',
        mnemonic: 'External Wallet',
        network: 'BSC Testnet',
        contractAddress: GOIN_CONTRACT_ADDRESS,
        created: new Date().toISOString(),
        isWeb3: true
      });

      generateUserReferralCode();
      
      toast({
        title: "Blockchain Connected!",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(38)}`,
      });
    } catch (error) {
      console.error("Error connecting to blockchain:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to blockchain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync tokens to blockchain (mint real GOIN tokens)
  const syncToBlockchain = async () => {
    if (!provider || tokens <= 0) {
      toast({
        title: "No Tokens to Claim",
        description: "You need to mine some tokens first before claiming.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // If not connected to wallet
      if (!userAddress) {
        await connectToBlockchain();
        return;
      }
      
      console.log(`Starting claim process for ${tokens} GOIN to ${userAddress}`);
      
      // Get nonce for signature
      const nonce = Date.now(); // Use timestamp as nonce
      
      // Create signature for verification
      const message = `Claim ${tokens} GOIN for ${userAddress} (nonce: ${nonce})`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      
      console.log('Signature created:', signature);
      
      // Call backend claim (which will mint real tokens using owner key)
      const result = await simulateBackendClaim(userAddress, tokens.toString(), signature, nonce);
      
      if (result.success) {
        console.log('Claim successful!');
        
        // Update balance by fetching from contract
        const newBalance = await getContractBalance(userAddress);
        setWalletBalance(parseFloat(newBalance));
        
        // Reset tokens to 0 and save state
        setTokens(0);
        saveTokens(userAddress, 0);
        
        toast({
          title: "Tokens Claimed Successfully!",
          description: `${tokens.toFixed(2)} GOIN tokens have been minted to your wallet!`,
        });
        
        if (result.txHash) {
          console.log(`Transaction Hash: ${result.txHash}`);
          toast({
            title: "Transaction Confirmed",
            description: `TX: ${result.txHash.substring(0, 10)}...`,
          });
        }
      } else {
        console.error('Claim failed:', result.error);
        toast({
          title: "Claim Failed",
          description: result.error || "Failed to claim tokens",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        title: "Error",
        description: "Failed to claim tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Updated syncWalletBalance function
  const syncWalletBalance = async () => {
    if (!isConnectedToBlockchain) {
      await connectToBlockchain();
      return;
    }
    await syncToBlockchain();
  };

  // New functions for additional features
  const generateUserReferralCode = () => {
    if (wallet) {
      const code = wallet.address.substring(2, 10).toUpperCase();
      setUserReferralCode(code);
      toast({
        title: "Referral Code Generated!",
        description: `Your referral code: ${code}`,
      });
    } else {
      toast({
        title: "Wallet Required",
        description: "Please create a wallet first to generate referral code",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawal = () => {
    if (!wallet || !withdrawAmount) {
      toast({
        title: "Error",
        description: "Please enter withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > walletBalance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    // Simulate withdrawal process
    setIsLoading(true);
    setTimeout(() => {
      setWalletBalance(prev => prev - amount);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      setIsLoading(false);
      toast({
        title: "Withdrawal Successful",
        description: `${amount.toFixed(4)} GOIN withdrawn to your wallet`,
      });
    }, 2000);
  };

  const applyReferralCode = () => {
    if (!referralCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }

    // Simulate referral bonus
    const bonus = 100;
    setTokens(prev => prev + bonus);
    setReferralCode('');
    toast({
      title: "Referral Applied!",
      description: `+${bonus} GOIN bonus received!`,
    });
  };

  const generateReferralLink = () => {
    if (!userReferralCode) return '';
    return `${window.location.origin}?ref=${userReferralCode}`;
  };

  // Mining simulation dengan interval
  useEffect(() => {
    let interval;
    if (isMining) {
      interval = setInterval(() => {
        setTokens(prev => prev + miningRate);
        setExperience(prev => prev + 1);
        
        // Level up system
        if (experience >= level * 100) {
          setLevel(prev => prev + 1);
          setMiningRate(prev => prev * 1.2);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMining, miningRate, experience, level]);

  // Simulasi iklan dengan berbagai jenis reward
  const adTypes = [
    { name: 'Video Ad (30s)', reward: 50, icon: '🎬', time: 30 },
    { name: 'Banner Click', reward: 10, icon: '🎯', time: 5 },
    { name: 'Interactive Ad', reward: 100, icon: '🎮', time: 60 },
    { name: 'Survey Ad', reward: 200, icon: '📋', time: 120 },
    { name: 'App Install', reward: 500, icon: '📱', time: 180 }
  ];

  const watchAd = (adType) => {
    const now = Date.now();
    
    // Cooldown mechanism
    if (lastAdTime && now - lastAdTime < 30000) {
      toast({
        title: "Cooldown Active",
        description: "Wait 30 seconds before watching another ad",
        variant: "destructive",
      });
      return;
    }

    // Simulasi loading iklan
    setIsLoading(true);
    setTimeout(() => {
      const bonus = streak >= 5 ? adType.reward * 1.5 : adType.reward;
      setTokens(prev => prev + bonus);
      setAdsWatched(prev => prev + 1);
      setExperience(prev => prev + adType.reward / 10);
      setStreak(prev => prev + 1);
      setLastAdTime(now);
      setIsLoading(false);
      
      // Reset streak setelah 24 jam (simulasi)
      setTimeout(() => setStreak(0), 86400000);
    }, adType.time * 10); // Simulasi durasi iklan dipercepat
  };

  const claimDailyBonus = () => {
    if (dailyBonus) {
      const bonus = 100 * level;
      setTokens(prev => prev + bonus);
      setDailyBonus(false);
      // Reset daily bonus setelah 24 jam
      setTimeout(() => setDailyBonus(true), 864000);
    }
  };

  // Achievement system
  useEffect(() => {
    const newAchievements = [];
    if (adsWatched >= 10 && !achievements.includes('Ad Watcher')) {
      newAchievements.push('Ad Watcher');
    }
    if (tokens >= 1000 && !achievements.includes('Token Collector')) {
      newAchievements.push('Token Collector');
    }
    if (level >= 5 && !achievements.includes('Mining Expert')) {
      newAchievements.push('Mining Expert');
    }
    if (streak >= 10 && !achievements.includes('Streak Master')) {
      newAchievements.push('Streak Master');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [adsWatched, tokens, level, streak, achievements]);

  // Initialize sample leaderboard data
  useEffect(() => {
    setLeaderboard([
      { rank: 1, username: 'MinerPro', tokens: 15420.5, level: 8 },
      { rank: 2, username: 'CryptoKing', tokens: 12350.2, level: 7 },
      { rank: 3, username: 'TokenMaster', tokens: 9876.8, level: 6 },
      { rank: 4, username: 'DigitalMiner', tokens: 8543.1, level: 6 },
      { rank: 5, username: 'You', tokens: tokens + walletBalance, level: level },
    ]);
  }, [tokens, walletBalance, level]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-400" />
              CryptoMiner
            </h1>
            <div className="text-right">
              <div className="text-lg font-bold">{tokens.toFixed(2)} GOIN</div>
              <div className="text-xs text-blue-300">Level {level}</div>
              {isConnectedToBlockchain && (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Web3 Connected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-white/20">
          <button
            onClick={() => setCurrentTab('mining')}
            className={`flex-1 py-2 px-2 rounded-lg font-semibold transition-all text-xs ${
              currentTab === 'mining' 
                ? 'bg-blue-500 text-white' 
                : 'text-blue-300 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 mx-auto mb-1" />
            Mining
          </button>
          <button
            onClick={() => setCurrentTab('wallet')}
            className={`flex-1 py-2 px-2 rounded-lg font-semibold transition-all text-xs ${
              currentTab === 'wallet' 
                ? 'bg-blue-500 text-white' 
                : 'text-blue-300 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4 mx-auto mb-1" />
            Wallet
          </button>
          <button
            onClick={() => setCurrentTab('referral')}
            className={`flex-1 py-2 px-2 rounded-lg font-semibold transition-all text-xs ${
              currentTab === 'referral' 
                ? 'bg-blue-500 text-white' 
                : 'text-blue-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 mx-auto mb-1" />
            Referral
          </button>
          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex-1 py-2 px-2 rounded-lg font-semibold transition-all text-xs ${
              currentTab === 'leaderboard' 
                ? 'bg-blue-500 text-white' 
                : 'text-blue-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 mx-auto mb-1" />
            Leaders
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {currentTab === 'mining' && (
          <>
            {/* Blockchain Connection Status */}
            {!isConnectedToBlockchain && (
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 text-orange-400">
                      <Shield />
                      <span className="font-semibold">Connect to Blockchain</span>
                    </div>
                    <div className="text-sm text-orange-300">Connect wallet to claim tokens on BSC</div>
                  </div>
                  <button
                    onClick={connectToBlockchain}
                    disabled={isLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}

            {/* Mining Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className={`w-24 h-24 mx-auto rounded-full border-4 ${isMining ? 'border-green-400 animate-pulse' : 'border-gray-400'} flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600`}>
                    {isMining ? (
                      <Zap className="w-8 h-8 text-yellow-300 animate-bounce" />
                    ) : (
                      <Pause className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  {isMining && (
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-spin"></div>
                  )}
                </div>
                
                <div>
                  <div className="text-2xl font-bold">{miningRate.toFixed(2)} GOIN/s</div>
                  <div className="text-sm text-blue-300">Mining Rate</div>
                </div>
                
                <button
                  onClick={() => setIsMining(!isMining)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    isMining 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isMining ? 'Stop Mining' : 'Start Mining'}
                </button>
              </div>
            </div>

            {/* Enhanced Wallet Sync */}
            {wallet && (
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 text-green-400">
                      <Wallet />
                      <span className="font-semibold">
                        {isConnectedToBlockchain ? 'Claim to Blockchain' : 'Sync to Wallet'}
                      </span>
                    </div>
                    <div className="text-sm text-green-300">
                      {isConnectedToBlockchain 
                        ? `Claim ${tokens.toFixed(2)} GOIN to BSC blockchain`
                        : `Transfer ${tokens.toFixed(2)} GOIN to wallet`
                      }
                    </div>
                  </div>
                  <button
                    onClick={syncWalletBalance}
                    disabled={tokens === 0 || isLoading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    {isLoading ? 'Processing...' : isConnectedToBlockchain ? 'Claim' : 'Sync'}
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-green-400">
                  <Eye />
                  <span className="text-sm">Ads Watched</span>
                </div>
                <div className="text-2xl font-bold">{adsWatched}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-orange-400">
                  <Award />
                  <span className="text-sm">Streak</span>
                </div>
                <div className="text-2xl font-bold">{streak}</div>
              </div>
            </div>

            {/* Daily Bonus */}
            {dailyBonus && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Gift />
                      <span className="font-semibold">Daily Bonus</span>
                    </div>
                    <div className="text-sm text-yellow-300">{100 * level} GOIN Available</div>
                  </div>
                  <button
                    onClick={claimDailyBonus}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    Claim
                  </button>
                </div>
              </div>
            )}

            {/* Ad Watching Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-400" />
                Boost Mining dengan Iklan
              </h2>
              
              {streak >= 5 && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                  <div className="text-sm text-green-300">🔥 Streak Bonus Active: +50% Reward!</div>
                </div>
              )}
              
              <div className="space-y-3">
                {adTypes.map((ad, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{ad.icon}</div>
                        <div>
                          <div className="font-semibold">{ad.name}</div>
                          <div className="text-sm text-blue-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ad.time}s • +{streak >= 5 ? Math.floor(ad.reward * 1.5) : ad.reward} GOIN
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => watchAd(ad)}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                      >
                        {isLoading ? 'Loading...' : 'Watch'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {level}</span>
                <span>{experience % (level * 100)}/{level * 100} XP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((experience % (level * 100)) / (level * 100)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-1 text-sm text-yellow-300">
                      🏆 {achievement}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {currentTab === 'wallet' && (
          <>
            {!wallet ? (
              /* Wallet Creation */
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                <div className="mb-6">
                  <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <h2 className="text-2xl font-bold mb-2">GOIN Wallet</h2>
                  <p className="text-blue-300">BSC Testnet (BEP20)</p>
                  <p className="text-xs text-gray-400 mt-1">Contract: {GOIN_CONTRACT_ADDRESS}</p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={connectToBlockchain}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Web3 Wallet'}
                  </button>
                  
                  <div className="text-sm text-gray-400">or</div>
                  
                  <button
                    onClick={generateWallet}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    Generate New Wallet
                  </button>
                  
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    Import Existing Wallet
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">Security Notice</span>
                  </div>
                  <p className="text-sm text-yellow-300">
                    Wallet menggunakan standard BEP20/BSC. Private key dan mnemonic dapat digunakan di wallet lain seperti MetaMask atau Trust Wallet.
                  </p>
                </div>
              </div>
            ) : (
              /* Wallet Dashboard */
              <>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Wallet className="text-blue-400" />
                      GOIN Wallet (BEP20)
                    </h2>
                    <div className="flex gap-2">
                      {!wallet.isWeb3 && (
                        <button
                          onClick={exportWallet}
                          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-green-500/30">
                      <div className="text-sm text-green-300 mb-1">Balance</div>
                      <div className="text-3xl font-bold text-green-400">{walletBalance.toFixed(4)} GOIN</div>
                      <div className="text-xs text-green-300 mt-1">≈ ${(walletBalance * 0.1).toFixed(2)} USD</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-blue-300">Wallet Address (BEP20)</span>
                        <button
                          onClick={() => copyToClipboard(wallet.address)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-mono text-sm bg-black/20 p-2 rounded border break-all">
                        {wallet.address}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-blue-300">Network</span>
                        <span className="text-sm text-green-400">🟢 BSC Testnet</span>
                      </div>
                      <div className="text-sm">{wallet.network}</div>
                      <div className="text-xs text-gray-400 mt-1">Contract: {wallet.contractAddress}</div>
                    </div>
                  </div>
                </div>

                {/* Private Key Section - only show for generated wallets */}
                {!wallet.isWeb3 && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Key className="text-yellow-400" />
                      <h3 className="font-bold">Private Key & Security</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                        <div className="text-sm text-green-300 mb-2">✅ Compatible dengan wallet lain</div>
                        <div className="text-xs text-green-200">
                          Private key dan mnemonic ini dapat digunakan di MetaMask, Trust Wallet, atau wallet BEP20 lainnya.
                        </div>
                      </div>
                      
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                        <div className="text-sm text-red-300 mb-2">⚠️ Warning</div>
                        <div className="text-xs text-red-200">
                          Jangan pernah membagikan private key atau mnemonic phrase kepada siapa pun!
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-blue-300">Private Key</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                className="p-1 hover:bg-white/10 rounded text-yellow-400"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => copyToClipboard(wallet.privateKey)}
                                className="p-1 hover:bg-white/10 rounded"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="font-mono text-xs bg-black/20 p-2 rounded border break-all">
                            {showPrivateKey ? wallet.privateKey : '•'.repeat(64)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-blue-300">Mnemonic Phrase</span>
                            <button
                              onClick={() => copyToClipboard(wallet.mnemonic)}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs bg-black/20 p-2 rounded border">
                            {showPrivateKey ? wallet.mnemonic : '•'.repeat(wallet.mnemonic.length)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction History Placeholder */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <RefreshCw className="text-green-400" />
                    Transaction History
                  </h3>
                  <div className="text-center py-8 text-blue-300">
                    <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-xs mt-1">Your transaction history will appear here</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {currentTab === 'referral' && (
          <>
            {/* Create Referral Link Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Link className="text-blue-400" />
                Create Referral Link
              </h2>
              
              {!userReferralCode ? (
                <div className="text-center space-y-4">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="text-sm text-blue-300 mb-2">
                      🎯 Generate your unique referral code to start earning bonuses!
                    </div>
                    <div className="text-xs text-blue-200">
                      Earn 10% of your referrals' mining rewards
                    </div>
                  </div>
                  
                  <button
                    onClick={generateUserReferralCode}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    Generate Referral Code
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-sm text-blue-300 mb-2">Your Referral Code</div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-lg font-bold text-yellow-400">{userReferralCode}</span>
                      <button
                        onClick={() => copyToClipboard(userReferralCode)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-green-500/30">
                    <div className="text-sm text-green-300 mb-2">Your Referral Link</div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-mono text-xs bg-black/20 p-2 rounded border break-all flex-1">
                        {generateReferralLink()}
                      </span>
                      <button
                        onClick={() => copyToClipboard(generateReferralLink())}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generateReferralLink())}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-all text-sm"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Join CryptoMiner GOIN',
                            text: 'Start mining GOIN tokens with me!',
                            url: generateReferralLink(),
                          }).catch(() => {
                            copyToClipboard(generateReferralLink());
                          });
                        } else {
                          copyToClipboard(generateReferralLink());
                        }
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-all text-sm"
                    >
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Apply Referral Code Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-green-400" />
                Apply Referral Code
              </h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-sm text-yellow-300">
                    💰 Enter a friend's referral code to get 100 GOIN bonus!
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                    className="flex-1 p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                  <button
                    onClick={applyReferralCode}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Levels */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Star className="text-yellow-400" />
                Referral Levels
              </h3>
              
              <div className="space-y-3">
                {[
                  { level: 'Bronze', referrals: '1-10', bonus: '5%', icon: '🥉' },
                  { level: 'Silver', referrals: '11-25', bonus: '10%', icon: '🥈' },
                  { level: 'Gold', referrals: '26-50', bonus: '15%', icon: '🥇' },
                  { level: 'Platinum', referrals: '51-100', bonus: '20%', icon: '💎' },
                  { level: 'Diamond', referrals: '100+', bonus: '25%', icon: '👑' }
                ].map((tier, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tier.icon}</span>
                        <div>
                          <div className="font-semibold">{tier.level}</div>
                          <div className="text-sm text-blue-300">{tier.referrals} referrals</div>
                        </div>
                      </div>
                      <div className="text-green-400 font-bold">{tier.bonus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {currentTab === 'leaderboard' && (
          <>
            {/* Leaderboard */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-400" />
                Leaderboard
              </h2>
              
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div key={index} className={`rounded-lg p-4 border ${
                    player.username === 'You' 
                      ? 'bg-blue-500/20 border-blue-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1 ? 'bg-yellow-500 text-black' :
                          player.rank === 2 ? 'bg-gray-400 text-black' :
                          player.rank === 3 ? 'bg-orange-600 text-white' :
                          'bg-white/20 text-white'
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <div className="font-semibold">{player.username}</div>
                          <div className="text-sm text-blue-300">Level {player.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">{player.tokens.toFixed(1)} GOIN</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold mb-4">Withdraw GOIN</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-blue-300 mb-2">
                  Amount to Withdraw
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0000"
                  className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Available: {walletBalance.toFixed(4)} GOIN
                </div>
              </div>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="text-sm text-yellow-300">
                  ⚠️ Withdrawal will be processed to your connected wallet address.
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={isLoading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  {isLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold mb-4">Import BEP20 Wallet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-blue-300 mb-2">
                  Private Key atau Mnemonic Phrase
                </label>
                <textarea
                  value={importKey}
                  onChange={(e) => setImportKey(e.target.value)}
                  placeholder="Masukkan private key (0x...) atau mnemonic phrase (12/24 kata)"
                  className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  rows={3}
                />
              </div>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-sm text-green-300">
                  ✅ Wallet yang diimport akan kompatibel dengan MetaMask dan wallet BEP20 lainnya.
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={importWallet}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Import Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoMiningApp;
