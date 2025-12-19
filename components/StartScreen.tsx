import React from 'react';
import { GameMode, LEVEL_CHALLENGE } from '../types';
import { Button } from './Button';

interface StartScreenProps {
  onStart: (mode: GameMode, level: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [selectedMode, setSelectedMode] = React.useState<GameMode | null>(null);
  const [selectedLevel, setSelectedLevel] = React.useState<number | null>(null);

  const levels = [1, 2, 3, 4, 5];

  const handleStart = () => {
    if (selectedMode && selectedLevel) {
      onStart(selectedMode, selectedLevel);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 space-y-8 animate-pop">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-black text-primary drop-shadow-lg tracking-wider">
          Word Quiz!
        </h1>
        <p className="text-xl text-gray-600 font-bold">Let's learn English together! 🦁</p>
      </div>

      <div className="w-full bg-white rounded-3xl p-6 shadow-xl space-y-6 border-4 border-yellow-100">
        {/* Mode Selection */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl">🎮</span> Select Game Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant={selectedMode === GameMode.ENG_TO_KOR ? 'primary' : 'neutral'}
              onClick={() => setSelectedMode(GameMode.ENG_TO_KOR)}
              className="h-24 flex items-center justify-center"
              size="lg"
            >
              <span className="text-2xl font-black text-center w-full">English</span>
            </Button>
            <Button
              variant={selectedMode === GameMode.KOR_TO_ENG ? 'accent' : 'neutral'}
              onClick={() => setSelectedMode(GameMode.KOR_TO_ENG)}
              className="h-24 flex items-center justify-center"
              size="lg"
            >
               <span className="text-2xl font-black text-center w-full">Korean</span>
            </Button>
          </div>
        </div>

        {/* Level Selection */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl">🏆</span> Select Level
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-2 overflow-x-auto pb-2">
              {levels.map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'secondary' : 'neutral'}
                  onClick={() => setSelectedLevel(level)}
                  className="flex-1 min-w-[60px] h-16 flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-center w-full">{level}</span>
                </Button>
              ))}
            </div>
            
            {/* Challenge Mode Button */}
            <Button
              variant={selectedLevel === LEVEL_CHALLENGE ? 'outline' : 'neutral'}
              onClick={() => setSelectedLevel(LEVEL_CHALLENGE)}
              className={`w-full py-4 border-2 ${selectedLevel === LEVEL_CHALLENGE ? 'bg-red-50 border-red-500 text-red-500' : 'border-gray-300'}`}
            >
              <div className="flex items-center justify-center gap-2 text-xl font-black">
                <span>🔥 Challenge Mode</span>
              </div>
            </Button>
          </div>

          <div className="text-center mt-2 text-gray-500 font-medium min-h-[1.5rem]">
            {selectedLevel === 1 && "Very Easy (Basic Words)"}
            {selectedLevel === 2 && "Easy (Common Objects)"}
            {selectedLevel === 3 && "Medium (Places, Colors)"}
            {selectedLevel === 4 && "Hard (Adjectives, Jobs)"}
            {selectedLevel === 5 && "Challenge (Abstract, Science)"}
            {selectedLevel === LEVEL_CHALLENGE && "Infinite Play! 3 Hearts ❤️"}
            {!selectedLevel && "Pick a level!"}
          </div>
        </div>
      </div>

      <Button
        size="xl"
        variant="secondary"
        onClick={handleStart}
        disabled={!selectedMode || !selectedLevel}
        className="w-full md:w-auto px-12 animate-pulse-fast flex items-center justify-center"
      >
        <span className="text-center w-full">GAME START 🚀</span>
      </Button>
    </div>
  );
};