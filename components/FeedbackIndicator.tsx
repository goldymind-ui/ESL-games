import React from 'react';

interface FeedbackIndicatorProps {
  isCorrect: boolean;
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({ isCorrect }) => {
  if (isCorrect) {
    return (
      <div className="flex items-center gap-2 text-green-500 font-bold text-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>Yes!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span>No!</span>
    </div>
  );
};

export default FeedbackIndicator;