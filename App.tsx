import React, { useState, useCallback } from 'react';
import { GameState, GameData } from './types';
import { generateGameContent } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackIndicator from './components/FeedbackIndicator';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    setGameState(GameState.LOADING);
    setError(null);
    setGameData(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setLastAnswerCorrect(null);
    try {
      const data = await generateGameContent();
      if (data.sentences.length > 0) {
        setGameData(data);
        setGameState(GameState.PLAYING);
      } else {
        setError("The AI failed to generate questions. Please try again.");
        setGameState(GameState.ERROR);
      }
    } catch (e: any) {
      setError(e.message || "An unknown error occurred. Please try again later.");
      setGameState(GameState.ERROR);
    }
  }, []);

  const handleAnswer = (userChoice: boolean) => {
    if (!gameData) return;
    const correctAnswer = gameData.sentences[currentQuestionIndex].isCorrect;
    const isUserCorrect = userChoice === correctAnswer;
    setLastAnswerCorrect(isUserCorrect);
    if (isUserCorrect) {
      setScore(prev => prev + 1);
    }
    setGameState(GameState.SHOW_RESULT);
  };

  const handleNext = () => {
    setLastAnswerCorrect(null);
    if (gameData && currentQuestionIndex < gameData.sentences.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setGameState(GameState.PLAYING);
    } else {
      setGameState(GameState.GAME_OVER);
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.START:
        return (
          <div className="text-center p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">ESL Grammar Game</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Practice: There Is / There Are</h2>
            <p className="max-w-2xl mx-auto mb-8 text-lg text-slate-600 dark:text-slate-300">
              Look at the picture, read the sentence, and decide if it's a correct description. Good luck!
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        );

      case GameState.LOADING:
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center gap-6">
            <LoadingSpinner />
            <p className="text-xl font-semibold animate-pulse">Generating a new scene for you...</p>
            <p className="text-slate-500">This might take a moment.</p>
          </div>
        );

      case GameState.ERROR:
        return (
          <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-4">Oops! Something went wrong.</h2>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        );
      
      case GameState.GAME_OVER:
        return (
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl mb-6">
              Your final score is: 
              <span className="font-bold text-blue-600 dark:text-blue-400"> {score} / {gameData?.sentences.length}</span>
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        );

      case GameState.PLAYING:
      case GameState.SHOW_RESULT:
        if (!gameData) return null;
        const currentSentence = gameData.sentences[currentQuestionIndex].sentence;
        const isResultState = gameState === GameState.SHOW_RESULT;
        return (
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Score: {score}</span>
              <span>Question: {currentQuestionIndex + 1} / {gameData.sentences.length}</span>
            </div>
            <div className="relative aspect-video w-full bg-slate-200 dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden">
              <img src={gameData.image} alt="Generated scene for grammar practice" className="w-full h-full object-cover"/>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md min-h-[80px] flex items-center justify-center">
              <p className="text-xl md:text-2xl font-medium">{currentSentence}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <button 
                onClick={() => handleAnswer(true)} 
                disabled={isResultState}
                className="py-4 px-6 text-xl font-bold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 disabled:transform-none"
              >
                Correct
              </button>
              <button 
                onClick={() => handleAnswer(false)} 
                disabled={isResultState}
                className="py-4 px-6 text-xl font-bold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 disabled:transform-none"
              >
                Incorrect
              </button>
            </div>
            {isResultState && (
              <div className="mt-4 flex flex-col items-center gap-4">
                {lastAnswerCorrect !== null && <FeedbackIndicator isCorrect={lastAnswerCorrect} />}
                <button
                  onClick={handleNext}
                  className="w-full md:w-auto mt-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  {currentQuestionIndex < gameData.sentences.length - 1 ? 'Next Question' : 'Finish Game'}
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
