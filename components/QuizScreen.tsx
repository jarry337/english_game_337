import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GameMode, Question, Word, LEVEL_CHALLENGE } from '../types';
import { Button } from './Button';
import { WORD_DATABASE, TOTAL_QUESTIONS } from '../constants';
import { playCorrect, playWrong, playClick } from '../utils/audio';

interface QuizScreenProps {
  mode: GameMode;
  level: number;
  onFinish: (score: number) => void;
  onExit: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ mode, level, onFinish, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Word | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  // Challenge Mode State
  const [hearts, setHearts] = useState(3);
  const isChallengeMode = level === LEVEL_CHALLENGE;
  
  // Chance state
  const [chanceUsed, setChanceUsed] = useState(false);
  
  // Refs for infinite generation
  const usedWordsRef = useRef<Set<string>>(new Set());

  // Helper to generate a single question
  const generateQuestion = useCallback((excludeEng: string | null = null): Question => {
    // Determine pool based on level
    let pool: Word[] = [];
    if (isChallengeMode) {
      pool = WORD_DATABASE; // Use all words
    } else {
      pool = WORD_DATABASE.filter(w => w.level === level);
      if (pool.length < 15) {
        pool = [...pool, ...WORD_DATABASE.filter(w => Math.abs(w.level - level) <= 1)];
      }
    }

    // Filter out recently used words if possible to avoid repetition in infinite mode
    let availableTargets = pool.filter(w => !usedWordsRef.current.has(w.eng));
    
    // If we ran out of words (rare), reset tracking
    if (availableTargets.length === 0) {
      usedWordsRef.current.clear();
      availableTargets = pool;
    }

    const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
    usedWordsRef.current.add(target.eng);

    // Get distractors
    const distractors = pool
      .filter(w => w.eng !== target.eng)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const options = [...distractors, target].sort(() => 0.5 - Math.random());
    return { target, options };
  }, [level, isChallengeMode]);

