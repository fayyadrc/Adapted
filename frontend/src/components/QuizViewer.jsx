import React, { useState } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

const QuizViewer = ({ quizData }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});

  if (!quizData || !quizData.questions) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          No quiz data available
        </div>
      </div>
    );
  }

  const handleAnswerClick = (questionIndex, selectedOption) => {
    // If already answered correctly, don't allow changing
    if (correctAnswers[questionIndex]) {
      return;
    }

    const question = quizData.questions[questionIndex];
    const isCorrect = selectedOption === question.answer;

    setUserAnswers({
      ...userAnswers,
      [questionIndex]: selectedOption,
    });

    if (isCorrect) {
      setFeedback({
        ...feedback,
        [questionIndex]: { type: 'success', message: 'Correct! ✓' },
      });
      setCorrectAnswers({
        ...correctAnswers,
        [questionIndex]: true,
      });
    } else {
      setFeedback({
        ...feedback,
        [questionIndex]: { type: 'error', message: 'Incorrect. Try again!' },
      });
    }
  };

  const getOptionStyle = (questionIndex, option) => {
    const isSelected = userAnswers[questionIndex] === option;
    const isCorrect = correctAnswers[questionIndex];
    const question = quizData.questions[questionIndex];

    if (isCorrect && isSelected) {
      return 'bg-green-500 text-white border-green-600';
    } else if (isSelected && !isCorrect) {
      return 'bg-red-500 text-white border-red-600';
    } else if (isCorrect && option === question.answer) {
      return 'bg-green-100 border-green-300';
    } else {
      return 'bg-white border-gray-300 hover:bg-gray-50';
    }
  };

  const isQuizComplete = () => {
    return Object.keys(correctAnswers).length === quizData.questions.length;
  };

  const getScore = () => {
    return Object.keys(correctAnswers).length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {quizData.quiz_type?.toUpperCase() || 'MCQ'} Quiz
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {quizData.questions.length} Questions
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-600">
              {getScore()} / {quizData.questions.length}
            </div>
            <p className="text-xs text-gray-600">Score</p>
          </div>
        </div>
      </div>

      {/* Completion Alert */}
      {isQuizComplete() && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-5 h-5 mr-2" />
            <p className="font-medium">
              🎉 Congratulations! You've completed the quiz! All answers are correct.
            </p>
          </div>
        </div>
      )}

      {/* Questions */}
      {quizData.questions.map((question, qIndex) => (
        <div key={qIndex} className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Question {qIndex + 1} of {quizData.questions.length}
                </p>
                <p className="text-gray-900 font-medium">{question.question}</p>
              </div>
              {correctAnswers[qIndex] && (
                <CheckCircle className="w-6 h-6 text-green-500 ml-4 flex-shrink-0" />
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {question.options.map((option, oIndex) => (
                <button
                  key={oIndex}
                  onClick={() => handleAnswerClick(qIndex, option)}
                  disabled={correctAnswers[qIndex]}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${getOptionStyle(
                    qIndex,
                    option
                  )} ${
                    correctAnswers[qIndex]
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {userAnswers[qIndex] === option && !correctAnswers[qIndex] && (
                      <X className="w-5 h-5" />
                    )}
                    {correctAnswers[qIndex] && option === question.answer && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {feedback[qIndex] && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  feedback[qIndex].type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <p className="font-medium flex items-center">
                  {feedback[qIndex].type === 'success' ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  {feedback[qIndex].message}
                </p>
                {correctAnswers[qIndex] && (
                  <p className="text-sm mt-1">
                    <strong>Answer:</strong> {question.answer}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizViewer;
