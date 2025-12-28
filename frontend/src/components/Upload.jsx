import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  UploadCloud,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Brain,
  Headphones,
  FileQuestion,
  Sparkles,
  ChevronRight,
  BookText,
  BarChart2,
  Image,
  Video,
  FileText,
  Layers,
  Edit2,
  X,
  Maximize2,
  Minimize2,
  Download,
  PlusCircle,
} from "lucide-react";
import MindMapViewer from "./MindMapViewer";
import SummaryViewer from "./SummaryViewer";
import AudioPlayer from "./AudioPlayer";
import QuizViewer from "./QuizViewer";

import api from "../services/apiService";
import BentoInfographic from "./BentoInfographic";
import { toPng } from "html-to-image";

const saveResultToLocalStorage = (result) => {
  try {
    const existingResults = JSON.parse(
      localStorage.getItem("adapted:results") || "[]"
    );

    // Check if a result with this ID already exists
    const existingIndex = existingResults.findIndex((r) => r.id === result.id);

    if (existingIndex !== -1) {
      // Update existing result
      existingResults[existingIndex] = result;
    } else {
      // Add new result
      existingResults.unshift(result); // Add to beginning of array
    }

    localStorage.setItem("adapted:results", JSON.stringify(existingResults));

    // Save the last result ID so we can restore it if user navigates away
    if (result.id) {
      localStorage.setItem("adapted:last-result-id", result.id);
    }

    console.log("✅ Result saved to localStorage");
  } catch (error) {
    console.error("Failed to save result to localStorage:", error);
  }
};

const getLastResultId = () => {
  try {
    return localStorage.getItem("adapted:last-result-id");
  } catch (error) {
    console.error("Failed to get last result ID:", error);
    return null;
  }
};

const clearLastResultId = () => {
  try {
    localStorage.removeItem("adapted:last-result-id");
  } catch (error) {
    console.error("Failed to clear last result ID:", error);
  }
};

