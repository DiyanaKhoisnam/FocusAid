import { useState } from "react";

export default function Uploads() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    summary: false,
    highlight: false,
    textToAudio: false,
    simplify: false,
  });
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    spacing: "normal", // normal, wide, extra-wide
    font: "default", // default, open-dyslexic, comic-sans, arial
    colorTheme: "default", // default, high-contrast, sepia, dark
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

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
    setProcessingResult(null);
    setSelectedOptions({
      summary: false,
      highlight: false,
      textToAudio: false,
      simplify: false,
    });
  };

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <h1 className="h1" style={{ fontSize: "48px", marginBottom: "12px" }}>
          Upload Document
        </h1>
        <p className="lead" style={{ fontSize: "18px", marginBottom: "40px" }}>
          Upload your document and choose from various processing options to make it more accessible.
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

        {/* Accessibility Filters */}
        <div className="card" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
            Accessibility Settings
          </h2>
          <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "24px" }}>
            Customize text appearance for better readability:
          </p>

          {/* Word Spacing */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "12px", display: "block" }}>
              Word Spacing
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["normal", "wide", "extra-wide"].map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => setAccessibilitySettings({...accessibilitySettings, spacing})}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: `2px solid ${accessibilitySettings.spacing === spacing ? "var(--orange)" : "rgba(0, 0, 0, 0.1)"}`,
                    background: accessibilitySettings.spacing === spacing 
                      ? "linear-gradient(135deg, #F97316 0%, #FB923C 100%)" 
                      : "#FFFFFF",
                    color: accessibilitySettings.spacing === spacing ? "#FFFFFF" : "var(--text)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textTransform: "capitalize",
                  }}
                  onMouseEnter={(e) => {
                    if (accessibilitySettings.spacing !== spacing) {
                      e.currentTarget.style.borderColor = "var(--orange)";
                      e.currentTarget.style.background = "rgba(249, 115, 22, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (accessibilitySettings.spacing !== spacing) {
                      e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.background = "#FFFFFF";
                    }
                  }}
                >
                  {spacing.replace("-", " ")}
                </button>
              ))}
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

        {/* Processing Options */}
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

        {/* Process Button */}
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
                    wordSpacing: accessibilitySettings.spacing === "wide" ? "0.2em" : 
                                accessibilitySettings.spacing === "extra-wide" ? "0.4em" : "normal",
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

