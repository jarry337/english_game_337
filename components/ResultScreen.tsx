import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { isHighScore, saveScore, getLeaderboard } from '../utils/leaderboard';
import { LeaderboardEntry, LEVEL_CHALLENGE } from '../types';

interface ResultScreenProps {
  score: number;
  totalScore: number;
  onRestart: () => void;
  level?: number;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalScore, onRestart, level }) => {
  const isChallenge = level === LEVEL_CHALLENGE;
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(isChallenge);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Check if high score on mount (only for challenge mode)
  useEffect(() => {
    if (isChallenge) {
      const checkScore = async () => {
        setIsLoading(true);
        const high = await isHighScore(score);
        const currentBoard = await getLeaderboard();
        setLeaderboard(currentBoard);
        if (high && score > 0) {
          setShowInput(true);
        }
        setIsLoading(false);
      };
      checkScore();
    }
  }, [score, isChallenge]);

  const handleSubmitScore = async () => {
    if (!name.trim() || submitted) return;
    setIsLoading(true);
    const updated = await saveScore(name.trim(), score);
    setLeaderboard(updated);
    setSubmitted(true);
    setShowInput(false);
    setIsLoading(false);
  };

  const percentage = (score / totalScore) * 100;
  
  let message = "";
  let emoji = "";
  
  if (isChallenge) {
    message = "Challenge Over!";
    emoji = "🔥";
  } else {
    if (percentage === 100) {
      message = "Perfect! Amazing!";
      emoji = "🏆";
    } else if (percentage >= 80) {
      message = "Great Job! Keep it up!";
      emoji = "🎉";
    } else if (percentage >= 50) {
      message = "Good! Try again?";
      emoji = "👍";
    } else {
      message = "Cheer up! You can do it!";
      emoji = "🌱";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 space-y-6 animate-pop text-center">
      
      <div className="text-8xl animate-bounce-slow filter drop-shadow-lg">
        {emoji}
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-gray-700">{message}</h2>
        <p className="text-xl text-gray-500">Your final score is</p>
      </div>

      <div className="bg-white rounded-full p-8 shadow-xl border-8 border-yellow-200">
        <span className="text-6xl font-black text-primary">
            {score}
        </span>
        {!isChallenge && <span className="text-3xl text-gray-400 font-bold"> / {totalScore}</span>}
      </div>

      {/* Leaderboard Section for Challenge Mode */}
      {isChallenge && (
        <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-md border-4 border-purple-100">
           
           {showInput && !submitted && (
             <div className="space-y-4 mb-6 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 animate-pop">
               <h3 className="text-xl font-bold text-purple-600">New High Score! 🏆</h3>
               <p className="text-sm text-purple-400 font-bold">Register your name on the global ranking!</p>
               <div className="flex gap-2">
                 <input 
                    type="text" 
                    maxLength={10}
                    placeholder="Enter Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 border-2 border-purple-200 rounded-xl px-4 py-2 font-bold text-lg focus:outline-none focus:border-purple-500"
                    disabled={isLoading}
                 />
                 <button 
                   onClick={handleSubmitScore}
                   disabled={!name.trim() || isLoading}
                   className="bg-purple-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-600 active:scale-95 disabled:opacity-50 transition-all"
                 >
                   {isLoading ? '...' : 'Save'}
                 </button>
               </div>
             </div>
           )}

           <h3 className="text-xl font-black text-gray-600 mb-4 border-b-2 border-gray-100 pb-2 flex items-center justify-center gap-2">
             <span>👑 Global Top 5</span>
             {isLoading && <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>}
           </h3>

           <div className="space-y-2">
             {isLoading && leaderboard.length === 0 ? (
                <div className="py-8 text-gray-400 animate-pulse font-bold">Loading Rankings...</div>
             ) : (
                <>
                  {leaderboard.map((entry, idx) => (
                    <div key={idx} className={`flex justify-between items-center px-4 py-3 rounded-2xl transition-all ${entry.name === name && entry.score === score ? 'bg-yellow-100 border-2 border-yellow-400 scale-105 shadow-md' : 'bg-gray-50 border-2 border-transparent'}`}>
                       <div className="flex items-center gap-3">
                         <span className={`text-xl font-black w-8 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                           #{idx + 1}
                         </span>
                         <span className="font-bold text-gray-700 text-lg">{entry.name}</span>
                       </div>
                       <span className="font-black text-2xl text-primary drop-shadow-sm">{entry.score}</span>
                    </div>
                  ))}
                  {leaderboard.length === 0 && !isLoading && (
                    <p className="text-gray-400 italic py-4">Be the first to leave a mark! 🚀</p>
                  )}
                </>
             )}
           </div>
        </div>
      )}

      <div className="pt-4">
        <Button onClick={onRestart} size="xl" variant="secondary" className="animate-pulse-fast">
            Play Again 🔄
        </Button>
      </div>
    </div>
  );
};