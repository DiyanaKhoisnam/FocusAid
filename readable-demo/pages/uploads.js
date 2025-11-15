import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function Uploads() {
  const router = useRouter();
  const { profile } = router.query; // Get profile from query parameter
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    summary: false,
    highlight: false,
    textToAudio: false,
    simplify: false,
  });
  
  // Initialize accessibility settings based on profile
  const getInitialSettings = () => {
    if (profile === "dyslexia") {
      return {
        spacing: 2.5,
        font: "open-dyslexic",
        colorTheme: "high-contrast",
      };
    } else if (profile === "adhd") {
      return {
        spacing: 2,
        font: "arial",
        colorTheme: "default",
      };
    }
    return {
      spacing: 1,
      font: "default",
      colorTheme: "default",
    };
  };
  
  const [accessibilitySettings, setAccessibilitySettings] = useState(getInitialSettings());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const sliderRef = useRef(null);
  const [documentText, setDocumentText] = useState(null); // Store full document text for real-time preview
  
  // Quiz generation state
  const [quizOptions, setQuizOptions] = useState({
    mcq: false,
    true_false: false,
    short_answer: false,
  });
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  
  // Profile selection - set based on query parameter
  const [selectedProfile, setSelectedProfile] = useState(profile || "none"); // "none", "dyslexia", "adhd"
  
  // Settings dropdown state
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const settingsDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setSettingsDropdownOpen(false);
      }
    };

    if (settingsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsDropdownOpen]);

  // Update settings when profile changes
  useEffect(() => {
    if (profile) {
      setSelectedProfile(profile);
      const newSettings = getInitialSettings();
      setAccessibilitySettings(newSettings);
    }
  }, [profile]);

  // Update slider background when spacing changes
  useEffect(() => {
    if (sliderRef.current) {
      const progress = ((accessibilitySettings.spacing - 1) / 4) * 100;
      sliderRef.current.style.background = `linear-gradient(to right, #F97316 0%, #F97316 ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`;
    }
  }, [accessibilitySettings.spacing]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    // Validate file type
    const fileExt = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'txt'].includes(fileExt)) {
      alert("Please select a PDF or TXT file");
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    
    // Create preview immediately
    if (file.type === "application/pdf" || fileExt === "pdf") {
      setFilePreview({
        type: "pdf",
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      });
    } else if (file.type.startsWith("text/") || fileExt === "txt") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          type: "text",
          name: file.name,
          content: e.target.result.substring(0, 500),
          size: (file.size / 1024).toFixed(2) + " KB",
        });
      };
      reader.onerror = () => {
        setFilePreview({
          type: "text",
          name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB",
        });
      };
      reader.readAsText(file);
    } else {
      setFilePreview({
        type: "other",
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      });
    }

    // Upload file to backend
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file to backend...");
      const response = await fetch("http://localhost:8000/documents/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to upload file";
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      setDocumentId(data.document_id);
      if (data.text_preview) {
        setFilePreview((prev) => ({
          ...prev,
          content: data.text_preview,
        }));
        // Store full text preview for real-time filtering
        setDocumentText(data.text_preview);
      }
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to upload file: ${error.message}\n\nMake sure the backend server is running on http://localhost:8000`);
      setSelectedFile(null);
      setFilePreview(null);
      setDocumentId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleProcess = async () => {
    if (!selectedFile || !documentId) {
      alert("Please select and upload a file first");
      return;
    }

    const hasAnyOption = Object.values(selectedOptions).some((v) => v);
    if (!hasAnyOption) {
      alert("Please select at least one processing option");
      return;
    }

    setIsProcessing(true);
    setProcessingResult(null);

    try {
      console.log("Processing document:", {
        document_id: documentId,
        options: selectedOptions,
        accessibility_settings: accessibilitySettings,
      });

      const response = await fetch("http://localhost:8000/documents/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentId,
          options: selectedOptions,
          accessibility_settings: accessibilitySettings,
        }),
      });

      console.log("Processing response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to process document";
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
          console.error("Processing error response:", error);
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Processing result:", result);
      setProcessingResult(result);
      
      // Update document text with processed text if available
      if (result.processed_text) {
        setDocumentText(result.processed_text);
      } else if (result.simplified_text) {
        setDocumentText(result.simplified_text);
      } else if (result.highlighted_text) {
        setDocumentText(result.highlighted_text);
      }
      
      // Show success message
      alert("Document processed successfully!");
    } catch (error) {
      console.error("Processing error:", error);
      alert(`Failed to process document: ${error.message}\n\nCheck the browser console for more details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setDocumentId(null);
    setDocumentText(null);
    setProcessingResult(null);
    setQuizResult(null);
    setSelectedOptions({
      summary: false,
      highlight: false,
      textToAudio: false,
      simplify: false,
    });
    setQuizOptions({
      mcq: false,
      true_false: false,
      short_answer: false,
    });
  };

  // Profile presets
  const applyProfile = (profile) => {
    setSelectedProfile(profile);
    if (profile === "dyslexia") {
      setAccessibilitySettings({
        spacing: 2.5,
        font: "open-dyslexic",
        colorTheme: "high-contrast",
      });
    } else if (profile === "adhd") {
      setAccessibilitySettings({
        spacing: 2,
        font: "arial",
        colorTheme: "default",
      });
    } else {
      setAccessibilitySettings({
        spacing: 1,
        font: "default",
        colorTheme: "default",
      });
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!documentId) {
      alert("Please upload a document first");
      return;
    }

    if (!quizOptions.mcq && !quizOptions.true_false && !quizOptions.short_answer) {
      alert("Please select at least one question type");
      return;
    }

    setIsGeneratingQuiz(true);
    setQuizResult(null);

    try {
      const response = await fetch("http://localhost:8000/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentId,
          question_types: quizOptions,
          num_questions: numQuestions,
          difficulty: "medium",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate quiz");
      }

      const data = await response.json();
      setQuizResult(data);
      alert("Quiz generated successfully!");
    } catch (error) {
      console.error("Quiz generation error:", error);
      alert(`Failed to generate quiz: ${error.message}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        {/* Profile-specific header */}
        {selectedProfile !== "none" && (
          <div style={{
            marginBottom: "32px",
            padding: "20px",
            borderRadius: "16px",
            background: selectedProfile === "dyslexia" 
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
            border: `3px solid ${selectedProfile === "dyslexia" ? "#8B5CF6" : "#10B981"}`,
            textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
              {selectedProfile === "dyslexia" ? "📖" : "🎯"}
            </div>
            <h2 style={{ 
              fontSize: "28px", 
              fontWeight: 700, 
              marginBottom: "8px",
              color: selectedProfile === "dyslexia" ? "#8B5CF6" : "#10B981"
            }}>
              {selectedProfile === "dyslexia" ? "Dyslexia-Optimized Upload" : "ADHD-Optimized Upload"}
            </h2>
            <p style={{ fontSize: "16px", color: "var(--muted)" }}>
              {selectedProfile === "dyslexia" 
                ? "Your document will be automatically configured with dyslexia-friendly settings: 2.5x spacing, OpenDyslexic font, and high contrast theme."
                : "Your document will be automatically configured with ADHD-friendly settings: 2x spacing, Arial font, and default theme."}
            </p>
          </div>
        )}
        
        <h1 className="h1" style={{ fontSize: "48px", marginBottom: "12px" }}>
          Upload Document
        </h1>
        <p className="lead" style={{ fontSize: "18px", marginBottom: "40px" }}>
          {selectedProfile !== "none" 
            ? "Upload your document and we'll process it with your profile's optimized settings."
            : "Upload your document and choose from various processing options to make it more accessible."}
        </p>

        {/* File Upload Section */}
        <div className="card" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
            Select File
          </h2>
          
          {!selectedFile ? (
            <div
              style={{
                border: "2px dashed var(--orange)",
                borderRadius: "16px",
                padding: "60px 20px",
                textAlign: "center",
                background: "rgba(249, 115, 22, 0.05)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.background = "rgba(249, 115, 22, 0.1)";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.background = "rgba(249, 115, 22, 0.05)";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.background = "rgba(249, 115, 22, 0.05)";
                const file = e.dataTransfer.files[0];
                if (file) {
                  // Create a synthetic event object
                  const syntheticEvent = {
                    target: {
                      files: [file]
                    }
                  };
                  handleFileChange(syntheticEvent);
                }
              }}
              onClick={() => document.getElementById("file-input").click()}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
              <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>
                Click to upload or drag and drop
              </div>
              <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                PDF and TXT files supported
              </div>
              {isProcessing && (
                <div style={{ marginTop: "12px", fontSize: "14px", color: "var(--orange)", fontWeight: 600 }}>
                  Uploading...
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                style={{ display: "none" }}
                onChange={handleFileChange}
                onClick={(e) => {
                  // Reset value to allow selecting the same file again
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            <div
              style={{
                border: "2px solid var(--orange)",
                borderRadius: "16px",
                padding: "24px",
                background: "rgba(249, 115, 22, 0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
                    {filePreview.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                    {filePreview.size}
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#EF4444",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
              {filePreview.type === "text" && filePreview.content && (
                <div
                  style={{
                    background: "#FFFFFF",
                    padding: "16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "var(--text)",
                    maxHeight: "200px",
                    overflow: "auto",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {filePreview.content}...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Document Preview with Processing Options - Show after upload */}
        {documentId && documentText && (
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
              {/* Left Side - Processing Options */}
              <div className="card" style={{ 
                width: "300px", 
                flexShrink: 0,
                position: "sticky",
                top: "20px",
                maxHeight: "80vh",
                overflowY: "auto"
              }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
                  Processing Options
                </h2>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
                  Select options to process your document:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Summary Option */}
                  <div
                    onClick={() => toggleOption("summary")}
                    style={{
                      border: `2px solid ${selectedOptions.summary ? "var(--purple)" : "rgba(0, 0, 0, 0.1)"}`,
                      borderRadius: "12px",
                      padding: "16px",
                      background: selectedOptions.summary ? "rgba(167, 139, 250, 0.1)" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>📝</div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", color: "var(--text)" }}>
                      Summary
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
                      Generate a concise summary
                    </p>
                  </div>

                  {/* Highlight Option */}
                  <div
                    onClick={() => toggleOption("highlight")}
                    style={{
                      border: `2px solid ${selectedOptions.highlight ? "var(--yellow)" : "rgba(0, 0, 0, 0.1)"}`,
                      borderRadius: "12px",
                      padding: "16px",
                      background: selectedOptions.highlight ? "rgba(252, 211, 77, 0.1)" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>✨</div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", color: "var(--text)" }}>
                      Highlight
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
                      Highlight important keywords
                    </p>
                  </div>

                  {/* Text to Audio Option */}
                  <div
                    onClick={() => toggleOption("textToAudio")}
                    style={{
                      border: `2px solid ${selectedOptions.textToAudio ? "var(--blue)" : "rgba(0, 0, 0, 0.1)"}`,
                      borderRadius: "12px",
                      padding: "16px",
                      background: selectedOptions.textToAudio ? "rgba(59, 130, 246, 0.1)" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔊</div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", color: "var(--text)" }}>
                      Text to Audio
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
                      Convert text to speech
                    </p>
                  </div>

                  {/* Simplify Option */}
                  <div
                    onClick={() => toggleOption("simplify")}
                    style={{
                      border: `2px solid ${selectedOptions.simplify ? "var(--orange)" : "rgba(0, 0, 0, 0.1)"}`,
                      borderRadius: "12px",
                      padding: "16px",
                      background: selectedOptions.simplify ? "rgba(249, 115, 22, 0.1)" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔧</div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px", color: "var(--text)" }}>
                      Simplify
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
                      Simplify complex text
                    </p>
                  </div>
                </div>

                {/* Process Button */}
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !selectedFile || !documentId}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: isProcessing || !selectedFile || !documentId
                      ? "rgba(0, 0, 0, 0.3)"
                      : "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: isProcessing || !selectedFile || !documentId ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {isProcessing ? "Processing..." : "Process Document"}
                </button>
              </div>

              {/* Right Side - Large Document Preview with Settings Dropdown */}
              <div className="card" style={{ flex: 1, minWidth: 0 }}>
                {/* Settings Dropdown at Top */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: "20px",
                  position: "relative"
                }}>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text)" }}>
                    📄 Document Preview
                  </h2>
                  <div style={{ position: "relative" }} ref={settingsDropdownRef}>
                    <button
                      onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "10px",
                        border: "2px solid rgba(139, 92, 246, 0.3)",
                        background: settingsDropdownOpen 
                          ? "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"
                          : "#FFFFFF",
                        color: settingsDropdownOpen ? "#FFFFFF" : "var(--text)",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <span>⚙️</span>
                      <span>Settings</span>
                      <span>{settingsDropdownOpen ? "▲" : "▼"}</span>
                    </button>

                    {/* Dropdown Content */}
                    {settingsDropdownOpen && (
                      <div style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "8px",
                        width: "320px",
                        background: "#FFFFFF",
                        borderRadius: "12px",
                        border: "2px solid rgba(0, 0, 0, 0.1)",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                        zIndex: 1000,
                        padding: "20px",
                        maxHeight: "70vh",
                        overflowY: "auto"
                      }}>
                        {/* Letter Spacing */}
                        <div style={{ marginBottom: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", display: "block" }}>
                              Letter Spacing
                            </label>
                            <div style={{
                              background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#FFFFFF",
                              minWidth: "50px",
                              textAlign: "center"
                            }}>
                              {accessibilitySettings.spacing}x
                            </div>
                          </div>
                          <div style={{
                            background: "#F9FAFB",
                            padding: "16px",
                            borderRadius: "12px",
                            border: "2px solid rgba(249, 115, 22, 0.2)"
                          }}>
                            <style dangerouslySetInnerHTML={{__html: `
                              .spacing-slider {
                                -webkit-appearance: none;
                                appearance: none;
                                width: 100%;
                                height: 8px;
                                border-radius: 4px;
                                outline: none;
                                cursor: pointer;
                              }
                              .spacing-slider::-webkit-slider-thumb {
                                -webkit-appearance: none;
                                appearance: none;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                                cursor: pointer;
                                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
                                border: 3px solid #FFFFFF;
                                transition: all 0.2s;
                              }
                              .spacing-slider::-webkit-slider-thumb:hover {
                                transform: scale(1.1);
                                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);
                              }
                              .spacing-slider::-moz-range-thumb {
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                                cursor: pointer;
                                box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
                                border: 3px solid #FFFFFF;
                                transition: all 0.2s;
                              }
                              .spacing-slider::-moz-range-thumb:hover {
                                transform: scale(1.1);
                                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);
                              }
                              .spacing-slider::-moz-range-track {
                                width: 100%;
                                height: 8px;
                                border-radius: 4px;
                              }
                            `}} />
                            <input
                              ref={sliderRef}
                              className="spacing-slider"
                              type="range"
                              min="1"
                              max="5"
                              step="0.5"
                              value={accessibilitySettings.spacing}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setAccessibilitySettings({
                                  ...accessibilitySettings,
                                  spacing: value
                                });
                              }}
                              style={{
                                background: `linear-gradient(to right, #F97316 0%, #F97316 ${((accessibilitySettings.spacing - 1) / 4) * 100}%, #E5E7EB ${((accessibilitySettings.spacing - 1) / 4) * 100}%, #E5E7EB 100%)`
                              }}
                            />
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginTop: "8px",
                              fontSize: "11px",
                              color: "var(--muted)",
                              fontWeight: 600
                            }}>
                              <span>Normal</span>
                              <span>Wide</span>
                              <span>Extra</span>
                            </div>
                          </div>
                        </div>

                        {/* Font Style */}
                        <div style={{ marginBottom: "20px" }}>
                          <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
                            Font Style
                          </label>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                              { value: "default", label: "Default" },
                              { value: "open-dyslexic", label: "Open Dyslexic" },
                              { value: "comic-sans", label: "Comic Sans" },
                              { value: "arial", label: "Arial" },
                            ].map((font) => (
                              <button
                                key={font.value}
                                onClick={() => setAccessibilitySettings({...accessibilitySettings, font: font.value})}
                                style={{
                                  padding: "10px 16px",
                                  borderRadius: "8px",
                                  border: `2px solid ${accessibilitySettings.font === font.value ? "var(--purple)" : "rgba(0, 0, 0, 0.1)"}`,
                                  background: accessibilitySettings.font === font.value 
                                    ? "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)" 
                                    : "#FFFFFF",
                                  color: accessibilitySettings.font === font.value ? "#FFFFFF" : "var(--text)",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  textAlign: "left",
                                  fontFamily: font.value === "comic-sans" ? "Comic Sans MS, cursive" : 
                                             font.value === "arial" ? "Arial, sans-serif" : "inherit",
                                }}
                              >
                                {font.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Theme */}
                        <div style={{ marginBottom: "20px" }}>
                          <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
                            Color Theme
                          </label>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                              { value: "default", label: "Default", bg: "#FFFFFF", text: "#1F2937" },
                              { value: "high-contrast", label: "High Contrast", bg: "#000000", text: "#FFFFFF" },
                              { value: "sepia", label: "Sepia", bg: "#F4E4BC", text: "#1F2937" },
                              { value: "dark", label: "Dark", bg: "#1F2937", text: "#FFFFFF" },
                            ].map((theme) => (
                              <button
                                key={theme.value}
                                onClick={() => setAccessibilitySettings({...accessibilitySettings, colorTheme: theme.value})}
                                style={{
                                  padding: "10px 16px",
                                  borderRadius: "8px",
                                  border: `2px solid ${accessibilitySettings.colorTheme === theme.value ? "var(--purple)" : "rgba(0, 0, 0, 0.1)"}`,
                                  background: accessibilitySettings.colorTheme === theme.value 
                                    ? "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)" 
                                    : "#FFFFFF",
                                  color: accessibilitySettings.colorTheme === theme.value ? "#FFFFFF" : "var(--text)",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  textAlign: "left",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px"
                                }}
                              >
                                <div style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "4px",
                                  background: theme.bg,
                                  border: `2px solid ${theme.text}`,
                                  flexShrink: 0
                                }} />
                                {theme.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Large Document Preview */}
                <div
                  style={{
                    padding: "40px",
                    background: selectedProfile === "dyslexia" 
                      ? (accessibilitySettings.colorTheme === "high-contrast" ? "#000000" : 
                         accessibilitySettings.colorTheme === "dark" ? "#1F2937" :
                         accessibilitySettings.colorTheme === "sepia" ? "#F4E4BC" : "#FFFFFF")
                      : selectedProfile === "adhd"
                      ? (accessibilitySettings.colorTheme === "dark" ? "#1F2937" :
                         accessibilitySettings.colorTheme === "sepia" ? "#F5F5F5" :
                         accessibilitySettings.colorTheme === "high-contrast" ? "#F9FAFB" : "#FFFFFF")
                      : (accessibilitySettings.colorTheme === "high-contrast" ? "#000000" : 
                         accessibilitySettings.colorTheme === "dark" ? "#1F2937" :
                         accessibilitySettings.colorTheme === "sepia" ? "#F4E4BC" : "#FFFFFF"),
                    borderRadius: "12px",
                    border: "2px solid rgba(0, 0, 0, 0.1)",
                    minHeight: "600px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    fontSize: selectedProfile === "dyslexia" ? "20px" : "18px",
                    lineHeight: selectedProfile === "dyslexia" ? "2.0" : "1.8",
                    color: (selectedProfile === "dyslexia" && accessibilitySettings.colorTheme === "high-contrast") || 
                           accessibilitySettings.colorTheme === "high-contrast" || 
                           accessibilitySettings.colorTheme === "dark"
                      ? "#FFFFFF"
                      : "#1F2937",
                    letterSpacing: `${(accessibilitySettings.spacing - 1) * 0.05}em`,
                    fontFamily: accessibilitySettings.font === "comic-sans" 
                      ? "Comic Sans MS, cursive" 
                      : accessibilitySettings.font === "arial" 
                      ? "Arial, sans-serif"
                      : accessibilitySettings.font === "open-dyslexic"
                      ? "OpenDyslexic, sans-serif"
                      : "inherit",
                    transition: "all 0.3s ease",
                  }}
                  dangerouslySetInnerHTML={{ __html: documentText }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Profile Selection - Only show if no profile in URL */}
        {!profile && (
          <div className="card" style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
              Personalized Profiles
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "24px" }}>
              Select a profile to automatically apply optimized accessibility settings:
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { value: "none", label: "Custom", icon: "⚙️", color: "#6B7280" },
                { value: "dyslexia", label: "Dyslexia", icon: "📖", color: "#8B5CF6" },
                { value: "adhd", label: "ADHD", icon: "🎯", color: "#10B981" },
              ].map((prof) => (
                <button
                  key={prof.value}
                  onClick={() => applyProfile(prof.value)}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "20px",
                    borderRadius: "12px",
                    border: `3px solid ${selectedProfile === prof.value ? prof.color : "rgba(0, 0, 0, 0.1)"}`,
                    background: selectedProfile === prof.value
                      ? `linear-gradient(135deg, ${prof.color} 0%, ${prof.color}CC 100%)`
                      : "#FFFFFF",
                    color: selectedProfile === prof.value ? "#FFFFFF" : "var(--text)",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProfile !== prof.value) {
                      e.currentTarget.style.borderColor = prof.color;
                      e.currentTarget.style.background = `${prof.color}15`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProfile !== prof.value) {
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.background = "#FFFFFF";
                    }
                  }}
                >
                  <span style={{ fontSize: "32px" }}>{prof.icon}</span>
                  <span>{prof.label}</span>
                  {selectedProfile === prof.value && (
                    <span style={{ fontSize: "12px", opacity: 0.9 }}>Active</span>
                  )}
                </button>
              ))}
            </div>
            {selectedProfile !== "none" && (
              <div style={{
                marginTop: "16px",
                padding: "12px",
                background: selectedProfile === "dyslexia" 
                  ? "rgba(139, 92, 246, 0.1)" 
                  : "rgba(16, 185, 129, 0.1)",
                borderRadius: "8px",
                fontSize: "14px",
                color: "var(--text)"
              }}>
                <strong>{selectedProfile === "dyslexia" ? "Dyslexia Profile:" : "ADHD Profile:"}</strong>{" "}
                {selectedProfile === "dyslexia" 
                  ? "Optimized spacing, dyslexia-friendly fonts, and high contrast for better readability."
                  : "Balanced spacing and clean fonts to help maintain focus and reduce distractions."}
              </div>
            )}
          </div>
        )}

        {/* Accessibility Filters - Only show if no document preview (old section) */}
        {!documentId && (
          <div className="card" style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
              Accessibility Settings
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "24px" }}>
              Customize text appearance for better readability (or use a profile above):
            </p>

          {/* Letter Spacing */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", display: "block" }}>
                Letter Spacing
              </label>
              <div style={{
                background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#FFFFFF",
                minWidth: "60px",
                textAlign: "center"
              }}>
                {accessibilitySettings.spacing}x
              </div>
            </div>
            <div style={{
              background: "#F9FAFB",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid rgba(249, 115, 22, 0.2)"
            }}>
              <style dangerouslySetInnerHTML={{__html: `
                .spacing-slider {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 100%;
                  height: 8px;
                  border-radius: 4px;
                  outline: none;
                  cursor: pointer;
                }
                .spacing-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
                  border: 3px solid #FFFFFF;
                  transition: all 0.2s;
                }
                .spacing-slider::-webkit-slider-thumb:hover {
                  transform: scale(1.1);
                  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);
                }
                .spacing-slider::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
                  border: 3px solid #FFFFFF;
                  transition: all 0.2s;
                }
                .spacing-slider::-moz-range-thumb:hover {
                  transform: scale(1.1);
                  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);
                }
                .spacing-slider::-moz-range-track {
                  width: 100%;
                  height: 8px;
                  border-radius: 4px;
                }
              `}} />
              <input
                ref={sliderRef}
                className="spacing-slider"
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={accessibilitySettings.spacing}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setAccessibilitySettings({
                    ...accessibilitySettings,
                    spacing: value
                  });
                }}
                style={{
                  background: `linear-gradient(to right, #F97316 0%, #F97316 ${((accessibilitySettings.spacing - 1) / 4) * 100}%, #E5E7EB ${((accessibilitySettings.spacing - 1) / 4) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                fontSize: "12px",
                color: "var(--muted)",
                fontWeight: 600
              }}>
                <span>Normal (1x)</span>
                <span>Wide (2x)</span>
                <span>Extra Wide (3x)</span>
                <span>Very Wide (4x)</span>
                <span>Maximum (5x)</span>
              </div>
            </div>
            <div style={{
              marginTop: "12px",
              padding: "12px",
              background: "rgba(249, 115, 22, 0.05)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "var(--muted)"
            }}>
              <strong>Current:</strong> {accessibilitySettings.spacing === 1 ? "Normal letter spacing" : 
                accessibilitySettings.spacing === 2 ? "Wide letter spacing" :
                accessibilitySettings.spacing === 3 ? "Extra wide letter spacing" :
                accessibilitySettings.spacing === 4 ? "Very wide letter spacing" :
                "Maximum letter spacing"} ({accessibilitySettings.spacing}x multiplier)
            </div>
          </div>

          {/* Dyslexia-Friendly Fonts */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
              Font Style
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { value: "default", label: "Default" },
                { value: "open-dyslexic", label: "Open Dyslexic" },
                { value: "comic-sans", label: "Comic Sans" },
                { value: "arial", label: "Arial" },
              ].map((font) => (
                <button
                  key={font.value}
                  onClick={() => setAccessibilitySettings({...accessibilitySettings, font: font.value})}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: `2px solid ${accessibilitySettings.font === font.value ? "var(--purple)" : "rgba(0, 0, 0, 0.1)"}`,
                    background: accessibilitySettings.font === font.value 
                      ? "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)" 
                      : "#FFFFFF",
                    color: accessibilitySettings.font === font.value ? "#FFFFFF" : "var(--text)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: font.value === "comic-sans" ? "Comic Sans MS, cursive" : 
                               font.value === "arial" ? "Arial, sans-serif" : "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (accessibilitySettings.font !== font.value) {
                      e.currentTarget.style.borderColor = "var(--purple)";
                      e.currentTarget.style.background = "rgba(167, 139, 250, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (accessibilitySettings.font !== font.value) {
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.background = "#FFFFFF";
                    }
                  }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
              Color Theme
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { value: "default", label: "Default", color: "#E0F2FE" },
                { value: "high-contrast", label: "High Contrast", color: "#000000" },
                { value: "sepia", label: "Sepia", color: "#F4E4BC" },
                { value: "dark", label: "Dark Mode", color: "#1F2937" },
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setAccessibilitySettings({...accessibilitySettings, colorTheme: theme.value})}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: `2px solid ${accessibilitySettings.colorTheme === theme.value ? "var(--blue)" : "rgba(0, 0, 0, 0.1)"}`,
                    background: accessibilitySettings.colorTheme === theme.value 
                      ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" 
                      : "#FFFFFF",
                    color: accessibilitySettings.colorTheme === theme.value ? "#FFFFFF" : "var(--text)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (accessibilitySettings.colorTheme !== theme.value) {
                      e.currentTarget.style.borderColor = "var(--blue)";
                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (accessibilitySettings.colorTheme !== theme.value) {
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.background = "#FFFFFF";
                    }
                  }}
                >
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: theme.color,
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }} />
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Processing Options - Only show if no document preview */}
        {!documentId && (
          <div className="card" style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
              Processing Options
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "24px" }}>
              Select one or more options to process your document:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {/* Summary Option */}
            <div
              onClick={() => toggleOption("summary")}
              style={{
                border: `2px solid ${selectedOptions.summary ? "var(--purple)" : "rgba(0, 0, 0, 0.1)"}`,
                borderRadius: "12px",
                padding: "20px",
                background: selectedOptions.summary ? "rgba(167, 139, 250, 0.1)" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!selectedOptions.summary) {
                  e.currentTarget.style.borderColor = "var(--purple)";
                  e.currentTarget.style.background = "rgba(167, 139, 250, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedOptions.summary) {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.background = "#FFFFFF";
                }
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📝</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
                Summary
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.5" }}>
                Generate a concise summary of the document's key points
              </p>
              {selectedOptions.summary && (
                <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--purple)", fontWeight: 600 }}>
                  ✓ Selected
                </div>
              )}
            </div>

            {/* Highlight Option */}
            <div
              onClick={() => toggleOption("highlight")}
              style={{
                border: `2px solid ${selectedOptions.highlight ? "var(--yellow)" : "rgba(0, 0, 0, 0.1)"}`,
                borderRadius: "12px",
                padding: "20px",
                background: selectedOptions.highlight ? "rgba(252, 211, 77, 0.1)" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!selectedOptions.highlight) {
                  e.currentTarget.style.borderColor = "var(--yellow)";
                  e.currentTarget.style.background = "rgba(252, 211, 77, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedOptions.highlight) {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.background = "#FFFFFF";
                }
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>✨</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
                Highlight
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.5" }}>
                Highlight important keywords and concepts in the document
              </p>
              {selectedOptions.highlight && (
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#F59E0B", fontWeight: 600 }}>
                  ✓ Selected
                </div>
              )}
            </div>

            {/* Text to Audio Option */}
            <div
              onClick={() => toggleOption("textToAudio")}
              style={{
                border: `2px solid ${selectedOptions.textToAudio ? "var(--blue)" : "rgba(0, 0, 0, 0.1)"}`,
                borderRadius: "12px",
                padding: "20px",
                background: selectedOptions.textToAudio ? "rgba(59, 130, 246, 0.1)" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!selectedOptions.textToAudio) {
                  e.currentTarget.style.borderColor = "var(--blue)";
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedOptions.textToAudio) {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.background = "#FFFFFF";
                }
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔊</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
                Text to Audio
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.5" }}>
                Convert the document text into audio narration
              </p>
              {selectedOptions.textToAudio && (
                <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--blue)", fontWeight: 600 }}>
                  ✓ Selected
                </div>
              )}
            </div>

            {/* Simplify Option */}
            <div
              onClick={() => toggleOption("simplify")}
              style={{
                border: `2px solid ${selectedOptions.simplify ? "var(--orange)" : "rgba(0, 0, 0, 0.1)"}`,
                borderRadius: "12px",
                padding: "20px",
                background: selectedOptions.simplify ? "rgba(249, 115, 22, 0.1)" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!selectedOptions.simplify) {
                  e.currentTarget.style.borderColor = "var(--orange)";
                  e.currentTarget.style.background = "rgba(249, 115, 22, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedOptions.simplify) {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.background = "#FFFFFF";
                }
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📖</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
                Simplify Text
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.5" }}>
                Simplify complex language for better readability
              </p>
              {selectedOptions.simplify && (
                <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--orange)", fontWeight: 600 }}>
                  ✓ Selected
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* AI Quiz Generator */}
        <div className="card" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
            🤖 AI Quiz Generator
          </h2>
          <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "24px" }}>
            Generate quiz questions from your document to test comprehension:
          </p>

          {/* Question Type Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
              Question Types
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { key: "mcq", label: "Multiple Choice", icon: "🔘", color: "#3B82F6" },
                { key: "true_false", label: "True/False", icon: "✅", color: "#10B981" },
                { key: "short_answer", label: "Short Answer", icon: "✍️", color: "#F59E0B" },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setQuizOptions({...quizOptions, [type.key]: !quizOptions[type.key]})}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: `2px solid ${quizOptions[type.key] ? type.color : "rgba(0, 0, 0, 0.1)"}`,
                    background: quizOptions[type.key]
                      ? `linear-gradient(135deg, ${type.color} 0%, ${type.color}CC 100%)`
                      : "#FFFFFF",
                    color: quizOptions[type.key] ? "#FFFFFF" : "var(--text)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (!quizOptions[type.key]) {
                      e.currentTarget.style.borderColor = type.color;
                      e.currentTarget.style.background = `${type.color}15`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!quizOptions[type.key]) {
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.background = "#FFFFFF";
                    }
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
              Number of Questions: {numQuestions}
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              style={{
                width: "100%",
                height: "8px",
                borderRadius: "4px",
                outline: "none",
                cursor: "pointer",
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((numQuestions - 3) / 12) * 100}%, #E5E7EB ${((numQuestions - 3) / 12) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              fontSize: "12px",
              color: "var(--muted)",
              fontWeight: 600
            }}>
              <span>3</span>
              <span>9</span>
              <span>15</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz || !documentId}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: isGeneratingQuiz || !documentId
                ? "rgba(139, 92, 246, 0.5)"
                : "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 700,
              cursor: isGeneratingQuiz || !documentId ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isGeneratingQuiz && documentId) {
                e.currentTarget.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isGeneratingQuiz && documentId) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {isGeneratingQuiz ? "⏳ Generating Quiz..." : "🚀 Generate Quiz"}
          </button>

          {/* Quiz Results */}
          {quizResult && quizResult.questions && (
            <div style={{
              marginTop: "24px",
              padding: "20px",
              background: "rgba(139, 92, 246, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(139, 92, 246, 0.2)"
            }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>
                Generated Quiz ({quizResult.total_questions} questions)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {quizResult.questions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      background: "#FFFFFF",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: "12px", marginBottom: "12px" }}>
                      <div style={{
                        minWidth: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "14px"
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: q.question_type === "mcq" ? "rgba(59, 130, 246, 0.1)" :
                                     q.question_type === "true_false" ? "rgba(16, 185, 129, 0.1)" :
                                     "rgba(245, 158, 11, 0.1)",
                          color: q.question_type === "mcq" ? "#3B82F6" :
                                 q.question_type === "true_false" ? "#10B981" :
                                 "#F59E0B",
                          fontSize: "11px",
                          fontWeight: 700,
                          marginBottom: "8px",
                          textTransform: "uppercase"
                        }}>
                          {q.question_type === "mcq" ? "Multiple Choice" :
                           q.question_type === "true_false" ? "True/False" :
                           "Short Answer"}
                        </div>
                        <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "12px" }}>
                          {q.question}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: "6px",
                                  background: opt === q.correct_answer || (q.question_type === "mcq" && String.fromCharCode(65 + optIdx) === q.correct_answer)
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : "#F9FAFB",
                                  border: opt === q.correct_answer || (q.question_type === "mcq" && String.fromCharCode(65 + optIdx) === q.correct_answer)
                                    ? "2px solid #10B981"
                                    : "1px solid rgba(0, 0, 0, 0.1)",
                                  fontSize: "14px",
                                  color: "var(--text)"
                                }}
                              >
                                {q.question_type === "mcq" && <strong>{String.fromCharCode(65 + optIdx)}. </strong>}
                                {opt}
                                {((q.question_type === "mcq" && String.fromCharCode(65 + optIdx) === q.correct_answer) || opt === q.correct_answer) && (
                                  <span style={{ marginLeft: "8px", color: "#10B981", fontWeight: 700 }}>✓ Correct</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.explanation && (
                          <div style={{
                            padding: "10px",
                            background: "rgba(139, 92, 246, 0.05)",
                            borderRadius: "6px",
                            fontSize: "13px",
                            color: "var(--muted)",
                            fontStyle: "italic"
                          }}>
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Process Button - Only show if no document preview */}
        {!documentId && (
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "32px" }}>
            <button
              onClick={handleProcess}
              disabled={isProcessing || !selectedFile || !documentId}
              className="btn primary"
              style={{
                padding: "16px 48px",
                fontSize: "18px",
                fontWeight: 700,
                opacity: isProcessing || !selectedFile || !documentId ? 0.6 : 1,
                cursor: isProcessing || !selectedFile || !documentId ? "not-allowed" : "pointer",
              }}
            >
              {isProcessing ? "Processing..." : "Process Document"}
            </button>
          </div>
        )}

        {/* Results Display */}
        {processingResult && (
          <div className="card" style={{ marginTop: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
              Processing Results
            </h2>

            {/* Summary */}
            {processingResult.summary && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "var(--text)" }}>
                  📝 Summary
                </h3>
                <div
                  style={{
                    padding: "16px",
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: "var(--text)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {processingResult.summary}
                </div>
              </div>
            )}

            {/* Processed Text */}
            {processingResult.processed_text && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "var(--text)" }}>
                  📖 Processed Text
                </h3>
                <div
                  style={{
                    padding: "16px",
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: "var(--text)",
                    whiteSpace: "pre-wrap",
                    maxHeight: "400px",
                    overflowY: "auto",
                    wordSpacing: `${accessibilitySettings.spacing * 0.1}em`,
                    fontFamily: accessibilitySettings.font === "comic-sans" ? "Comic Sans MS, cursive" :
                               accessibilitySettings.font === "arial" ? "Arial, sans-serif" :
                               accessibilitySettings.font === "open-dyslexic" ? "OpenDyslexic, sans-serif" : "inherit",
                  }}
                  dangerouslySetInnerHTML={{ __html: processingResult.highlighted_text || processingResult.processed_text }}
                />
              </div>
            )}

            {/* Audio Player */}
            {processingResult.audio_url && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "var(--text)" }}>
                  🔊 Audio Narration
                </h3>
                <audio
                  controls
                  src={processingResult.audio_url}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Simplified Text */}
            {processingResult.simplified_text && !processingResult.processed_text && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "var(--text)" }}>
                  ✨ Simplified Text
                </h3>
                <div
                  style={{
                    padding: "16px",
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: "var(--text)",
                    whiteSpace: "pre-wrap",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  {processingResult.simplified_text}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

