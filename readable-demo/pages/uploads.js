import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { API_BASE_URL } from "../lib/api";

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
  // User answers state - track answers for each question
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: answer }
  const [showAnswers, setShowAnswers] = useState({}); // { questionIndex: true/false } - whether to show answer for this question
  const [quizSubmitted, setQuizSubmitted] = useState(false); // Whether user has submitted the entire quiz
  
  // Profile selection - set based on query parameter
  const [selectedProfile, setSelectedProfile] = useState(profile || "none"); // "none", "dyslexia", "adhd"
  
  // Settings dropdown state
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const settingsDropdownRef = useRef(null);
  
  // Processing options toolbar state
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const toolbarRef = useRef(null);
  
  // Background and text color states
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#1F2937");
  
  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  // Highlight tool state
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [highlightedSelections, setHighlightedSelections] = useState([]); // Array of {text, start, end}
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);
  
  // Function to extract plain text from HTML
  const extractPlainText = (htmlText) => {
    if (!htmlText) return "";
    if (typeof document === 'undefined') return htmlText;
    
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;
      return tempDiv.textContent || tempDiv.innerText || htmlText;
    } catch (e) {
      return htmlText.replace(/<[^>]*>/g, ''); // Fallback: remove HTML tags
    }
  };
  
  // Function to handle text-to-speech
  const handleTextToSpeech = () => {
    if (!speechSynthesis || !documentText) return;
    
    if (isSpeaking) {
      // Stop speaking
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Start speaking
      const plainText = extractPlainText(documentText);
      
      if (!plainText || plainText.trim().length === 0) {
        alert("No text available to read aloud.");
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = 'en-US';
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        alert('Error reading text aloud. Please try again.');
      };
      
      speechSynthesis.speak(utterance);
    }
  };
  
  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis]);
  
  // Function to handle text selection and highlighting
  const handleTextSelection = () => {
    if (!isHighlightMode || !documentText) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return; // Minimum 2 characters
    
    // Get the full plain text content
    const fullText = extractPlainText(documentText);
    const selectedTextLower = selectedText.toLowerCase();
    
    // Find all occurrences of the selected text in the document (case-insensitive)
    const occurrences = [];
    let searchIndex = 0;
    while (searchIndex < fullText.length) {
      const index = fullText.toLowerCase().indexOf(selectedTextLower, searchIndex);
      if (index === -1) break;
      
      // Get the actual text at this position (preserve original case)
      const actualText = fullText.substring(index, index + selectedText.length);
      occurrences.push({ 
        start: index, 
        end: index + selectedText.length, 
        text: actualText 
      });
      searchIndex = index + 1;
    }
    
    if (occurrences.length === 0) return;
    
    // Add to highlighted selections (avoid duplicates)
    setHighlightedSelections(prev => {
      const newSelections = [...prev];
      occurrences.forEach(occ => {
        // Check if this exact range is already highlighted
        const exists = newSelections.some(sel => 
          sel.start === occ.start && sel.end === occ.end
        );
        if (!exists) {
          newSelections.push(occ);
        }
      });
      return newSelections;
    });
    
    // Clear selection
    selection.removeAllRanges();
  };
  
  // Apply highlights to document text
  const applyHighlightsToText = (text) => {
    if (!text || highlightedSelections.length === 0) return text;
    
    const plainText = extractPlainText(text);
    let highlightedText = plainText;
    
    // Sort selections by start position (reverse order to maintain indices)
    const sortedSelections = [...highlightedSelections].sort((a, b) => b.start - a.start);
    
    // Apply highlights from end to start to maintain correct indices
    sortedSelections.forEach(sel => {
      const before = highlightedText.substring(0, sel.start);
      const selected = highlightedText.substring(sel.start, sel.end);
      const after = highlightedText.substring(sel.end);
      highlightedText = before + `<mark style="background-color: #FEF08A; padding: 2px 4px; border-radius: 3px;">${selected}</mark>` + after;
    });
    
    return highlightedText;
  };
  
  // Toggle highlight mode
  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode);
    if (!isHighlightMode) {
      // Enable highlight mode - add event listener
      document.addEventListener('mouseup', handleTextSelection);
    } else {
      // Disable highlight mode - remove event listener
      document.removeEventListener('mouseup', handleTextSelection);
    }
  };
  
  // Cleanup event listener on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [isHighlightMode]);
  
  // Clear all highlights
  const clearHighlights = () => {
    setHighlightedSelections([]);
  };
  
  // Function to split text into sentences (preserves HTML if present)
  const splitIntoSentences = (htmlText) => {
    try {
      if (typeof document === 'undefined' || !htmlText) return [];

      // Check if text contains HTML tags (like <mark> from highlighting)
      const hasHTML = /<[^>]+>/.test(htmlText);
      
      if (!hasHTML) {
        // Plain text - split normally
        const sentenceRegex = new RegExp('([.!?])\\s+', 'g');
        const sentences = htmlText
          .replace(sentenceRegex, '$1|SPLIT|')
          .split('|SPLIT|')
          .filter(s => s.trim().length > 0);
        return sentences;
      } else {
        // HTML text - split while preserving HTML tags
        // Split on sentence boundaries that are outside HTML tags
        const sentences = [];
        let currentSentence = '';
        let inTag = false;
        let tagBuffer = '';
        
        for (let i = 0; i < htmlText.length; i++) {
          const char = htmlText[i];
          
          if (char === '<') {
            inTag = true;
            tagBuffer = char;
          } else if (char === '>') {
            inTag = false;
            tagBuffer += char;
            currentSentence += tagBuffer;
            tagBuffer = '';
          } else if (inTag) {
            tagBuffer += char;
          } else {
            currentSentence += char;
            
            // Check for sentence ending
            if (/[.!?]/.test(char) && i < htmlText.length - 1) {
              const nextChar = htmlText[i + 1];
              if (nextChar === ' ' || nextChar === '\n' || nextChar === '<') {
                // End of sentence
                const trimmed = currentSentence.trim();
                if (trimmed.length > 0) {
                  sentences.push(trimmed);
                }
                currentSentence = '';
              }
            }
          }
        }
        
        // Add remaining text
        if (currentSentence.trim().length > 0) {
          sentences.push(currentSentence.trim());
        }
        
        return sentences.filter(s => s.length > 0);
      }
    } catch (e) {
      console.error('Error splitting sentences:', e);
      return [];
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setSettingsDropdownOpen(false);
      }
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setToolbarExpanded(false);
      }
    };

    if (settingsDropdownOpen || toolbarExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsDropdownOpen, toolbarExpanded]);

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
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
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
      alert(`Failed to upload file: ${error.message}\n\nMake sure the backend server is running on ${API_BASE_URL}`);
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

      const response = await fetch(`${API_BASE_URL}/documents/process`, {
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
      // Priority: highlighted_text > simplified_text > processed_text
      if (result.highlighted_text) {
        setDocumentText(result.highlighted_text);
      } else if (result.simplified_text) {
        setDocumentText(result.simplified_text);
      } else if (result.processed_text) {
        setDocumentText(result.processed_text);
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
      setUserAnswers({});
      setShowAnswers({});
      setQuizSubmitted(false);
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
      setUserAnswers({});
      setShowAnswers({});
      setQuizSubmitted(false);

    try {
      const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
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
        let errorMessage = "Failed to generate quiz";
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setQuizResult(data);
      // Reset user answers and show answers state
      setUserAnswers({});
      setShowAnswers({});
      setQuizSubmitted(false);
      // Scroll to quiz results
      setTimeout(() => {
        const quizResults = document.getElementById("quiz-results");
        if (quizResults) {
          quizResults.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Quiz generation error:", error);
      alert(`Failed to generate quiz: ${error.message || "Please make sure the backend is running and OpenAI API key is configured."}`);
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

        {/* Real-time Document Preview with Collapsible Toolbar - Show after upload */}
        {documentId && documentText && (
          <div style={{ marginBottom: "32px", position: "relative" }}>
            {/* Collapsible Processing Options Toolbar */}
            <div ref={toolbarRef} style={{
              position: "absolute",
              left: "20px",
              top: "20px",
              zIndex: 100,
              transition: "all 0.3s ease"
            }}>
              {/* Toolbar Button */}
              <button
                onClick={() => setToolbarExpanded(!toolbarExpanded)}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  background: toolbarExpanded
                    ? "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"
                    : "#FFFFFF",
                  color: toolbarExpanded ? "#FFFFFF" : "var(--text)",
                  fontSize: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px"
                }}
              >
                {toolbarExpanded ? "✕" : "☰"}
              </button>

              {/* Expanded Toolbar */}
              {toolbarExpanded && (
                <div style={{
                  position: "absolute",
                  left: "0",
                  top: "68px",
                  width: "280px",
                  background: "#FFFFFF",
                  borderRadius: "16px",
                  border: "2px solid rgba(0, 0, 0, 0.1)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  padding: "20px",
                  maxHeight: "70vh",
                  overflowY: "auto"
                }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>
                    Processing Options
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                    {[
                      { key: "summary", icon: "📝", label: "Summary", color: "#8B5CF6" },
                      { key: "simplify", icon: "🔧", label: "Simplify", color: "#F97316" }
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => toggleOption(option.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "10px",
                          border: `2px solid ${selectedOptions[option.key] ? option.color : "rgba(0, 0, 0, 0.1)"}`,
                          background: selectedOptions[option.key] 
                            ? `${option.color}15` 
                            : "#F9FAFB",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "left"
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>{option.icon}</span>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: selectedOptions[option.key] ? option.color : "var(--text)"
                        }}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || !selectedFile || !documentId}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background: isProcessing || !selectedFile || !documentId
                        ? "rgba(0, 0, 0, 0.3)"
                        : "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: isProcessing || !selectedFile || !documentId ? "not-allowed" : "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {isProcessing ? "Processing..." : "Process Document"}
                  </button>
                </div>
              )}
            </div>

            {/* Full-Width Document Preview */}
            <div className="card" style={{ width: "100%", minWidth: 0 }}>
                {/* Settings Dropdown at Top */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginBottom: "20px",
                  position: "relative"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text)" }}>
                      📄 Document Preview
                    </h2>
                    {documentText && speechSynthesis && (
                      <button
                        onClick={handleTextToSpeech}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "10px",
                          border: "none",
                          background: isSpeaking 
                            ? "linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
                            : "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
                          color: "#FFFFFF",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.2s",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSpeaking) {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
                        }}
                      >
                        {isSpeaking ? (
                          <>
                            <span style={{ fontSize: "18px" }}>⏸️</span>
                            <span>Stop Reading</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: "18px" }}>▶️</span>
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
                                onClick={() => {
                                  setAccessibilitySettings({...accessibilitySettings, colorTheme: theme.value});
                                  setBackgroundColor(theme.bg);
                                  setTextColor(theme.text);
                                }}
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

                        {/* Background Color Picker */}
                        <div style={{ marginBottom: "20px" }}>
                          <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
                            Background Color
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              style={{
                                width: "60px",
                                height: "40px",
                                borderRadius: "8px",
                                border: "2px solid rgba(0, 0, 0, 0.1)",
                                cursor: "pointer"
                              }}
                            />
                            <input
                              type="text"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "2px solid rgba(0, 0, 0, 0.1)",
                                fontSize: "13px"
                              }}
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>

                        {/* Text Color Picker */}
                        <div style={{ marginBottom: "20px" }}>
                          <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
                            Text Color
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              style={{
                                width: "60px",
                                height: "40px",
                                borderRadius: "8px",
                                border: "2px solid rgba(0, 0, 0, 0.1)",
                                cursor: "pointer"
                              }}
                            />
                            <input
                              type="text"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "2px solid rgba(0, 0, 0, 0.1)",
                                fontSize: "13px"
                              }}
                              placeholder="#1F2937"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
              </div>

              {/* Document Preview with Sentence Lines */}
              <div
                  style={{
                    padding: "40px",
                    background: backgroundColor,
                    borderRadius: "12px",
                    border: "2px solid rgba(0, 0, 0, 0.1)",
                    minHeight: "600px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    fontSize: selectedProfile === "dyslexia" ? "20px" : "18px",
                    lineHeight: selectedProfile === "dyslexia" ? "2.0" : "1.8",
                    color: textColor,
                    letterSpacing: `${(accessibilitySettings.spacing - 1) * 0.05}em`,
                    fontFamily: accessibilitySettings.font === "comic-sans"
                      ? "Comic Sans MS, cursive"
                      : accessibilitySettings.font === "arial"
                      ? "Arial, sans-serif"
                      : accessibilitySettings.font === "open-dyslexic"
                      ? "OpenDyslexic, sans-serif"
                      : "inherit",
                    transition: "all 0.3s ease",
                    cursor: isHighlightMode ? "text" : "default",
                    userSelect: isHighlightMode ? "text" : "auto",
                  }}
                >
                  {/* Format text with sentence lines and spacing */}
                  {(() => {
                    try {
                      // Apply highlights to document text before splitting
                      const textWithHighlights = highlightedSelections.length > 0 
                        ? applyHighlightsToText(documentText)
                        : documentText;
                      
                      const sentences = splitIntoSentences(textWithHighlights);
                      
                      if (sentences.length > 0) {
                        return sentences.map((sentence, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: "24px",
                              paddingBottom: "16px",
                              borderBottom: `1px solid rgba(${textColor === "#1F2937" ? "31, 41, 55" : textColor === "#FFFFFF" ? "255, 255, 255" : "0, 0, 0"}, 0.2)`,
                              position: "relative",
                              paddingLeft: "40px"
                            }}
                          >
                            {/* Line number indicator */}
                            <div style={{
                              position: "absolute",
                              left: "0",
                              top: "0",
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: `rgba(${textColor === "#1F2937" ? "31, 41, 55" : textColor === "#FFFFFF" ? "255, 255, 255" : "0, 0, 0"}, 0.1)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: textColor,
                              border: `2px solid rgba(${textColor === "#1F2937" ? "31, 41, 55" : textColor === "#FFFFFF" ? "255, 255, 255" : "0, 0, 0"}, 0.2)`
                            }}>
                              {index + 1}
                            </div>
                            {/* Sentence text - render HTML if present (for highlighting) */}
                            <div
                              style={{
                                color: textColor
                              }}
                              dangerouslySetInnerHTML={(() => {
                                const trimmed = sentence.trim();
                                const punctuationRegex = /[.!?]$/;
                                const endsWithPunctuation = punctuationRegex.test(trimmed);
                                const textWithPunctuation = trimmed + (endsWithPunctuation ? '' : '.');
                                // If sentence contains HTML tags (from highlighting), render as HTML
                                if (textWithPunctuation.includes('<mark>') || textWithPunctuation.includes('<')) {
                                  return { __html: textWithPunctuation };
                                }
                                return undefined;
                              })()}
                            >
                              {(() => {
                                const trimmed = sentence.trim();
                                const punctuationRegex = /[.!?]$/;
                                const endsWithPunctuation = punctuationRegex.test(trimmed);
                                const textWithPunctuation = trimmed + (endsWithPunctuation ? '' : '.');
                                // Only render as text if no HTML
                                if (!textWithPunctuation.includes('<mark>') && !textWithPunctuation.includes('<')) {
                                  return textWithPunctuation;
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        ));
                      } else {
                        // Fallback if no sentences found
                        return <div style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: documentText }} />;
                      }
                    } catch (e) {
                      // Fallback on error
                      return <div style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: documentText }} />;
                    }
                  })()}
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

          {/* Quiz Results - Interactive */}
          {quizResult && quizResult.questions && (
            <div id="quiz-results" style={{
              marginTop: "24px",
              padding: "20px",
              background: "rgba(139, 92, 246, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(139, 92, 246, 0.2)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>
                  Generated Quiz ({quizResult.total_questions} questions)
                </h3>
                {!quizSubmitted && (
                  <button
                    onClick={() => {
                      // Check if all questions are answered
                      const allAnswered = quizResult.questions.every((q, idx) => {
                        if (q.question_type === "short_answer") {
                          return userAnswers[idx] && userAnswers[idx].trim().length > 0;
                        }
                        return userAnswers[idx] !== undefined && userAnswers[idx] !== null;
                      });
                      
                      if (!allAnswered) {
                        alert("Please answer all questions before submitting!");
                        return;
                      }
                      
                      // Show all answers
                      const newShowAnswers = {};
                      quizResult.questions.forEach((_, idx) => {
                        newShowAnswers[idx] = true;
                      });
                      setShowAnswers(newShowAnswers);
                      setQuizSubmitted(true);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Submit Quiz
                  </button>
                )}
                {quizSubmitted && (
                  <div style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10B981",
                    fontSize: "14px",
                    fontWeight: 700
                  }}>
                    Score: {(() => {
                      let correct = 0;
                      quizResult.questions.forEach((q, idx) => {
                        const userAnswer = userAnswers[idx];
                        const correctAnswer = q.correct_answer;
                        if (q.question_type === "mcq") {
                          if (userAnswer === correctAnswer) correct++;
                        } else if (q.question_type === "true_false") {
                          if (userAnswer === correctAnswer) correct++;
                        } else {
                          // Short answer - simple check (case insensitive)
                          if (userAnswer && userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                            correct++;
                          }
                        }
                      });
                      return `${correct} / ${quizResult.total_questions}`;
                    })()}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {quizResult.questions.map((q, idx) => {
                  const userAnswer = userAnswers[idx];
                  const showAnswer = showAnswers[idx] || quizSubmitted;
                  const optionLetter = q.question_type === "mcq" 
                    ? String.fromCharCode(65 + q.options.findIndex((opt, optIdx) => String.fromCharCode(65 + optIdx) === userAnswer))
                    : null;
                  
                  const isCorrect = showAnswer ? (
                    q.question_type === "mcq" 
                      ? userAnswer === q.correct_answer
                      : q.question_type === "true_false"
                      ? userAnswer === q.correct_answer
                      : userAnswer && userAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()
                  ) : null;
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        background: "#FFFFFF",
                        borderRadius: "8px",
                        border: showAnswer && isCorrect
                          ? "2px solid #10B981"
                          : showAnswer && !isCorrect
                          ? "2px solid #EF4444"
                          : "1px solid rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "start", gap: "12px", marginBottom: "12px" }}>
                        <div style={{
                          minWidth: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: showAnswer && isCorrect
                            ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                            : showAnswer && !isCorrect
                            ? "linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
                            : "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
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
                          
                          {/* MCQ or True/False Options */}
                          {q.options && q.options.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                              {q.options.map((opt, optIdx) => {
                                const optLetter = q.question_type === "mcq" ? String.fromCharCode(65 + optIdx) : null;
                                const answerValue = q.question_type === "mcq" ? optLetter : opt;
                                const isSelected = userAnswer === answerValue;
                                const isCorrectOption = showAnswer && (
                                  q.question_type === "mcq"
                                    ? optLetter === q.correct_answer
                                    : opt === q.correct_answer
                                );
                                
                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => {
                                      if (!showAnswer) {
                                        setUserAnswers({ ...userAnswers, [idx]: answerValue });
                                      }
                                    }}
                                    style={{
                                      padding: "10px 12px",
                                      borderRadius: "6px",
                                      background: isSelected && !showAnswer
                                        ? "rgba(139, 92, 246, 0.1)"
                                        : showAnswer && isCorrectOption
                                        ? "rgba(16, 185, 129, 0.1)"
                                        : showAnswer && isSelected && !isCorrectOption
                                        ? "rgba(239, 68, 68, 0.1)"
                                        : "#F9FAFB",
                                      border: isSelected && !showAnswer
                                        ? "2px solid #8B5CF6"
                                        : showAnswer && isCorrectOption
                                        ? "2px solid #10B981"
                                        : showAnswer && isSelected && !isCorrectOption
                                        ? "2px solid #EF4444"
                                        : "1px solid rgba(0, 0, 0, 0.1)",
                                      fontSize: "14px",
                                      color: "var(--text)",
                                      cursor: showAnswer ? "default" : "pointer",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!showAnswer) {
                                        e.currentTarget.style.background = isSelected ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.05)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!showAnswer) {
                                        e.currentTarget.style.background = isSelected ? "rgba(139, 92, 246, 0.1)" : "#F9FAFB";
                                      }
                                    }}
                                  >
                                    {q.question_type === "mcq" && <strong>{optLetter}. </strong>}
                                    {opt}
                                    {showAnswer && isCorrectOption && (
                                      <span style={{ marginLeft: "8px", color: "#10B981", fontWeight: 700 }}>✓ Correct</span>
                                    )}
                                    {showAnswer && isSelected && !isCorrectOption && (
                                      <span style={{ marginLeft: "8px", color: "#EF4444", fontWeight: 700 }}>✗ Your Answer</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Short Answer Input */}
                          {q.question_type === "short_answer" && (
                            <div style={{ marginBottom: "12px" }}>
                              <textarea
                                value={userAnswer || ""}
                                onChange={(e) => {
                                  if (!showAnswer) {
                                    setUserAnswers({ ...userAnswers, [idx]: e.target.value });
                                  }
                                }}
                                placeholder="Type your answer here..."
                                disabled={showAnswer}
                                style={{
                                  width: "100%",
                                  minHeight: "80px",
                                  padding: "12px",
                                  borderRadius: "6px",
                                  border: showAnswer && isCorrect
                                    ? "2px solid #10B981"
                                    : showAnswer && !isCorrect
                                    ? "2px solid #EF4444"
                                    : "1px solid rgba(0, 0, 0, 0.2)",
                                  fontSize: "14px",
                                  fontFamily: "inherit",
                                  resize: "vertical",
                                  background: showAnswer ? "#F9FAFB" : "#FFFFFF"
                                }}
                              />
                              {showAnswer && (
                                <div style={{
                                  marginTop: "12px",
                                  padding: "12px",
                                  background: isCorrect ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                  borderRadius: "6px",
                                  border: `2px solid ${isCorrect ? "#10B981" : "#EF4444"}`
                                }}>
                                  <strong style={{ color: isCorrect ? "#10B981" : "#EF4444" }}>
                                    {isCorrect ? "✓ Correct! " : "✗ Incorrect. "}
                                  </strong>
                                  <span style={{ color: "var(--text)" }}>
                                    <strong>Correct Answer:</strong> {q.correct_answer}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Show feedback after submission */}
                          {showAnswer && (
                            <div style={{
                              padding: "10px",
                              background: isCorrect ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
                              borderRadius: "6px",
                              fontSize: "13px",
                              color: "var(--muted)",
                              marginTop: "8px"
                            }}>
                              {q.explanation && (
                                <>
                                  <strong>Explanation:</strong> {q.explanation}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  src={processingResult.audio_url.startsWith('http') 
                    ? processingResult.audio_url 
                    : `${API_BASE_URL}${processingResult.audio_url}`}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>
                  Audio URL: {processingResult.audio_url.startsWith('http') 
                    ? processingResult.audio_url 
                    : `${API_BASE_URL}${processingResult.audio_url}`}
                </p>
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

