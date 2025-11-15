import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Dyslexia() {
  const router = useRouter();

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📖</div>
          <h1 className="h1" style={{ fontSize: "48px", marginBottom: "12px", color: "#8B5CF6" }}>
            Dyslexia Support Center
          </h1>
          <p className="lead" style={{ fontSize: "18px", color: "var(--muted)", maxWidth: "600px", margin: "0 auto" }}>
            Specialized tools and features designed to make reading easier and more accessible
          </p>
        </div>

        {/* Key Features */}
        <div className="card" style={{ marginBottom: "32px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px", color: "#8B5CF6" }}>
            📖 Dyslexia-Optimized Features
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
            {[
              {
                icon: "🔤",
                title: "Dyslexia-Friendly Fonts",
                description: "OpenDyslexic and Comic Sans fonts designed to reduce letter confusion",
                color: "#8B5CF6"
              },
              {
                icon: "📏",
                title: "Enhanced Spacing",
                description: "Wider word and letter spacing to prevent text from appearing jumbled",
                color: "#8B5CF6"
              },
              {
                icon: "🎨",
                title: "High Contrast Themes",
                description: "Strong color contrast to improve letter distinction and readability",
                color: "#8B5CF6"
              },
              {
                icon: "🔊",
                title: "Text-to-Speech",
                description: "Audio support to reinforce reading and improve comprehension",
                color: "#8B5CF6"
              },
              {
                icon: "✨",
                title: "Text Simplification",
                description: "AI-powered text simplification to reduce reading complexity",
                color: "#8B5CF6"
              },
              {
                icon: "🎯",
                title: "Keyword Highlighting",
                description: "Color-coded highlights to identify important concepts easily",
                color: "#8B5CF6"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: "20px",
                  background: "#FFFFFF",
                  borderRadius: "12px",
                  border: "2px solid rgba(139, 92, 246, 0.2)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(139, 92, 246, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>{feature.icon}</div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.6" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Settings */}
        <div className="card" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
            ⚙️ Recommended Settings
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              padding: "16px",
              background: "rgba(139, 92, 246, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(139, 92, 246, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>📏</span>
                <strong style={{ fontSize: "16px", color: "#8B5CF6" }}>Word Spacing: 2.5x</strong>
              </div>
              <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                Extra spacing between words helps prevent letters from appearing to move or blend together
              </p>
            </div>
            <div style={{
              padding: "16px",
              background: "rgba(139, 92, 246, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(139, 92, 246, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>🔤</span>
                <strong style={{ fontSize: "16px", color: "#8B5CF6" }}>Font: OpenDyslexic</strong>
              </div>
              <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                Specially designed font with weighted bottoms to prevent letter rotation and confusion
              </p>
            </div>
            <div style={{
              padding: "16px",
              background: "rgba(139, 92, 246, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(139, 92, 246, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>🎨</span>
                <strong style={{ fontSize: "16px", color: "#8B5CF6" }}>Color Theme: High Contrast</strong>
              </div>
              <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                Strong contrast between text and background improves letter distinction and reduces visual stress
              </p>
            </div>
          </div>
        </div>

        {/* Tips & Strategies */}
        <div className="card" style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--text)" }}>
            💡 Tips & Strategies
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              "Use the text simplification feature to break down complex sentences into easier-to-read formats",
              "Enable text-to-speech to hear the text while reading for better comprehension",
              "Take advantage of keyword highlighting to quickly identify important information",
              "Adjust spacing settings to find what works best for your reading comfort",
              "Use the quiz generator to test understanding and reinforce learning",
              "Take breaks when reading becomes tiring - your comfort is important"
            ].map((tip, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "start",
                  gap: "12px",
                  padding: "12px",
                  background: "#F9FAFB",
                  borderRadius: "8px"
                }}
              >
                <span style={{ fontSize: "20px", flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: "15px", color: "var(--text)", margin: 0, lineHeight: "1.6" }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Large Upload Button */}
        <div className="card" style={{ 
          marginBottom: "32px", 
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
          border: "3px solid #8B5CF6",
          textAlign: "center",
          padding: "60px 40px"
        }}>
          <div style={{ fontSize: "80px", marginBottom: "24px" }}>📄</div>
          <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "16px", color: "#8B5CF6" }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: "18px", color: "var(--muted)", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
            Upload your document and we'll automatically apply dyslexia-friendly settings to make reading easier and more accessible.
          </p>
          <Link href="/uploads?profile=dyslexia">
            <button
              style={{
                padding: "20px 48px",
                borderRadius: "16px",
                border: "none",
                background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                color: "#FFFFFF",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(139, 92, 246, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.3)";
              }}
            >
              🚀 Upload Document
            </button>
          </Link>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "20px" }}>
            Your document will be automatically optimized with: 2.5x spacing, OpenDyslexic font, and high contrast theme
          </p>
        </div>
      </div>
    </div>
  );
}