export default function Upload({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(() => {
    return localStorage.getItem("adapted:pending-title") || "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedResult, setGeneratedResult] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showMindMapModal, setShowMindMapModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showInfographicModal, setShowInfographicModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [isMindMapMinimized, setIsMindMapMinimized] = useState(false);
  const [isQuizMinimized, setIsQuizMinimized] = useState(false);
  const [isSummaryMinimized, setIsSummaryMinimized] = useState(false);
  const [isAudioMinimized, setIsAudioMinimized] = useState(false);
  const [infographicViewMode, setInfographicViewMode] = useState("interactive"); // 'interactive' or 'image'
  const [infographicImageData, setInfographicImageData] = useState(null);
  const [isCapturingInfographic, setIsCapturingInfographic] = useState(false);
  const infographicRef = useRef(null);
  const [numQuestions, setNumQuestions] = useState(() => {
    const saved = localStorage.getItem("adapted:pending-numQuestions");
    return saved ? parseInt(saved, 10) : 5;
  });
  const fileInputRef = useRef(null);
  const location = useLocation();
  const folderId = location.state?.folderId;

  // Check for pending result on mount (if user navigated away during generation)

  // State for format selection
  const [selectedFormats, setSelectedFormats] = useState(() => {
    const saved = localStorage.getItem("adapted:pending-formats");
    return saved
      ? JSON.parse(saved)
      : {
          visual: {
            mindmap: false,
            chart: false,
            diagram: false,
            infographic: false,
          },
          audio: false,
          video: false,
          quiz: false,
          flashcards: false,
          reports: false,
        };
  });
  const [showVisualSubOptions, setShowVisualSubOptions] = useState(false);
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [showAudioOptions, setShowAudioOptions] = useState(false);

  // Voice selection state - start from localStorage or empty (will use defaults from backend)
  const [hostVoiceId, setHostVoiceId] = useState(() => {
    return localStorage.getItem("adapted:pending-hostVoice") || "";
  });
  const [guestVoiceId, setGuestVoiceId] = useState(() => {
    return localStorage.getItem("adapted:pending-guestVoice") || "";
  });

  // Persist form state to localStorage
  useEffect(() => {
    localStorage.setItem("adapted:pending-title", title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem(
      "adapted:pending-formats",
      JSON.stringify(selectedFormats)
    );
  }, [selectedFormats]);

  useEffect(() => {
    localStorage.setItem(
      "adapted:pending-numQuestions",
      numQuestions.toString()
    );
  }, [numQuestions]);

  useEffect(() => {
    localStorage.setItem("adapted:pending-hostVoice", hostVoiceId);
  }, [hostVoiceId]);

  useEffect(() => {
    localStorage.setItem("adapted:pending-guestVoice", guestVoiceId);
  }, [guestVoiceId]);

  // Mock user assessment data
  const userAssessment = { recommended: ["visual"] };

  const allowedFormats = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!allowedFormats.includes(selectedFile.type)) {
      setError("Only PDF and DOCX files are supported");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const isAnyFormatSelected = () => {
    if (
      selectedFormats.audio ||
      selectedFormats.quiz ||
      selectedFormats.video ||
      selectedFormats.flashcards ||
      selectedFormats.reports
    )
      return true;
    return Object.values(selectedFormats.visual).some(
      (isSelected) => isSelected
    );
  };

  // FIXED: Main submission handler with proper data structure handling
  const handleGenerate = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError("");
    if (!file || !title || !isAnyFormatSelected()) {
      setError(
        "Please upload a file, set a title, and select at least one format."
      );
      return;
    }

    setLoading(true);
    setError(""); // Clear any previous errors

    const formatsToGenerate = [];
    if (selectedFormats.audio) formatsToGenerate.push("audio");
    if (selectedFormats.quiz) formatsToGenerate.push("quiz");
    if (selectedFormats.video) formatsToGenerate.push("video");
    if (selectedFormats.flashcards) formatsToGenerate.push("flashcards");
    if (selectedFormats.reports) formatsToGenerate.push("reports");

    // Send specific visual types instead of generic 'visual'
    if (selectedFormats.visual.mindmap) formatsToGenerate.push("mindmap");
    if (selectedFormats.visual.infographic)
      formatsToGenerate.push("infographic");
    if (selectedFormats.visual.chart) formatsToGenerate.push("chart");
    if (selectedFormats.visual.diagram) formatsToGenerate.push("diagram");

    try {
      console.log("=== UPLOAD DEBUG ===");
      console.log("Selected formats:", selectedFormats);
      console.log("Formats to generate:", formatsToGenerate);
      console.log("Number of questions:", numQuestions);
      console.log("User ID:", user?.id);
      console.log("Folder ID:", folderId);

      // Use voice IDs if provided and not empty, otherwise null (backend will use defaults)
      const finalHostVoiceId =
        selectedFormats.audio && hostVoiceId.trim() ? hostVoiceId.trim() : null;
      const finalGuestVoiceId =
        selectedFormats.audio && guestVoiceId.trim()
          ? guestVoiceId.trim()
          : null;

      console.log("Host Voice ID:", finalHostVoiceId || "using default");
      console.log("Guest Voice ID:", finalGuestVoiceId || "using default");

      const data = await api.uploadFile(
        file,
        title,
        formatsToGenerate,
        numQuestions,
        folderId,
        finalHostVoiceId,
        finalGuestVoiceId,
        user?.id
      );
      console.log("Raw backend response:", data);
      console.log("Response keys:", Object.keys(data));
      console.log("Has formats key?", "formats" in data);
      console.log("Full response:", JSON.stringify(data, null, 2));

      // FIXED: Properly structure the result based on backend response
      const enrichedResult = {
        id: data?.id || `local-${Date.now()}`,
        title: title,
        uploadedAt: data?.created_at || new Date().toISOString(),
        created_at: data?.created_at || new Date().toISOString(),
        formats: {},
      };

      // Save result ID immediately so we can restore it if user navigates away
      if (enrichedResult.id) {
        saveResultToLocalStorage(enrichedResult);
      }

      // Check if backend returned proper format structure
      if (data?.formats) {
        console.log("Backend returned proper format structure");
        enrichedResult.formats = data.formats;
      } else {
        console.log("Backend returned raw data, need to wrap it");

        // Handle visual/mindmap format
        if (selectedFormats.visual.mindmap && data.root) {
          enrichedResult.formats.visual = {
            type: "Mind Map",
            description: "Interactive mind map showing key concepts",
            data: data,
          };
        }

        // Handle quiz format (check for quiz_type or questions array)
        if (selectedFormats.quiz && (data.quiz_type || data.questions)) {
          enrichedResult.formats.quiz = {
            type: "Interactive Quiz",
            description: "Test your understanding with AI-generated questions",
            data: data,
            questionCount: data.questions?.length || 0,
            icon: "❓",
          };
        }
      }

      // Handle Infographic Generation - Use React-based BentoInfographic
      // The infographic is generated client-side but needs to be saved to the backend
      if (selectedFormats.visual.infographic && enrichedResult.id) {
        try {
          console.log("Generating Infographic (React Bento) and saving to backend...");

          // Use the backend endpoint to generate and save infographic
          const infographicResponse = await api.generateAdditionalFormat(
            enrichedResult.id,
            "infographic"
          );

          if (infographicResponse && infographicResponse.data) {
            enrichedResult.formats.infographic = infographicResponse.data;
            console.log("Infographic data generated and saved to backend successfully");
          } else {
            console.error("Failed to generate infographic data");
          }
        } catch (infographicErr) {
          console.error("Error generating infographic:", infographicErr);
          // Don't fail the entire generation if just infographic fails
        }
      }
      console.log("Enriched result structure:", enrichedResult);
      console.log("Has visual data?", !!enrichedResult?.formats?.visual?.data);
      console.log(
        "Visual data content:",
        enrichedResult?.formats?.visual?.data
      );
      console.log("Has quiz data?", !!enrichedResult?.formats?.quiz?.data);
      console.log("Has audio data?", !!enrichedResult?.formats?.audio);
      console.log("Audio URL:", enrichedResult?.formats?.audio?.url);
      console.log("Audio error:", enrichedResult?.formats?.audio?.error);

      let finalResult;
      if (generatedResult && generatedResult.title === title) {
        console.log("✅ Merging with existing formats for the same file");
        finalResult = {
          ...generatedResult,
          formats: {
            ...generatedResult.formats,
            ...enrichedResult.formats,
          },
        };
        setGeneratedResult(finalResult);
      } else {
        console.log("✅ Setting new result");
        finalResult = enrichedResult;
        setGeneratedResult(finalResult);
      }

      // Refetch the results cache so Library shows the new upload immediately
      // Using refetchQueries instead of invalidateQueries to force immediate refetch
      // Must include userId in queryKey to match the Library's query key
      await queryClient.refetchQueries({ queryKey: ["results", user?.id] });

      console.log(
        "✅ Content generated successfully. All formats available in Generated Content section."
      );
    } catch (err) {
      console.error("❌ Generation error:", err);
      const errorMessage =
        err.message || "Failed to generate. Please try again.";
      setError(errorMessage);

      // Show more helpful error message for audio generation
      if (
        selectedFormats.audio &&
        (errorMessage.includes("audio") || errorMessage.includes("timeout"))
      ) {
        setError(
          "Audio generation failed. This may take longer for large documents. Please try again or check your voice IDs."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Format Selection Handlers
  const handleFormatClick = (formatKey) => {
    if (formatKey === "visual") {
      setShowVisualSubOptions(!showVisualSubOptions);
    } else if (formatKey === "quiz") {
      const newQuizState = !selectedFormats.quiz;
      console.log("Quiz clicked. New state:", newQuizState);
      setSelectedFormats((prev) => ({
        ...prev,
        quiz: newQuizState,
      }));
      // Show options when selecting, hide when deselecting
      setShowQuizOptions(newQuizState);
      console.log("Show quiz options:", newQuizState);
    } else if (formatKey === "audio") {
      const newAudioState = !selectedFormats.audio;
      setSelectedFormats((prev) => ({
        ...prev,
        audio: newAudioState,
      }));
      setShowAudioOptions(newAudioState);
    } else if (formatKey === "video" || formatKey === "flashcards") {
      alert("Coming Soon");
    } else if (formatKey === "reports") {
      setSelectedFormats((prev) => ({
        ...prev,
        [formatKey]: !prev[formatKey],
      }));
    }
  };

  const handleSubOptionClick = (subOptionKey) => {
    if (subOptionKey === "mindmap") {
      setSelectedFormats((prev) => ({
        ...prev,
        visual: {
          ...prev.visual,
          [subOptionKey]: !prev.visual[subOptionKey],
        },
      }));
    } else if (subOptionKey === "infographic") {
      setSelectedFormats((prev) => ({
        ...prev,
        visual: {
          ...prev.visual,
          [subOptionKey]: !prev.visual[subOptionKey],
        },
      }));
    } else {
      alert("Coming Soon");
    }
  };

  const isRecommended = (key) => userAssessment.recommended.includes(key);

  const handleMinimizeMindMap = () => {
    setIsMindMapMinimized(true);
  };

  const handleMaximizeMindMap = () => {
    setShowMindMapModal(true);
    setIsMindMapMinimized(false);
  };

  const handleCloseMindMap = () => {
    setShowMindMapModal(false);
    setIsMindMapMinimized(false);
  };

  const handleMinimizeQuiz = () => {
    setIsQuizMinimized(true);
  };

  const handleMaximizeQuiz = () => {
    setShowQuizModal(true);
    setIsQuizMinimized(false);
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
    setIsQuizMinimized(false);
  };

  const handleMinimizeSummary = () => {
    setIsSummaryMinimized(true);
  };

  const handleMaximizeSummary = () => {
    setShowSummaryModal(true);
    setIsSummaryMinimized(false);
  };

  const handleCloseSummary = () => {
    setShowSummaryModal(false);
    setIsSummaryMinimized(false);
  };

  const handleMaximizeInfographic = () => {
    setShowInfographicModal(true);
  };

  const handleCloseInfographic = () => {
    setShowInfographicModal(false);
    setInfographicViewMode("interactive");
  };

  // Capture infographic as image
  const handleCaptureInfographic = async () => {
    if (!infographicRef.current || isCapturingInfographic) return;
    
    setIsCapturingInfographic(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(infographicRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      setInfographicImageData(dataUrl);
    } catch (error) {
      console.error('Failed to capture infographic:', error);
      alert('Failed to capture infographic as image. Please try again.');
    } finally {
      setIsCapturingInfographic(false);
    }
  };

  // Handle switching to image view
  const handleSwitchToImageView = async () => {
    if (infographicImageData) {
      setInfographicViewMode("image");
      return;
    }
    
    if (!infographicRef.current || isCapturingInfographic) return;
    
    setIsCapturingInfographic(true);
    try {
      setInfographicViewMode("interactive");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(infographicRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      setInfographicImageData(dataUrl);
      setInfographicViewMode("image");
    } catch (error) {
      console.error('Failed to capture infographic:', error);
      alert('Failed to capture infographic as image. Please try again.');
    } finally {
      setIsCapturingInfographic(false);
    }
  };

  // Handle download
  const handleDownloadInfographic = () => {
    if (!infographicImageData) {
      alert('Image not ready. Please wait...');
      return;
    }
    
    const link = document.createElement('a');
    link.download = `${title || 'infographic'}.png`;
    link.href = infographicImageData;
    link.click();
  };

  const handleMinimizeAudio = () => {
    setIsAudioMinimized(true);
  };

  const handleMaximizeAudio = () => {
    setShowAudioModal(true);
    setIsAudioMinimized(false);
  };

  const handleCloseAudio = () => {
    setShowAudioModal(false);
    setIsAudioMinimized(false);
  };

  const handleStartNew = () => {
    // Clear local state
    setFile(null);
    setTitle("");
    setGeneratedResult(null);
    setError("");
    
    // Reset infographic image state
    setInfographicImageData(null);
    setInfographicViewMode("interactive");

    // Clear selection
    setSelectedFormats({
      visual: {
        mindmap: false,
        chart: false,
        diagram: false,
        infographic: false,
      },
      audio: false,
      video: false,
      quiz: false,
      flashcards: false,
      reports: false,
    });

    // Clear storage
    clearLastResultId();

    // Reset file input if ref exists
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mind Map Modal - Full Screen */}
        {showMindMapModal &&
          !isMindMapMinimized &&
          generatedResult?.formats?.visual?.data && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Mind Map: {title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Interactive visualization of your content
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMinimizeMindMap}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Minimize"
                    >
                      <Minimize2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {generatedResult.formats.visual.error ? (
                    <div className="p-6">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {generatedResult.formats.visual.error}
                      </div>
                    </div>
                  ) : (
                    <MindMapViewer
                      mindMapData={generatedResult.formats.visual.data}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Quiz Modal */}
        {showQuizModal &&
          !isQuizMinimized &&
          generatedResult?.formats?.quiz?.data && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Quiz: {title}
                    </h2>
                    <p className="text-sm text-gray-500">Test your knowledge</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMinimizeQuiz}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Minimize"
                    >
                      <Minimize2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {generatedResult.formats.quiz.error ? (
                    <div className="p-6">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {generatedResult.formats.quiz.error}
                      </div>
                    </div>
                  ) : (
                    <QuizViewer quizData={generatedResult.formats.quiz.data} />
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Summary Modal */}
        {showSummaryModal &&
          !isSummaryMinimized &&
          generatedResult?.formats?.reports?.data && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Summary: {title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Comprehensive summary report
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMinimizeSummary}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Minimize"
                    >
                      <Minimize2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {generatedResult.formats.reports.error ? (
                    <div className="p-6">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {generatedResult.formats.reports.error}
                      </div>
                    </div>
                  ) : (
                    <SummaryViewer
                      summaryData={generatedResult.formats.reports.data}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Infographic Modal - Interactive BentoInfographic with Image export */}
        {showInfographicModal &&
          generatedResult?.formats?.infographic?.data && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Infographic: {title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {infographicViewMode === "interactive"
                        ? "Interactive educational infographic"
                        : "Static image view"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setInfographicViewMode("interactive")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          infographicViewMode === "interactive"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 inline-block mr-1" />
                        Interactive
                      </button>
                      <button
                        onClick={handleSwitchToImageView}
                        disabled={isCapturingInfographic}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          infographicViewMode === "image"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {isCapturingInfographic ? (
                          <Loader2 className="w-4 h-4 inline-block mr-1 animate-spin" />
                        ) : (
                          <Image className="w-4 h-4 inline-block mr-1" />
                        )}
                        Image
                      </button>
                    </div>
                    <button
                      onClick={handleCloseInfographic}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
                  {infographicViewMode === "interactive" ? (
                    <div ref={infographicRef}>
                      <BentoInfographic
                        data={
                          generatedResult.formats.infographic.data.data_used ||
                          generatedResult.formats.infographic.data
                        }
                      />
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                      {isCapturingInfographic ? (
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
                          <p className="text-gray-600">Generating image...</p>
                        </div>
                      ) : infographicImageData ? (
                        <img
                          src={infographicImageData}
                          alt="Infographic"
                          className="max-w-full h-auto shadow-lg rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-gray-600">No image captured yet.</p>
                          <button
                            onClick={() => {
                              setInfographicViewMode("interactive");
                              setTimeout(() => handleCaptureInfographic(), 300);
                            }}
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
                          >
                            Generate Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {infographicViewMode === "image" && infographicImageData && (
                  <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                    <button
                      onClick={handleDownloadInfographic}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Audio Modal */}
        {showAudioModal &&
          !isAudioMinimized &&
          generatedResult?.formats?.audio?.url && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Podcast Audio: {title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Two-speaker podcast conversation
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMinimizeAudio}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Minimize"
                    >
                      <Minimize2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {generatedResult.formats.audio.error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {generatedResult.formats.audio.error}
                    </div>
                  ) : (
                    <AudioPlayer
                      audioUrl={generatedResult.formats.audio.url}
                      title={title}
                      duration={generatedResult.formats.audio.duration}
                      hostVoiceId={generatedResult.formats.audio.host_voice_id}
                      guestVoiceId={
                        generatedResult.formats.audio.guest_voice_id
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Upload Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Upload & Transform
              </h1>
              <p className="text-gray-600">
                Upload your document and select the formats you want to generate
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: File Upload Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. Choose File
                </h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    file
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <>
                      <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700 font-semibold text-sm">
                        {file.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setTitle("");
                        }}
                        className="text-xs text-green-600 hover:text-green-700 mt-2 underline"
                      >
                        Change file
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-900 font-medium text-sm">
                        Drop file here
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        or click to browse
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        PDF, DOCX (max 10MB)
                      </p>
                    </>
                  )}
                </div>

                {file && (
                  <div className="mt-4">
                    <label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      2. Name Your Content
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Biology Chapter 3"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Format Selection Card */}
            {file && title && (
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    3. Select Formats
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <FormatSelectionCard
                        title="Visual Learning"
                        description="Mind maps & diagrams"
                        icon={Brain}
                        color="purple"
                        onClick={() => handleFormatClick("visual")}
                        isRecommended={isRecommended("visual")}
                        isSelected={showVisualSubOptions}
                      />

                      {/*Visual Sub-Options*/}
                      {showVisualSubOptions && (
                        <div className="mt-2 space-y-2 animate-fade-in">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 pl-4">
                            Visual Types
                          </p>
                          <SubOptionCard
                            title="Mind Map"
                            icon={BookText}
                            onClick={() => handleSubOptionClick("mindmap")}
                            isSelected={selectedFormats.visual.mindmap}
                          />
                          <SubOptionCard
                            title="Chart"
                            icon={BarChart2}
                            onClick={() => handleSubOptionClick("chart")}
                            isSelected={selectedFormats.visual.chart}
                            isComingSoon={true}
                          />
                          <SubOptionCard
                            title="Diagram"
                            icon={Image}
                            onClick={() => handleSubOptionClick("diagram")}
                            isSelected={selectedFormats.visual.diagram}
                            isComingSoon={true}
                          />
                          <SubOptionCard
                            title="Infographic"
                            icon={Sparkles}
                            onClick={() => handleSubOptionClick("infographic")}
                            isSelected={selectedFormats.visual.infographic}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <FormatSelectionCard
                        title="Quiz"
                        description="Practice questions"
                        icon={FileQuestion}
                        color="cyan"
                        onClick={() => handleFormatClick("quiz")}
                        isRecommended={isRecommended("quiz")}
                        isSelected={selectedFormats.quiz}
                      />

                      {/* Quiz Options */}
                      {showQuizOptions && selectedFormats.quiz && (
                        <div className="mt-2 p-3 bg-cyan-50 border border-cyan-200 rounded-lg animate-fade-in">
                          <label
                            htmlFor="numQuestions"
                            className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2 block"
                          >
                            Number of Questions
                          </label>
                          <select
                            id="numQuestions"
                            value={numQuestions}
                            onChange={(e) =>
                              setNumQuestions(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-white border border-cyan-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          >
                            <option value={3}>3 questions</option>
                            <option value={5}>5 questions</option>
                            <option value={7}>7 questions</option>
                            <option value={10}>10 questions</option>
                            <option value={15}>15 questions</option>
                            <option value={20}>20 questions</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <FormatSelectionCard
                        title="Podcast Audio"
                        description="Listen to your notes"
                        icon={Headphones}
                        color="blue"
                        onClick={() => handleFormatClick("audio")}
                        isRecommended={isRecommended("audio")}
                        isSelected={selectedFormats.audio}
                      />

                      {/* Audio Options - Voice Selection */}
                      {showAudioOptions && selectedFormats.audio && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                          <p className="text-xs text-gray-600 mb-3">
                            Select voices for podcast hosts
                          </p>

                          <label
                            htmlFor="hostVoice"
                            className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2 block"
                          >
                            Host Voice
                          </label>
                          <select
                            id="hostVoice"
                            value={hostVoiceId}
                            onChange={(e) => setHostVoiceId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                          >
                            <option value="">Default Voice</option>
                            <option value="l30f87tf05uxyknGdDw6">
                              Alistair - British (Male)
                            </option>
                            <option value="QqLi9iPR1Lu3I40qrGjU">
                              Adene - British (Female)
                            </option>
                            <option value="gad8DmXGyu7hwftX9JqI">
                              Lohi - Indian (Male)
                            </option>
                            <option value="IKuPqyuiEnnZFcU4OVzH">
                              Abby - American (Female)
                            </option>
                          </select>

                          <label
                            htmlFor="guestVoice"
                            className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2 block"
                          >
                            Guest Voice
                          </label>
                          <select
                            id="guestVoice"
                            value={guestVoiceId}
                            onChange={(e) => setGuestVoiceId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Default Voice</option>
                            <option value="l30f87tf05uxyknGdDw6">
                              Alistair - British (Male)
                            </option>
                            <option value="QqLi9iPR1Lu3I40qrGjU">
                              Adene - British (Female)
                            </option>
                            <option value="gad8DmXGyu7hwftX9JqI">
                              Lohi - Indian (Male)
                            </option>
                            <option value="IKuPqyuiEnnZFcU4OVzH">
                              Abby - American (Female)
                            </option>
                          </select>
                        </div>
                      )}
                    </div>

                    <FormatSelectionCard
                      title="Reports"
                      description="Detailed summaries"
                      icon={FileText}
                      color="emerald"
                      onClick={() => handleFormatClick("reports")}
                      isRecommended={isRecommended("reports")}
                      isSelected={selectedFormats.reports}
                    />

                    <FormatSelectionCard
                      title="Flashcards"
                      description="Study cards"
                      icon={Layers}
                      color="amber"
                      onClick={() => handleFormatClick("flashcards")}
                      isRecommended={isRecommended("flashcards")}
                      isSelected={selectedFormats.flashcards}
                      isComingSoon={true}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading || !isAnyFormatSelected()}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                  >
                    {loading ? (
                      <span className="flex flex-col items-center justify-center">
                        <span className="flex items-center justify-center mb-1">
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Generating content...
                        </span>
                        {selectedFormats.audio && (
                          <span className="text-xs opacity-90 mt-1">
                            Audio generation may take 1-3 minutes, please
                            wait...
                          </span>
                        )}
                      </span>
                    ) : (
                      "Generate Content"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Column 3: Generated Content */}
            <div className="lg:col-span-1">
              {generatedResult && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generated Content
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Minimized Mind Map Card */}
                    {generatedResult?.formats?.visual?.data && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Brain className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Mind Map
                              </h4>
                              <p className="text-xs text-gray-600">{title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleMaximizeMindMap}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              aria-label="Maximize"
                            >
                              <Maximize2 className="w-4 h-4 text-purple-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quiz Card */}
                    {generatedResult?.formats?.quiz?.data && (
                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                              <FileQuestion className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Quiz
                              </h4>
                              <p className="text-xs text-gray-600">
                                {generatedResult.formats.quiz.data.questions
                                  ?.length || 0}{" "}
                                questions
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleMaximizeQuiz}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              aria-label="Maximize"
                            >
                              <Maximize2 className="w-4 h-4 text-cyan-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Audio Card */}
                    {generatedResult?.formats?.audio && (
                      <div
                        className={`bg-gradient-to-br ${
                          generatedResult.formats.audio.error
                            ? "from-red-50 to-red-100 border-red-200"
                            : "from-blue-50 to-blue-100 border-blue-200"
                        } border-2 rounded-lg p-4 animate-fade-in`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 ${
                                generatedResult.formats.audio.error
                                  ? "bg-red-100"
                                  : "bg-blue-100"
                              } rounded-lg flex items-center justify-center`}
                            >
                              <Headphones
                                className={`w-5 h-5 ${
                                  generatedResult.formats.audio.error
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Podcast Audio
                              </h4>
                              <p className="text-xs text-gray-600">
                                {generatedResult.formats.audio.error
                                  ? "Error generating audio"
                                  : generatedResult.formats.audio.duration ||
                                    "Ready to play"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {generatedResult.formats.audio.url && (
                              <button
                                onClick={() => setShowAudioModal(true)}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                aria-label="Play"
                              >
                                <Maximize2 className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                          </div>
                        </div>
                        {generatedResult.formats.audio.error && (
                          <p className="mt-2 text-xs text-red-600">
                            {generatedResult.formats.audio.error}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reports Card */}
                    {generatedResult?.formats?.reports?.data && (
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Summary
                              </h4>
                              <p className="text-xs text-gray-600">
                                {generatedResult.formats.reports.data.title ||
                                  "Report available"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleMaximizeSummary}
                              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              aria-label="View"
                            >
                              <Maximize2 className="w-4 h-4 text-emerald-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Infographic Card */}
                    {generatedResult?.formats?.infographic?.data && (
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-lg p-4 animate-fade-in">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-pink-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  Infographic
                                </h4>
                                <p className="text-xs text-gray-600">
                                  Interactive visual summary
                                </p>
                              </div>
                            </div>
                            <Maximize2 className="w-4 h-4 text-pink-600" />
                          </div>

                          {/* Preview placeholder with title */}
                          <div
                            className="mt-2 group relative cursor-pointer bg-gradient-to-br from-pink-100 to-pink-200 rounded-md h-32 flex items-center justify-center border border-pink-200 hover:border-pink-300 transition-all"
                            onClick={handleMaximizeInfographic}
                          >
                            <div className="text-center p-4">
                              <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                              <p className="text-pink-700 font-medium text-sm">
                                {generatedResult.formats.infographic.data.title || "Infographic Ready"}
                              </p>
                              <p className="text-pink-500 text-xs mt-1">Click to view</p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-md">
                              <Maximize2 className="w-8 h-8 text-pink-600 drop-shadow-md" />
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleMaximizeInfographic}
                              className="flex-1 px-3 py-2 bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-medium rounded transition-colors"
                            >
                              View Interactive
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generated Content Section */}
        {generatedResult && false && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Generated Content
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Minimized Mind Map Card */}
              {generatedResult?.formats?.visual?.data && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Mind Map
                        </h4>
                        <p className="text-xs text-gray-600">{title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleMaximizeMindMap}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        aria-label="Maximize"
                      >
                        <Maximize2 className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Card */}
              {generatedResult?.formats?.quiz?.data && (
                <div
                  onClick={() => setShowQuizModal(true)}
                  className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-lg p-4 animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <FileQuestion className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Quiz
                        </h4>
                        <p className="text-xs text-gray-600">
                          {generatedResult.formats.quiz.data.questions.length}{" "}
                          questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Card Components
const FormatSelectionCard = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  isSelected,
  isRecommended,
  isComingSoon,
}) => {
  // Map colors to proper Tailwind classes
  const colorClasses = {
    purple: {
      border: "border-purple-400",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
    },
    cyan: {
      border: "border-cyan-400",
      bg: "bg-cyan-50",
      iconBg: "bg-cyan-100",
      iconText: "text-cyan-600",
    },
    blue: {
      border: "border-blue-400",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    emerald: {
      border: "border-emerald-400",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
    },
    amber: {
      border: "border-amber-400",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
    },
  };

  const colors = colorClasses[color] || colorClasses.purple;

  return (
    <button
      onClick={onClick}
      className={`w-full relative p-4 rounded-lg border text-left transition-all ${
        isSelected
          ? `${colors.border} ${colors.bg}`
          : "border-gray-200 hover:border-gray-300 bg-white"
      } ${isComingSoon ? "opacity-70" : ""}`}
    >
      {isRecommended && (
        <span className="absolute -top-2 -right-2 flex items-center px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
          <Sparkles className="w-3 h-3 mr-1" />
          Recommended
        </span>
      )}
      {isComingSoon && !isSelected && (
        <span className="absolute top-2 right-2 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
          Soon
        </span>
      )}

      <div className="flex items-center">
        <div
          className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center mr-3`}
        >
          <Icon className={`w-5 h-5 ${colors.iconText}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isSelected ? "rotate-90" : ""
          }`}
        />
      </div>
    </button>
  );
};

const SubOptionCard = ({
  title,
  icon: Icon,
  onClick,
  isSelected,
  isComingSoon,
}) => (
  <button
    onClick={onClick}
    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center ${
      isSelected
        ? "bg-purple-50 border border-purple-200"
        : "hover:bg-gray-50 border border-transparent"
    } ${isComingSoon ? "opacity-60" : ""}`}
  >
    <Icon className="w-4 h-4 text-purple-600 mr-3" />
    <span className="flex-1 font-medium text-gray-800 text-sm">{title}</span>
    {isComingSoon && (
      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
        Soon
      </span>
    )}
    {!isComingSoon && (
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border ${
          isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300"
        }`}
      >
        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    )}
  </button>
);
