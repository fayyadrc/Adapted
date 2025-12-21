import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Headphones,
  BookOpen,
  Hand,
  CheckCircle,
  Sparkles,
  Target,
  Brain,
  LayoutGrid,
  Zap,
  TrendingUp,
  Mail,
  Linkedin,
  Users,
} from "lucide-react";

export default function Explore() {
  const varkStyles = [
    {
      letter: "V",
      title: "Visual",
      description:
        "Learners who benefit from diagrams, charts, maps, and visual patterns.",
      icon: Eye,
      color: "purple",
    },
    {
      letter: "A",
      title: "Auditory",
      description:
        "Learners who understand best by listening, discussing, and hearing concepts explained.",
      icon: Headphones,
      color: "blue",
    },
    {
      letter: "R",
      title: "Read/Write",
      description:
        "Learners who prefer words—reading explanations, writing notes, and using definitions.",
      icon: BookOpen,
      color: "green",
    },
    {
      letter: "K",
      title: "Kinaesthetic",
      description:
        "Learners who learn best by doing—hands-on practice, experiments, and interaction.",
      icon: Hand,
      color: "orange",
    },
  ];

  const features = [
    {
      icon: LayoutGrid,
      title: "Learn in Different Formats",
      description:
        "Access the same concept in different forms: text explanations, visual diagrams, audio narration, and interactive practice.",
    },
    {
      icon: Target,
      title: "Adapted Support Over Time",
      description:
        "Get guided toward the right difficulty level, targeted practice on weak areas, and revision that improves retention.",
    },
    {
      icon: Brain,
      title: "Ownership and Independence",
      description:
        "Actively learn how you learn best. Build self-paced habits, reflection skills, and confidence through improvement.",
    },
  ];

  const benefits = [
    "Build confidence through personalized progress",
    "Stay engaged with content that makes sense to you",
    "Improve learning efficiency—less time stuck, more mastering",
    "Become more independent and self-aware learners",
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-100",
        icon: "text-purple-600",
        border: "border-purple-200",
        letterBg: "bg-purple-600",
      },
      blue: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
        icon: "text-blue-600",
        border: "border-blue-200",
        letterBg: "bg-blue-600",
      },
      green: {
        bg: "bg-green-50",
        iconBg: "bg-green-100",
        icon: "text-green-600",
        border: "border-green-200",
        letterBg: "bg-green-600",
      },
      orange: {
        bg: "bg-orange-50",
        iconBg: "bg-orange-100",
        icon: "text-orange-600",
        border: "border-orange-200",
        letterBg: "bg-orange-600",
      },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            About <span className="text-purple-600">AdaptEd</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Learning isn't one-size-fits-all. Some students understand best by
            watching a diagram, others by listening, doing, or reading.{" "}
            <strong>AdaptEd</strong> responds to those differences—so each
            learner can move at the right pace, in the right format, with the
            right support.
          </p>
        </div>
      </section>

      {/* What Is Adaptive Learning */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Is Adaptive Learning?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A method of teaching that{" "}
              <strong>adjusts content, pace, and practice</strong> based on a
              student's needs. Instead of giving every student the same
              explanation, adaptive learning:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Identifies what a student already understands",
              "Spots gaps and misconceptions",
              "Offers the next best step",
              "Adjusts difficulty and format over time",
              "Encourages independent learning",
              "Builds reflection and self-awareness",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-lg text-gray-600">
            At its core, adaptive learning helps students{" "}
            <strong>learn smarter, not harder</strong>—by giving them what they
            need <em>when</em> they need it.
          </p>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Adaptive Learning Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              In most classrooms, students face one of two problems:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Too Fast</h3>
              <p className="text-gray-600">
                The lesson moves on before they understand, and they fall
                behind.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-yellow-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Too Slow</h3>
              <p className="text-gray-600">
                They already understand, but they're forced to repeat content
                and lose motivation.
              </p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Adaptive learning supports both situations by helping learners:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Platform */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How AdaptEd Helps You
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              An adaptive learning space designed to help students{" "}
              <strong>explore what works best for them</strong>. Instead of
              asking students to "fit" the lesson, we shape the lesson to better
              fit the student.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-8 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VARK Model */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The VARK Model
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A well-known framework that describes four common learning
              preferences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {varkStyles.map((style, index) => {
              const colorClasses = getColorClasses(style.color);
              const Icon = style.icon;
              return (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-2xl border ${colorClasses.border} hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 ${colorClasses.letterBg} rounded-xl flex items-center justify-center`}
                    >
                      <span className="text-xl font-bold text-white">
                        {style.letter}
                      </span>
                    </div>
                    <div
                      className={`w-10 h-10 ${colorClasses.iconBg} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {style.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {style.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              What VARK Tells Us
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                "Students learn better when content matches how they process information",
                "Many people are multi-modal, using more than one preference",
                "Learning preferences can change depending on the subject",
                "Students should try multiple formats, not be boxed into just one",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Goal Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Goal</h2>
          <p className="text-xl md:text-2xl font-medium mb-8 opacity-95">
            Help students understand better, faster, and more confidently—by
            making learning personal.
          </p>
          <p className="text-lg opacity-80">
            Adaptive learning isn't just a feature. It's a shift in how students
            experience education:{" "}
            <strong>more choice, more clarity, more control</strong>.
          </p>
        </div>
      </section>

      {/* About the Team */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate minds behind AdaptEd, working to make learning more personal and effective.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Saira Miriam Thomas", 
                email: "sairamiriamthomas@gmail.com",
                linkedin: "linkedin.com/in/saira-thomas-17t"
              },
              { 
                name: "Isha Saxena", 
                email: "ishasaxena008@gmail.com",
                linkedin: "linkedin.com/in/isha-saxena008"
              },
              { 
                name: "Saket Raje", 
                email: "saketsraje@gmail.com",
                linkedin: "linkedin.com/in/saketsraje"
              }
            ].map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-purple-50 p-6 rounded-2xl border border-purple-100 hover:shadow-lg transition-all text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {member.name}
                </h3>
                <div className="space-y-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </a>
                  <a
                    href={`https://${member.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beta Notice */}
      <section className="py-12 bg-yellow-50 border-t border-yellow-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Beta Version</span>
          </div>
          <p className="text-gray-700">
            Website is currently in Beta Phase. Features available for now only
            include conversion of <strong>Read/Write styles</strong> to{" "}
            <strong>Visual</strong> and <strong>Auditory</strong> styles.
          </p>
        </div>
      </section>
    </div>
  );
}
