import React, { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { GameMode, GameState, Screen } from './types';
import { TOTAL_QUESTIONS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    screen: Screen.START,
    mode: GameMode.ENG_TO_KOR,
    level: 1,
    score: 0,
    totalQuestions: TOTAL_QUESTIONS,
  });

  const handleStartGame = (mode: GameMode, level: number) => {
    setGameState({
      ...gameState,
      screen: Screen.QUIZ,
      mode,
      level,
      score: 0,
    });
  };

  const handleFinishQuiz = (finalScore: number) => {
    setGameState(prev => ({
      ...prev,
      score: finalScore,
      screen: Screen.RESULT,
    }));
  };

  const handleRestart = () => {
    setGameState(prev => ({
      ...prev,
      screen: Screen.START,
      score: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-background text-gray-800 font-sans selection:bg-yellow-200">
      <main className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        
        {/* Decorative Background Elements */}
        <div className="fixed top-10 left-10 text-6xl opacity-20 pointer-events-none -z-10 animate-bounce-slow" style={{ animationDelay: '0s' }}>☁️</div>
        <div className="fixed bottom-20 right-10 text-6xl opacity-20 pointer-events-none -z-10 animate-bounce-slow" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="fixed top-1/2 right-20 text-4xl opacity-10 pointer-events-none -z-10 animate-pulse">✏️</div>

        {gameState.screen === Screen.START && (
          <StartScreen onStart={handleStartGame} />
        )}

        {gameState.screen === Screen.QUIZ && (
          <QuizScreen 
            mode={gameState.mode} 
            level={gameState.level} 
            onFinish={handleFinishQuiz}
            onExit={handleRestart}
          />
        )}

        {gameState.screen === Screen.RESULT && (
          <ResultScreen 
            score={gameState.score} 
            totalScore={gameState.totalQuestions * 10} 
            level={gameState.level}
            onRestart={handleRestart} 
          />
        )}
      </main>
    </div>
  );
};

export default App;