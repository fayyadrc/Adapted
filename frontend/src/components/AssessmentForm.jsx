import { useState } from 'react';
import { BarChart3, Save, Send, ChevronRight } from 'lucide-react';

const AssessmentForm = () => {
  const [scores, setScores] = useState({
    verbal: '',
    quantitative: '',
    nonVerbal: '',
    spatial: ''
  });
  const [preferences, setPreferences] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const scoreFields = [
    {
      key: 'verbal',
      label: 'Verbal Reasoning Score',
      placeholder: 'e.g., 115',
      description: 'How well you understand and use words'
    },
    {
      key: 'quantitative',
      label: 'Quantitative Reasoning Score',
      placeholder: 'e.g., 108',
      description: 'How well you work with numbers and math'
    },
    {
      key: 'nonVerbal',
      label: 'Non-Verbal Reasoning Score',
      placeholder: 'e.g., 122',
      description: 'How well you solve visual puzzles'
    },
    {
      key: 'spatial',
      label: 'Spatial Ability Score',
      placeholder: 'e.g., 95',
      description: 'How well you think about shapes and space'
    }
  ];

  const handleScoreChange = (key, value) => {
    setScores(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores,
          preferences,
          additionalInfo
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    alert('Draft saved! You can come back and finish this later.');
  };

  const isStep1Complete = Object.values(scores).every(score => score.trim() !== '');
  const canSubmit = isStep1Complete && preferences.trim() !== '';

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Help us personalize your learning
        </h1>
        <p className="text-gray-600">
          Share your CAT4 scores so we can recommend the best study formats for you
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium text-gray-600">Test Scores</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium text-gray-600">Preferences</span>
        </div>
      </div>

      {/* Step 1: Test Scores */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 font-bold">1</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Your CAT4 Test Scores</h2>
        </div>

        <div className="space-y-4">
          {scoreFields.map((field) => (
            <div key={field.key} className="p-4 bg-white rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <p className="text-xs text-gray-500 mb-3">{field.description}</p>
              <input
                type="number"
                placeholder={field.placeholder}
                value={scores[field.key]}
                onChange={(e) => handleScoreChange(field.key, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                min="0"
                max="200"
              />
            </div>
          ))}
        </div>

        {isStep1Complete && currentStep === 1 && (
          <button
            onClick={() => setCurrentStep(2)}
            className="w-full mt-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            Continue to Preferences
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {/* Step 2: Learning Preferences (show after step 1 or if step 2 is active) */}
      {(currentStep === 2 || isStep1Complete) && (
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">2</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">How do you learn best?</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Preferences
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Tell us what helps you understand things better
              </p>
              <textarea
                placeholder="e.g., I learn better with visual diagrams, I like listening to explanations, I prefer hands-on activities..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                rows="4"
              />
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Any learning challenges, strengths, or other helpful details
              </p>
              <textarea
                placeholder="e.g., I have trouble focusing for long periods, I'm really good at remembering stories..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                rows="3"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {currentStep === 2 && (
        <div className="flex gap-4">
          <button
            onClick={handleSaveDraft}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Draft
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Assessment
              </>
            )}
          </button>
        </div>
      )}

      {/* Back to Step 1 button */}
      {currentStep === 2 && !recommendations && (
        <button
          onClick={() => setCurrentStep(1)}
          className="w-full mt-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          ← Back to Test Scores
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Recommendations Display */}
      {recommendations && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Personalized Recommendations</h2>
            <p className="text-gray-600">Based on your CAT4 scores and preferences</p>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    rec.confidence === 'high' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      rec.confidence === 'high' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{rec.format}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.confidence === 'high' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.confidence} match
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{rec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Creating Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentForm;