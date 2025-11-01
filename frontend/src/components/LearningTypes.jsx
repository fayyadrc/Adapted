import { Eye, Headphones, Activity } from 'lucide-react';

const LearningTypes = () => {
  const learningTypes = [
    {
      id: 'visual',
      title: 'Visual Learning',
      subtitle: 'Convert to visual formats',
      icon: Eye,
      color: 'from-pink-400 to-purple-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      options: [
        { label: 'Mind Maps', action: 'mindmaps' },
        { label: 'Infographics', action: 'infographics' },
        { label: 'Charts', action: 'charts' },
        { label: 'Diagrams', action: 'diagrams' }
      ]
    },
    {
      id: 'audio',
      title: 'Audio Learning',
      subtitle: 'Convert to audio formats',
      icon: Headphones,
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      options: [
        { label: 'Podcasts', action: 'podcasts' },
        { label: 'Summaries', action: 'summaries' },
        { label: 'Q&A Audio', action: 'qa-audio' },
        { label: 'Narration', action: 'narration' }
      ]
    },
    {
      id: 'kinesthetic',
      title: 'Kinesthetic Learning',
      subtitle: 'Convert to interactive formats',
      icon: Activity,
      color: 'from-green-400 to-teal-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      options: [
        { label: 'Simulations', action: 'simulations' },
        { label: 'Games', action: 'games' },
        { label: 'Activities', action: 'activities' },
        { label: 'Experiments', action: 'experiments' }
      ]
    }
  ];

  const handleOptionClick = (learningType, option) => {
    console.log(`Selected ${option.label} for ${learningType.title}`);
    // Add your logic here to handle different learning type selections
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {learningTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <div
              key={type.id}
              className={`${type.bgColor} ${type.borderColor} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >

              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mr-3`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {type.options.map((option) => (
                  <button
                    key={option.action}
                    onClick={() => handleOptionClick(type, option)}
                    className="p-3 bg-white rounded-lg border border-gray-200 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-xs text-gray-500">Drag uploaded content here</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningTypes;