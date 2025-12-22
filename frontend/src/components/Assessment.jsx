import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calculator, 
  Puzzle, 
  Palette, 
  Scale, 
  BarChart3, 
  Lightbulb, 
  Target, 
  BookText, 
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';

// Icon mapping for dynamic rendering
const IconComponents = {
  BookOpen,
  Calculator,
  Puzzle,
  Palette,
  Scale,
  BarChart3,
  Lightbulb,
  Target,
  BookText,
  AlertTriangle
};

// Helper function to determine the learning profile based on CAT4 scores
function analyzeLearningProfile(scores) {
  const { verbal, quantitative, nonVerbal, spatial } = scores;
  
  // Calculate the difference between Verbal and Spatial (using stanine-like logic)
  const verbalSpatialDiff = verbal - spatial;
  
  // Determine the primary learning bias (7 profiles)
  let primaryProfile = '';
  let biasStrength = '';
  
  if (verbalSpatialDiff >= 25) {
    primaryProfile = 'Verbal';
    biasStrength = 'Extreme';
  } else if (verbalSpatialDiff >= 15) {
    primaryProfile = 'Verbal';
    biasStrength = 'Moderate';
  } else if (verbalSpatialDiff >= 8) {
    primaryProfile = 'Verbal';
    biasStrength = 'Mild';
  } else if (verbalSpatialDiff <= -25) {
    primaryProfile = 'Spatial';
    biasStrength = 'Extreme';
  } else if (verbalSpatialDiff <= -15) {
    primaryProfile = 'Spatial';
    biasStrength = 'Moderate';
  } else if (verbalSpatialDiff <= -8) {
    primaryProfile = 'Spatial';
    biasStrength = 'Mild';
  } else {
    primaryProfile = 'Even';
    biasStrength = 'Balanced';
  }
  
  // Determine dominant CAT4 battery (highest score)
  const batteries = [
    { key: 'verbal', score: verbal, label: 'Verbal Reasoning' },
    { key: 'quantitative', score: quantitative, label: 'Quantitative Reasoning' },
    { key: 'nonVerbal', score: nonVerbal, label: 'Non-Verbal Reasoning' },
    { key: 'spatial', score: spatial, label: 'Spatial Reasoning' }
  ];
  
  const dominantBattery = batteries.reduce((max, b) => b.score > max.score ? b : max, batteries[0]);
  
  // Map dominant battery to learning style:
  // Verbal Reasoning → Auditory
  // Quantitative, Non-Verbal, Spatial → Visual
  const learningStyle = dominantBattery.key === 'verbal' ? 'Auditory' : 'Visual';
  
  // Analyze secondary insights
  const quantitativeStrength = quantitative >= 115 ? 'High' : quantitative >= 85 ? 'Average' : 'Low';
  const nonVerbalStrength = nonVerbal >= 115 ? 'High' : nonVerbal >= 85 ? 'Average' : 'Low';
  const verbalStrength = verbal >= 115 ? 'High' : verbal >= 85 ? 'Average' : 'Low';
  
  // Check for potential language barrier (high non-verbal, low verbal)
  const potentialLanguageBarrier = nonVerbal >= 100 && verbal < 85;
  
  // Calculate overall cognitive ability
  const overallScore = (verbal + quantitative + nonVerbal + spatial) / 4;
  const overallAbility = overallScore >= 115 ? 'Above Average' : overallScore >= 85 ? 'Average' : 'Below Average';
  
  return {
    primaryProfile,
    biasStrength,
    verbalSpatialDiff,
    dominantBattery: dominantBattery.key,
    dominantBatteryLabel: dominantBattery.label,
    learningStyle,
    quantitativeStrength,
    nonVerbalStrength,
    verbalStrength,
    potentialLanguageBarrier,
    overallScore: Math.round(overallScore),
    overallAbility,
    scores
  };
}

// Generate recommendations based on the learning profile
function generateRecommendations(profile) {
  const recommendations = [];
  
  // Primary learning style recommendations
  if (profile.primaryProfile === 'Spatial') {
    recommendations.push({
      category: 'Learning Approach',
      icon: 'Palette',
      title: 'Visual-Spatial Learner',
      description: 'You excel at thinking in pictures and visualizing concepts.',
      tips: [
        'Use mind maps and diagrams to organize information',
        'Take the lead on practical, hands-on tasks to build confidence',
        'Convert text-heavy content into visual formats',
        'Use color-coding and spatial organization for notes',
        'Benefit from infographics and visual summaries'
      ]
    });
  } else if (profile.primaryProfile === 'Verbal') {
    recommendations.push({
      category: 'Learning Approach',
      icon: 'BookText',
      title: 'Verbal Learner',
      description: 'You excel at thinking with words and language-based reasoning.',
      tips: [
        'Focus on language-based instructions and reading',
        'Engage in discussions and verbal explanations',
        'Write summaries and notes in your own words',
        'Use audio content and podcasts for learning',
        'Explain concepts to others to reinforce understanding'
      ]
    });
  } else {
    recommendations.push({
      category: 'Learning Approach',
      icon: 'Scale',
      title: 'Balanced Learner',
      description: 'You can learn effectively through both verbal and visual methods.',
      tips: [
        'Experiment with different learning formats',
        'Combine visual aids with written explanations',
        'Use both mind maps and written summaries',
        'Adapt your approach based on the subject matter',
        'Take advantage of multimedia learning resources'
      ]
    });
  }
  
  // Quantitative recommendations
  if (profile.quantitativeStrength === 'High') {
    recommendations.push({
      category: 'Subject Strengths',
      icon: 'Calculator',
      title: 'Strong Quantitative Reasoning',
      description: 'You have excellent numerical and logical thinking abilities.',
      tips: [
        'Likely to excel in Mathematics and Statistics',
        'Well-suited for Science and Economics subjects',
        'Consider data-driven approaches to problem-solving',
        'Use numerical examples to understand abstract concepts'
      ]
    });
  } else if (profile.quantitativeStrength === 'Low') {
    recommendations.push({
      category: 'Areas for Support',
      icon: 'BarChart3',
      title: 'Quantitative Support Needed',
      description: 'You may benefit from additional support in numerical reasoning.',
      tips: [
        'Break down math problems into smaller steps',
        'Use visual representations for numerical concepts',
        'Practice with real-world numerical examples',
        'Consider additional tutoring in mathematics'
      ]
    });
  }
  
  // Language barrier flag
  if (profile.potentialLanguageBarrier) {
    recommendations.push({
      category: 'Important Insight',
      icon: 'AlertTriangle',
      title: 'Potential Language Processing Difference',
      description: 'Your strong non-verbal reasoning combined with lower verbal scores may indicate a language-specific learning difference.',
      tips: [
        'Your thinking skills are strong - verbal scores may not reflect true ability',
        'Consider screening for dyslexia or language processing differences',
        'Use visual and practical methods as primary learning tools',
        'Don\'t let language-based assessments discourage you',
        'Request accommodations if needed for verbal-heavy tasks'
      ]
    });
  }
  
  // Non-verbal reasoning insights
  if (profile.nonVerbalStrength === 'High') {
    recommendations.push({
      category: 'Hidden Strengths',
      icon: 'Puzzle',
      title: 'Strong Abstract Reasoning',
      description: 'You excel at identifying patterns and solving complex problems.',
      tips: [
        'Strong foundation for scientific and analytical thinking',
        'Good at seeing connections between concepts',
        'May excel in design, engineering, or strategic fields',
        'Use pattern recognition to accelerate learning'
      ]
    });
  }
  
  return recommendations;
}

// Get profile color scheme based on learning style
function getProfileColor(learningStyle) {
  switch (learningStyle) {
    case 'Auditory':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', accent: 'bg-blue-600' };
    case 'Visual':
      return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', accent: 'bg-purple-600' };
    default:
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', accent: 'bg-green-600' };
  }
}

