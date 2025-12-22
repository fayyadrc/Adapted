import React from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Headphones,
  BookOpen,
  Hand,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle,
  Brain,
  LayoutGrid,
} from "lucide-react";

export default function LandingPage() {
  const varkStyles = [
    {
      letter: "V",
      title: "Visual",
      icon: Eye,
      color: "purple",
    },
    {
      letter: "A",
      title: "Auditory",
      icon: Headphones,
      color: "blue",
    },
    {
      letter: "R",
      title: "Read/Write",
      icon: BookOpen,
      color: "green",
    },
    {
      letter: "K",
      title: "Kinaesthetic",
      icon: Hand,
      color: "orange",
    },
  ];

  const features = [
    {
      icon: LayoutGrid,
      title: "Multiple Formats",
      description: "Text, diagrams, audio, and interactive practice.",
    },
    {
      icon: Target,
      title: "Adaptive Support",
      description: "Right difficulty, targeted practice, better retention.",
    },
    {
      icon: Brain,
      title: "Build Independence",
      description: "Self-paced learning and reflection skills.",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: { letterBg: "bg-purple-600", iconBg: "bg-purple-100", icon: "text-purple-600" },
      blue: { letterBg: "bg-blue-600", iconBg: "bg-blue-100", icon: "text-blue-600" },
      green: { letterBg: "bg-green-600", iconBg: "bg-green-100", icon: "text-green-600" },
      orange: { letterBg: "bg-orange-600", iconBg: "bg-orange-100", icon: "text-orange-600" },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Currently in Beta Phase</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-2 leading-tight">
            AdaptEd
          </h1>
          <p className="text-xl md:text-2xl font-medium text-purple-600 mb-8 tracking-wide">
            Adaptive Learning, Reimagined
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Learning isn't one-size-fits-all. <strong>AdaptEd</strong> responds to how you learn best—right pace, right format, right support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-purple-700 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VARK Quick Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Built on the VARK Model
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Four learning preferences—one personalized experience.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {varkStyles.map((style, index) => {
              const colorClasses = getColorClasses(style.color);
              const Icon = style.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm"
                >
                  <div
                    className={`w-10 h-10 ${colorClasses.letterBg} rounded-lg flex items-center justify-center`}
                  >
                    <span className="text-lg font-bold text-white">
                      {style.letter}
                    </span>
                  </div>
                  <div className={`w-8 h-8 ${colorClasses.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${colorClasses.icon}`} />
                  </div>
                  <span className="font-medium text-gray-700">{style.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Learn Your Way?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            More choice. More clarity. More control over your learning.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Learning Your Way
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Beta Notice */}
      <section className="py-10 bg-yellow-50 border-t border-yellow-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Beta Version</span>
          </div>
          <p className="text-gray-700 text-sm">
            Currently in Beta. Features include conversion of <strong>Read/Write styles</strong> to{" "}
            <strong>Visual</strong> and <strong>Auditory</strong> styles.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-white">AdaptEd</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} AdaptEd. Transforming how students learn.
          </p>
        </div>
      </footer>
    </div>
  );
}
