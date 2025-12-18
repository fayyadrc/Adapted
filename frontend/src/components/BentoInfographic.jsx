import React from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Target,
  BookOpen,
  Sparkles,
  CheckCircle,
  Brain,
  Zap,
  Award,
  TrendingUp,
  Users,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';

// Icon mapping for dynamic icon rendering
const iconMap = {
  Lightbulb,
  Target,
  BookOpen,
  Sparkles,
  CheckCircle,
  Brain,
  Zap,
  Award,
  TrendingUp,
  Users,
};

// Animation variants for staggered entry
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Progress Bar Component
const ProgressBar = ({ steps, currentStep = steps.length }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Learning Progress
        </span>
        <span className="text-xs font-medium text-emerald-600">
          {currentStep}/{steps.length} Concepts
        </span>
      </div>
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`flex-1 h-2 rounded-full transition-colors ${
                index < currentStep
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
            {index < steps.length - 1 && (
              <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((step, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`text-xs font-medium ${
              index < currentStep ? 'text-emerald-600' : 'text-slate-400'
            }`}
            style={{ width: `${100 / steps.length}%`, textAlign: 'center' }}
          >
            {step}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

// Hero Block Component
const HeroBlock = ({ title, content, icon }) => {
  const IconComponent = iconMap[icon] || Lightbulb;

  return (
    <motion.div
      variants={itemVariants}
      className="md:col-span-2 relative overflow-hidden"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-3xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-3xl" />
      
      <div className="relative p-8 rounded-3xl border border-white/50 shadow-lg shadow-emerald-100/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-2 block">
              Core Concept
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight font-serif">
              {title}
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Stats Block Component
const StatsBlock = ({ stats }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      {stats.slice(0, 3).map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent)] rounded-2xl" />
          <div className="relative p-5 text-white">
            <div className="text-3xl font-black tracking-tight">{stat.value}</div>
            <div className="text-sm opacity-90 font-medium mt-1">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Split Stat Block Component
const SplitStatBlock = ({ stat1, stat2 }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="md:col-span-2 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15),_transparent)] rounded-3xl" />
      
      <div className="relative p-6 rounded-3xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-4xl font-black text-emerald-400 mb-2">{stat1.value}</div>
            <div className="text-white font-semibold">{stat1.label}</div>
            {stat1.description && (
              <div className="text-slate-400 text-sm mt-1">{stat1.description}</div>
            )}
          </div>
          <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-4xl font-black text-teal-400 mb-2">{stat2.value}</div>
            <div className="text-white font-semibold">{stat2.label}</div>
            {stat2.description && (
              <div className="text-slate-400 text-sm mt-1">{stat2.description}</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Key Point Block Component
const KeyPointBlock = ({ title, description, icon, index }) => {
  const IconComponent = iconMap[icon] || Target;
  const colors = [
    { bg: 'from-blue-50 to-indigo-50', icon: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'from-purple-50 to-pink-50', icon: 'bg-purple-100', iconColor: 'text-purple-600', border: 'border-purple-100' },
    { bg: 'from-amber-50 to-orange-50', icon: 'bg-amber-100', iconColor: 'text-amber-600', border: 'border-amber-100' },
    { bg: 'from-rose-50 to-red-50', icon: 'bg-rose-100', iconColor: 'text-rose-600', border: 'border-rose-100' },
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden group"
    >
      {/* Glassmorphism background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} rounded-3xl opacity-60`} />
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-3xl" />
      
      <div className={`relative p-6 rounded-3xl border ${color.border} group-hover:shadow-lg transition-shadow duration-300`}>
        <div className={`w-12 h-12 ${color.icon} rounded-xl mb-4 flex items-center justify-center shadow-sm`}>
          <IconComponent className={`w-6 h-6 ${color.iconColor}`} />
        </div>
        <h3 className="font-bold text-slate-900 text-lg font-serif">{title}</h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Comparison Block Component
const ComparisonBlock = ({ title, left, right }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="md:col-span-3 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl" />
      <div className="absolute inset-0 bg-white/50 backdrop-blur-xl rounded-3xl" />
      
      <div className="relative p-6 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeftRight className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-900 font-serif">{title || 'Compare & Contrast'}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <h4 className="font-semibold text-emerald-700 mb-3">{left.label}</h4>
            <ul className="space-y-2">
              {left.points?.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
            <h4 className="font-semibold text-teal-700 mb-3">{right.label}</h4>
            <ul className="space-y-2">
              {right.points?.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Conclusion Block Component
const ConclusionBlock = ({ content, icon }) => {
  const IconComponent = iconMap[icon] || CheckCircle;

  return (
    <motion.div
      variants={itemVariants}
      className="md:col-span-3 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.2),_transparent)] rounded-3xl" />
      
      <div className="relative p-6 rounded-3xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
              Key Takeaway
            </span>
            <p className="text-lg font-medium mt-1">{content}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Block Renderer - renders the appropriate block based on type
const BlockRenderer = ({ block, index }) => {
  switch (block.type) {
    case 'hero':
      return <HeroBlock {...block} />;
    case 'split-stat':
      return <SplitStatBlock {...block} />;
    case 'key-point':
      return <KeyPointBlock {...block} index={index} />;
    case 'comparison':
      return <ComparisonBlock {...block} />;
    case 'conclusion':
      return <ConclusionBlock {...block} />;
    default:
      return null;
  }
};

// Main Bento Infographic Component
const BentoInfographic = ({ data }) => {
  if (!data) {
    return (
      <div className="p-6 text-center text-slate-500">
        No infographic data available
      </div>
    );
  }

  // Handle both new blocks format and legacy format
  const hasBlocks = data.blocks && data.blocks.length > 0;
  
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-serif mb-3">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        )}
      </motion.div>

      {/* Progress Bar */}
      {data.progressSteps && data.progressSteps.length > 0 && (
        <ProgressBar steps={data.progressSteps} />
      )}

      {/* Bento Grid */}
      {hasBlocks ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {data.blocks.map((block, index) => (
            <BlockRenderer key={index} block={block} index={index} />
          ))}
        </motion.div>
      ) : (
        // Legacy format fallback
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Legacy Hero from title/subtitle */}
          <HeroBlock
            title={data.title}
            content={data.subtitle || data.conclusion || 'Key concepts from your document'}
            icon="Lightbulb"
          />

          {/* Legacy Stats */}
          {data.stats && data.stats.length > 0 && (
            <StatsBlock stats={data.stats} />
          )}

          {/* Legacy Key Points */}
          {data.key_points?.map((point, index) => (
            <KeyPointBlock
              key={index}
              title={point.title}
              description={point.description}
              icon="Target"
              index={index}
            />
          ))}

          {/* Legacy Conclusion */}
          {data.conclusion && (
            <ConclusionBlock content={data.conclusion} icon="CheckCircle" />
          )}
        </motion.div>
      )}

      {/* Footer Attribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-slate-400">
          Generated by Adapted AI • Interactive Educational Infographic
        </p>
      </motion.div>
    </div>
  );
};

export default BentoInfographic;
