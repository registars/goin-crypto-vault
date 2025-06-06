
import React from 'react';

interface GoatMiningAnimationProps {
  isActive: boolean;
}

const GoatMiningAnimation: React.FC<GoatMiningAnimationProps> = ({ isActive }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`relative transition-all duration-300 ${isActive ? 'animate-bounce' : ''}`}>
        {/* Goat Body */}
        <div className="relative">
          {/* Main Body */}
          <div className="w-20 h-16 bg-white rounded-full border-2 border-gray-300 relative">
            {/* Head */}
            <div className="absolute -top-6 left-6 w-12 h-10 bg-white rounded-full border-2 border-gray-300">
              {/* Horns */}
              <div className="absolute -top-2 left-2 w-1 h-3 bg-gray-600 rounded transform -rotate-12"></div>
              <div className="absolute -top-2 right-2 w-1 h-3 bg-gray-600 rounded transform rotate-12"></div>
              {/* Eyes */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
              {/* Nose */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-300 rounded-full"></div>
              {/* Beard */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-white border border-gray-300 rounded-b"></div>
            </div>
            
            {/* Legs */}
            <div className="absolute bottom-0 left-2 w-2 h-6 bg-gray-300 rounded"></div>
            <div className="absolute bottom-0 left-6 w-2 h-6 bg-gray-300 rounded"></div>
            <div className="absolute bottom-0 right-6 w-2 h-6 bg-gray-300 rounded"></div>
            <div className="absolute bottom-0 right-2 w-2 h-6 bg-gray-300 rounded"></div>
            
            {/* Tail */}
            <div className="absolute right-0 top-1/2 w-6 h-1 bg-white border border-gray-300 rounded transform rotate-12"></div>
          </div>
          
          {/* Mining Tool */}
          <div className={`absolute -right-8 top-2 transform ${isActive ? 'animate-pulse' : ''}`}>
            <div className="w-8 h-2 bg-yellow-600 rounded"></div>
            <div className="w-1 h-8 bg-brown-600 bg-amber-800 mx-auto"></div>
          </div>
        </div>
      </div>
      
      {/* Mining Effect */}
      {isActive && (
        <div className="mt-4 flex space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping animation-delay-200"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping animation-delay-400"></div>
        </div>
      )}
      
      {/* Coins */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-6 h-6 bg-yellow-400 rounded-full animate-bounce text-center text-xs font-bold text-white flex items-center justify-center">
            G
          </div>
          <div className="absolute top-16 right-8 w-5 h-5 bg-yellow-300 rounded-full animate-bounce animation-delay-300 text-center text-xs font-bold text-white flex items-center justify-center">
            G
          </div>
          <div className="absolute bottom-12 left-16 w-4 h-4 bg-yellow-500 rounded-full animate-bounce animation-delay-500 text-center text-xs font-bold text-white flex items-center justify-center">
            G
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold text-gray-700">
          {isActive ? 'Mining GOIN Tokens...' : 'Ready to Mine GOIN'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          GOIN Testnet Contract
        </p>
      </div>
    </div>
  );
};

export default GoatMiningAnimation;
