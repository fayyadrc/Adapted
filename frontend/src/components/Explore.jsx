import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Brain,
  Sparkles,
  Mail,
  Linkedin,
} from "lucide-react";

export default function Explore() {
  const teamMembers = [
    {
      name: "Saira Miriam Thomas",
      email: "sairamiriamthomas@gmail.com",
      linkedin: "https://linkedin.com/in/saira-thomas-17t",
      linkedinDisplay: "linkedin.com/in/saira-thomas-17t",
    },
    {
      name: "Isha Saxena",
      email: "ishasaxena008@gmail.com",
      linkedin: "https://linkedin.com/in/isha-saxena008",
      linkedinDisplay: "linkedin.com/in/isha-saxena008",
    },
    {
      name: "Saket Raje",
      email: "saketsraje@gmail.com",
      linkedin: "https://linkedin.com/in/saketsraje",
      linkedinDisplay: "linkedin.com/in/saketsraje",
    },
  ];

  const features = [
    {
      icon: Upload,
      title: "Upload & Convert",
      description:
        "Upload your text materials and convert them into visual, audio, and kinesthetic learning formats.",
      color: "purple",
    },
    {
      icon: Brain,
      title: "AI Personalization",
      description:
        "Our AI analyzes your learning style through assessments and adapts content to your preferences.",
      color: "blue",
    },
    {
      icon: Sparkles,
      title: "Interactive Learning",
      description:
        "Engage with quizzes, mind maps, infographics, and audio content tailored to your learning needs.",
      color: "green",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-100",
        icon: "text-purple-600",
        border: "border-purple-100",
      },
      blue: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
        icon: "text-blue-600",
        border: "border-blue-100",
      },
      green: {
        bg: "bg-green-50",
        iconBg: "bg-green-100",
        icon: "text-green-600",
        border: "border-green-100",
      },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Adapt<span className="text-purple-600">Ed</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your learning materials into personalized visual, audio,
            and kinesthetic experiences. Adaptive learning that adjusts to your
            unique learning style and cognitive preferences.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            How AdaptEd Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const colorClasses = getColorClasses(feature.color);
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-2xl shadow-sm border ${colorClasses.border} hover:shadow-md transition-all duration-200`}
                >
                  <div
                    className={`w-14 h-14 ${colorClasses.iconBg} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-7 h-7 ${colorClasses.icon}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meet The Team Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Meet The Team
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-xl mx-auto">
            Passionate educators and technologists building the future of
            personalized learning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-center"
              >
                {/* Avatar placeholder */}
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {member.name}
                </h3>
                <div className="space-y-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>{member.linkedinDisplay}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
