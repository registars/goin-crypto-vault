
// Utility functions for persistent storage
export const saveUserData = (address: string, data: any) => {
  try {
    const key = `goin_miner_${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const loadUserData = (address: string) => {
  try {
    const key = `goin_miner_${address.toLowerCase()}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

export const saveTokens = (address: string, tokens: number) => {
  const userData = loadUserData(address) || {};
  userData.tokens = tokens;
  userData.lastSaved = Date.now();
  saveUserData(address, userData);
};

export const loadTokens = (address: string): number => {
  const userData = loadUserData(address);
  return userData?.tokens || 0;
};

export const saveMiningState = (address: string, state: any) => {
  const userData = loadUserData(address) || {};
  userData.miningState = state;
  userData.lastActivity = Date.now();
  saveUserData(address, userData);
};

export const loadMiningState = (address: string) => {
  const userData = loadUserData(address);
  return userData?.miningState || null;
};