// Score input component
function ScoreInput({ label, description, value, onChange, icon: IconComponent }) {
  const numValue = parseInt(value) || 0;
  const isValid = value === '' || (numValue >= 60 && numValue <= 141);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            {label}
          </label>
          <p className="text-xs text-gray-500 mb-2">{description}</p>
          <input
            type="number"
            min="60"
            max="141"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg font-medium ${
              !isValid ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
            }`}
            placeholder="SAS Score (60-141)"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Below Avg (&lt;85)</span>
            <span>Average (85-115)</span>
            <span>Above Avg (&gt;115)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Assessment() {
  const [scores, setScores] = useState({
    verbal: '100',
    quantitative: '100',
    nonVerbal: '100',
    spatial: '100'
  });
  const [showResults, setShowResults] = useState(false);
  const [profile, setProfile] = useState(null);
  
  const handleScoreChange = (field) => (value) => {
    setScores(prev => ({ ...prev, [field]: value }));
  };
  
  // Convert string scores to numbers for analysis
  const getNumericScores = () => ({
    verbal: parseInt(scores.verbal) || 0,
    quantitative: parseInt(scores.quantitative) || 0,
    nonVerbal: parseInt(scores.nonVerbal) || 0,
    spatial: parseInt(scores.spatial) || 0
  });
  
  const handleAnalyze = () => {
    const numericScores = getNumericScores();
    const analysisResult = analyzeLearningProfile(numericScores);
    setProfile(analysisResult);
    setShowResults(true);
  };
  
  const handleReset = () => {
    setShowResults(false);
    setProfile(null);
    setScores({
      verbal: '100',
      quantitative: '100',
      nonVerbal: '100',
      spatial: '100'
    });
  };
  
  // Validate: all fields must have values in valid range
  const isValidScores = Object.values(scores).every(s => {
    const num = parseInt(s);
    return s !== '' && !isNaN(num) && num >= 60 && num <= 141;
  });
  
  if (showResults && profile) {
    const recommendations = generateRecommendations(profile);
    const colors = getProfileColor(profile.learningStyle);
    const numScores = getNumericScores();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Assessment
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Your Learning Profile</h1>
            <p className="text-gray-600 mt-1">Based on your CAT4 assessment scores</p>
          </div>
          
          {/* Learning Style Card */}
          <div className={`${colors.bg} ${colors.border} border rounded-2xl p-6 mb-8`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className={`${colors.text} opacity-70 text-sm mb-1`}>
                  Based on your strongest battery: {profile.dominantBatteryLabel}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 ${colors.accent} text-white text-sm font-medium rounded-full`}>
                    {profile.learningStyle} Learner
                  </span>
                </div>
                <h2 className={`text-2xl font-bold ${colors.text}`}>
                  You learn best with {profile.learningStyle.toLowerCase()} methods
                </h2>
                <p className={`${colors.text} opacity-80 mt-2 text-sm`}>
                  {profile.learningStyle === 'Auditory' 
                    ? 'You process information best through listening, discussing, and verbal explanations. Try podcasts, lectures, and talking through concepts.'
                    : 'You process information best through images, diagrams, and visual representations. Try mind maps, infographics, and color-coded notes.'}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="text-center px-4 py-2 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{numScores.verbal}</div>
                  <div className="text-xs text-gray-600">Verbal</div>
                </div>
                <div className="text-center px-4 py-2 bg-white/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{numScores.spatial}</div>
                  <div className="text-xs text-gray-600">Spatial</div>
                </div>
              </div>
            </div>
            
            {/* Score Comparison Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className={colors.text}>Verbal Reasoning</span>
                <span className={colors.text}>Spatial Ability</span>
              </div>
              <div className="h-4 bg-white/50 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${(numScores.verbal / (numScores.verbal + numScores.spatial)) * 100}%` }}
                />
                <div 
                  className="bg-purple-500 h-full transition-all"
                  style={{ width: `${(numScores.spatial / (numScores.verbal + numScores.spatial)) * 100}%` }}
                />
              </div>
              <div className="text-center mt-2">
                <span className={`text-sm ${colors.text}`}>
                  Difference: {Math.abs(profile.verbalSpatialDiff)} points 
                  {profile.verbalSpatialDiff > 0 ? ' toward Verbal' : profile.verbalSpatialDiff < 0 ? ' toward Spatial' : ' (Balanced)'}
                </span>
              </div>
            </div>
          </div>
          
          {/* All Scores Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Verbal', value: numScores.verbal, icon: BookOpen, strength: profile.verbalStrength },
              { label: 'Quantitative', value: numScores.quantitative, icon: Calculator, strength: profile.quantitativeStrength },
              { label: 'Non-Verbal', value: numScores.nonVerbal, icon: Puzzle, strength: profile.nonVerbalStrength },
              { label: 'Spatial', value: numScores.spatial, icon: Palette, strength: numScores.spatial >= 115 ? 'High' : numScores.spatial >= 85 ? 'Average' : 'Low' }
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <item.icon className="w-6 h-6 text-purple-600 mx-auto" />
                <div className="text-2xl font-bold text-gray-900 mt-2">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
                <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                  item.strength === 'High' ? 'bg-green-100 text-green-700' :
                  item.strength === 'Low' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.strength}
                </span>
              </div>
            ))}
          </div>
          
          {/* Recommendations */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Personalized Recommendations</h3>
            
            {recommendations.map((rec, index) => {
              const RecIcon = IconComponents[rec.icon];
              return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RecIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      {rec.category}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900 mt-1">{rec.title}</h4>
                    <p className="text-gray-600 mt-1">{rec.description}</p>
                    <ul className="mt-4 space-y-2">
                      {rec.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )})}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/upload" className="btn-primary">
              Upload Content with Your Profile
            </Link>
            <button onClick={handleReset} className="btn-secondary">
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CAT4 Learning Style Assessment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your CAT4 Standard Age Scores (SAS) below to discover your unique learning profile 
            and receive personalized recommendations.
          </p>
        </div>
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">About CAT4 Scores</h3>
              <p className="text-sm text-blue-800 mt-1">
                The Cognitive Abilities Test (CAT4) measures four types of reasoning abilities. 
                Standard Age Scores (SAS) have an average of 100, with most students scoring between 85-115. 
                Scores above 115 indicate above-average ability, while scores below 85 may indicate areas needing support.
              </p>
            </div>
          </div>
        </div>
        
        {/* Score Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Enter Your CAT4 Scores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScoreInput
              label="Verbal Reasoning"
              description="Thinking with words and language"
              value={scores.verbal}
              onChange={handleScoreChange('verbal')}
              icon={BookOpen}
            />
            <ScoreInput
              label="Quantitative Reasoning"
              description="Thinking with numbers"
              value={scores.quantitative}
              onChange={handleScoreChange('quantitative')}
              icon={Calculator}
            />
            <ScoreInput
              label="Non-Verbal Reasoning"
              description="Thinking with shapes and patterns"
              value={scores.nonVerbal}
              onChange={handleScoreChange('nonVerbal')}
              icon={Puzzle}
            />
            <ScoreInput
              label="Spatial Ability"
              description="Visualizing and manipulating shapes"
              value={scores.spatial}
              onChange={handleScoreChange('spatial')}
              icon={Palette}
            />
          </div>
          
          {!isValidScores && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Please enter valid SAS scores between 60 and 141 for all batteries.
              </p>
            </div>
          )}
          
          <button
            onClick={handleAnalyze}
            disabled={!isValidScores}
            className={`w-full mt-6 py-3 px-6 rounded-xl font-semibold text-white transition-all ${
              isValidScores 
                ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Analyze My Learning Profile
          </button>
        </div>
        
        {/* What We Measure Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What This Assessment Reveals</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learning Bias</h3>
                <p className="text-sm text-gray-600">
                  Compares verbal vs spatial strengths to identify your preferred learning mode.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Subject Strengths</h3>
                <p className="text-sm text-gray-600">
                  Identifies areas where you may excel, like math, science, or language arts.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hidden Strengths</h3>
                <p className="text-sm text-gray-600">
                  Uncovers abilities that may not show in traditional assessments.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Personalized Tips</h3>
                <p className="text-sm text-gray-600">
                  Practical recommendations tailored to your unique cognitive profile.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/home" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}