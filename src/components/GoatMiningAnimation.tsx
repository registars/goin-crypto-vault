
import React from 'react';

interface GoatMiningAnimationProps {
  isActive: boolean;
}

const GoatMiningAnimation: React.FC<GoatMiningAnimationProps> = ({ isActive }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`relative transition-all duration-500 ${isActive ? 'animate-bounce' : ''}`}>
        {/* Enhanced 3D-style Goat */}
        <div className="relative">
          {/* Main Body with 3D effect */}
          <div className="w-16 h-12 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-full border-2 border-gray-300 shadow-lg relative transform perspective-1000">
            {/* Body shadow for 3D depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-400 rounded-full opacity-30 transform translate-x-1 translate-y-1"></div>
            
            {/* Head with 3D styling */}
            <div className="absolute -top-4 left-4 w-10 h-8 bg-gradient-to-br from-white via-gray-50 to-gray-200 rounded-full border-2 border-gray-300 shadow-md">
              {/* Head shadow */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-400 rounded-full opacity-25 transform translate-x-0.5 translate-y-0.5"></div>
              
              {/* Horns with gradient */}
              <div className="absolute -top-1 left-1 w-1 h-2 bg-gradient-to-t from-gray-600 to-gray-800 rounded transform -rotate-12 shadow-sm"></div>
              <div className="absolute -top-1 right-1 w-1 h-2 bg-gradient-to-t from-gray-600 to-gray-800 rounded transform rotate-12 shadow-sm"></div>
              
              {/* Eyes with animation */}
              <div className={`absolute top-1 left-1 w-1.5 h-1.5 bg-black rounded-full ${isActive ? 'animate-pulse' : ''}`}></div>
              <div className={`absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full ${isActive ? 'animate-pulse' : ''}`}></div>
              
              {/* Nose */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-pink-400 rounded-full"></div>
              
              {/* Enhanced Beard */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-white to-gray-100 border border-gray-300 rounded-b shadow-sm"></div>
            </div>
            
            {/* Legs with 3D effect */}
            <div className="absolute bottom-0 left-1 w-1.5 h-4 bg-gradient-to-b from-gray-300 to-gray-500 rounded shadow-sm"></div>
            <div className="absolute bottom-0 left-4 w-1.5 h-4 bg-gradient-to-b from-gray-300 to-gray-500 rounded shadow-sm"></div>
            <div className="absolute bottom-0 right-4 w-1.5 h-4 bg-gradient-to-b from-gray-300 to-gray-500 rounded shadow-sm"></div>
            <div className="absolute bottom-0 right-1 w-1.5 h-4 bg-gradient-to-b from-gray-300 to-gray-500 rounded shadow-sm"></div>
            
            {/* Tail */}
            <div className="absolute right-0 top-1/2 w-4 h-1 bg-gradient-to-r from-white to-gray-200 border border-gray-300 rounded transform rotate-12 shadow-sm"></div>
          </div>
          
          {/* Enhanced Mining Tool */}
          <div className={`absolute -right-6 top-1 transform ${isActive ? 'animate-pulse' : ''}`}>
            {/* Pickaxe handle */}
            <div className="w-1 h-6 bg-gradient-to-b from-amber-700 to-amber-900 rounded shadow-sm mx-auto"></div>
            {/* Pickaxe head with metallic effect */}
            <div className="w-6 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 rounded shadow-md border border-yellow-700"></div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Mining Effects */}
      {isActive && (
        <>
          {/* Sparks */}
          <div className="mt-2 flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping shadow-lg"></div>
            <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping animation-delay-200 shadow-md"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping animation-delay-400 shadow-lg"></div>
          </div>
          
          {/* Flying GOIN coins */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-8 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full animate-bounce text-center text-xs font-bold text-white flex items-center justify-center shadow-lg border border-yellow-700">
              G
            </div>
            <div className="absolute top-12 right-6 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full animate-bounce animation-delay-300 text-center text-xs font-bold text-white flex items-center justify-center shadow-md border border-yellow-600">
              G
            </div>
            <div className="absolute bottom-8 left-12 w-3 h-3 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full animate-bounce animation-delay-500 text-center text-xs font-bold text-white flex items-center justify-center shadow-sm border border-yellow-800">
              G
            </div>
          </div>
        </>
      )}
      
      {/* Status text */}
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-gray-700">
          {isActive ? '🔥 Mining GOIN Tokens...' : '⏸️ Ready to Mine GOIN'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          MyGOIN (GOIN) • BSC Testnet
        </p>
      </div>
    </div>
  );
};

export default GoatMiningAnimation;
