import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const Quiz = () => {
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setContent('');
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setFile(null);
  };

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setUserAnswers({});
    setFeedback({});
    setCorrectAnswers({});

    try {
      const formData = new FormData();
      formData.append('quiz_type', 'mcq');
      formData.append('num_questions', numQuestions);

      if (file) {
        formData.append('file', file);
      } else {
        formData.append('content', content);
      }

      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setQuiz(data.result);
      } else {
        alert('Error: ' + (data.error || 'Failed to generate quiz'));
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (questionIndex, selectedOption) => {
    // If already answered correctly, don't allow changing
    if (correctAnswers[questionIndex]) {
      return;
    }

    const question = quiz.questions[questionIndex];
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
    const question = quiz.questions[questionIndex];

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
    if (!quiz) return false;
    return Object.keys(correctAnswers).length === quiz.questions.length;
  };

  const resetQuiz = () => {
    setQuiz(null);
    setUserAnswers({});
    setFeedback({});
    setCorrectAnswers({});
    setFile(null);
    setContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Quiz Generator</h1>

        {!quiz ? (
          <Card>
            <CardHeader>
              <CardTitle>Generate a Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (PDF or DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="text-center text-gray-500 font-medium">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Content
                </label>
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Paste your text content here..."
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={generateQuiz}
                disabled={loading || (!file && !content)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-gray-400"
              >
                {loading ? 'Generating Quiz...' : 'Generate Quiz'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {quiz.quiz_type.toUpperCase()} Quiz
              </h2>
              <Button
                onClick={resetQuiz}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
              >
                New Quiz
              </Button>
            </div>

            {isQuizComplete() && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800 font-medium">
                  🎉 Congratulations! You've completed the quiz! All answers are correct.
                </AlertDescription>
              </Alert>
            )}

            {quiz.questions.map((question, qIndex) => (
              <Card key={qIndex} className="shadow-md">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg">
                    Question {qIndex + 1} of {quiz.questions.length}
                  </CardTitle>
                  <p className="text-gray-700 mt-2">{question.question}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerClick(qIndex, option)}
                        disabled={correctAnswers[qIndex]}
                        className={`w-full text-left px-4 py-3 rounded-md border-2 transition-colors duration-200 ${getOptionStyle(
                          qIndex,
                          option
                        )} ${
                          correctAnswers[qIndex]
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        <span className="font-medium">{option}</span>
                      </button>
                    ))}
                  </div>

                  {feedback[qIndex] && (
                    <div
                      className={`mt-4 p-3 rounded-md ${
                        feedback[qIndex].type === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <p className="font-medium">{feedback[qIndex].message}</p>
                      {correctAnswers[qIndex] && (
                        <p className="text-sm mt-1">
                          Answer: {question.answer}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Placeholder for future Finish Quiz button */}
            {/* <Button
              onClick={handleFinishQuiz}
              disabled={!isQuizComplete()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md disabled:bg-gray-400"
            >
              Finish Quiz & Save Results
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