  // Initialize Game Logic
  useEffect(() => {
    if (isChallengeMode) {
      // Generate first batch
      const initialQuestions = Array(5).fill(null).map(() => generateQuestion());
      setQuestions(initialQuestions);
    } else {
      // Standard 10 questions logic
      const pool = WORD_DATABASE.filter(w => w.level === level);
      
      const levelWords = WORD_DATABASE.filter(w => w.level === level);
      let standardPool = [...levelWords];
      if (standardPool.length < 15) {
        standardPool = [...standardPool, ...WORD_DATABASE.filter(w => Math.abs(w.level - level) === 1)];
      }
      const targets = [...standardPool].sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS);
      
      const generated = targets.map(target => {
        const distractors = standardPool
          .filter(w => w.eng !== target.eng)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return { target, options: [...distractors, target].sort(() => 0.5 - Math.random()) };
      });
      setQuestions(generated);
    }
  }, [level, isChallengeMode, generateQuestion]);

  // Infinite Scroll Logic: Ensure we always have questions ahead
  useEffect(() => {
    if (isChallengeMode && questions.length > 0 && currentIndex > questions.length - 3) {
      // Add more questions
      const nextQ = generateQuestion();
      setQuestions(prev => [...prev, nextQ]);
    }
  }, [currentIndex, isChallengeMode, questions.length, generateQuestion]);


  const handleOptionClick = useCallback((option: Word | null, isAutoSolve = false) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = isAutoSolve || (option && option.eng === currentQ.target.eng);
    
    if (option) setSelectedOption(option);
    else if (isAutoSolve) setSelectedOption(currentQ.target); // Highlight correct answer

    if (isCorrect) {
      playCorrect();
      setScore(prev => prev + 10);
      setFeedback('correct');
    } else {
      playWrong();
      setFeedback('wrong');
      if (isChallengeMode) {
        setHearts(prev => prev - 1);
      }
    }

    // Delay for feedback animation before next question
    setTimeout(() => {
      // Check Game Over Conditions
      let isGameOver = false;

      if (isChallengeMode) {
         // Check hearts. If incorrect, we just decremented hearts.
         if (!isCorrect && hearts <= 1) {
           isGameOver = true;
         }
      } else {
         if (currentIndex >= TOTAL_QUESTIONS - 1) {
           isGameOver = true;
         }
      }

      if (isGameOver) {
        onFinish(score + (isCorrect ? 10 : 0)); 
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
        setIsProcessing(false);
      }
    }, 1200);
  }, [currentIndex, isProcessing, questions, score, onFinish, isChallengeMode, hearts]);

  const handleChance = () => {
    if (chanceUsed || isProcessing) return;
    
    // Check challenge mode constraint
    if (isChallengeMode && hearts < 2) return;

    setChanceUsed(true);
    // Auto solve the current question
    handleOptionClick(null, true);
  };

  const handleExit = () => {
    playClick();
    onExit();
  };

  if (questions.length === 0) {
    return <div className="text-2xl font-bold text-gray-500 animate-pulse">Loading...</div>;
  }

  const currentQuestion = questions[currentIndex];
  // Progress bar is 100% for challenge mode, or percentage for normal
  const progress = isChallengeMode ? 100 : ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;

  // Render Logic helpers
  const getQuestionText = () => mode === GameMode.ENG_TO_KOR ? currentQuestion.target.eng : currentQuestion.target.kor;
  const getOptionText = (opt: Word) => mode === GameMode.ENG_TO_KOR ? opt.kor : opt.eng;

  // Chance button availability
  const isHeartsLow = isChallengeMode && hearts < 2;
  const isChanceDisabled = chanceUsed || isProcessing || isHeartsLow;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col h-full min-h-[600px] justify-between relative">
      
      {/* Header */}
      <div className="w-full space-y-3 mb-4">
        <div className="flex justify-between items-center px-1">
            <button 
                onClick={handleExit}
                className="bg-white border-2 border-gray-300 rounded-xl px-3 py-1 text-gray-500 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-all text-sm flex items-center gap-1 shadow-sm"
            >
                <span>🏠 Quit</span>
            </button>
            <div className="text-right">
                {isChallengeMode ? (
                  <div className="flex items-center gap-1">
                     <span className="text-2xl animate-pulse">
                       {Array(hearts).fill('❤️').join('')}
                       {Array(3-hearts).fill('🖤').join('')}
                     </span>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-bold text-gray-400">Question {currentIndex + 1}/{TOTAL_QUESTIONS}</div>
                    <div className="text-sm font-bold text-primary">Level {level}</div>
                  </>
                )}
            </div>
        </div>
        
        {/* Progress Bar (Only for standard mode, or just full for challenge) */}
        <div className={`w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-300 ${isChallengeMode ? 'opacity-50' : ''}`}>
          <div 
            className={`h-full transition-all duration-500 ease-out ${isChallengeMode ? 'bg-red-500' : 'bg-secondary'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center mb-6 relative">
        <div className={`bg-white border-4 ${isChallengeMode ? 'border-red-200' : 'border-yellow-200'} rounded-3xl p-8 shadow-xl w-full text-center transform transition-all duration-300 hover:scale-105 z-10`}>
           <span className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2 block">
             {mode === GameMode.ENG_TO_KOR ? 'What does this mean?' : 'What is this in English?'}
           </span>
           <h1 className="text-5xl md:text-7xl font-black text-gray-800 break-words">
             {getQuestionText()}
           </h1>
        </div>
      </div>

      {/* Chance Button */}
      <div className="flex justify-end mb-3">
         <button 
           onClick={handleChance} 
           disabled={isChanceDisabled}
           className={`
             flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white shadow-md transition-all border-b-4
             ${isChanceDisabled
                ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-70' 
                : 'bg-purple-400 border-purple-600 hover:bg-purple-500 hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-1'
             }
           `}
           title={isHeartsLow ? "Requires 2+ Hearts ❤️❤️" : "Show Answer & Skip"}
         >
           <span className="text-xl">🪄</span> 
           <span>{chanceUsed ? 'Used' : 'Skip & Solve'}</span>
         </button>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4 h-64 md:h-80">
        {currentQuestion.options.map((option, idx) => {
          let variant: 'neutral' | 'primary' | 'secondary' | 'accent' = 'neutral';
          
          if (selectedOption) {
            if (option.eng === currentQuestion.target.eng) {
               variant = 'secondary'; // Correct
            } else if (selectedOption.eng === option.eng) {
               variant = 'neutral'; // Wrong
            }
          }

          const isSelected = selectedOption?.eng === option.eng;
          const isCorrectAnswer = option.eng === currentQuestion.target.eng;
          
          let customClass = "";
          if (selectedOption) {
             if (isCorrectAnswer) customClass = "!bg-green-400 !border-green-600 text-white scale-105 shadow-xl";
             else if (isSelected) customClass = "!bg-red-400 !border-red-600 text-white shake-animation";
             else customClass = "opacity-40";
          }
          
          return (
            <Button
              key={idx}
              onClick={() => handleOptionClick(option)}
              variant={variant}
              className={`text-2xl md:text-3xl h-full flex items-center justify-center ${customClass}`}
              disabled={isProcessing}
              disableSound={true}
            >
              <span className="text-center w-full">{getOptionText(option)}</span>
            </Button>
          );
        })}
      </div>

      {/* Feedback Overlay */}
      {feedback && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
             <div className="animate-pop text-9xl drop-shadow-2xl">
                 {feedback === 'correct' ? '⭕️' : '❌'}
             </div>
        </div>
      )}
    </div>
  );
};