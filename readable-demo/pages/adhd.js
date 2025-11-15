import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ADHD() {
  const router = useRouter();

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎯</div>
          <h1 className="h1" style={{ fontSize: "48px", marginBottom: "12px", color: "#10B981" }}>
            ADHD Support Center
          </h1>
          <p className="lead" style={{ fontSize: "18px", color: "var(--muted)", maxWidth: "600px", margin: "0 auto" }}>
            Tools and resources designed to help you maintain focus, reduce distractions, and improve productivity
          </p>
        </div>

        {/* Key Features */}
        <div className="card" style={{ marginBottom: "32px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px", color: "#10B981" }}>
            🎯 ADHD-Optimized Features
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
            {[
              {
                icon: "⏱️",
                title: "Focus Timer",
                description: "Pomodoro technique with customizable breaks to maintain attention",
                color: "#10B981"
              },
              {
                icon: "📝",
                title: "Clean Text Display",
                description: "Minimal distractions with balanced spacing and clear fonts",
                color: "#10B981"
              },
              {
                icon: "🎨",
                title: "Calm Color Themes",
                description: "Soothing color schemes that reduce visual overwhelm",
                color: "#10B981"
              },
              {
                icon: "🔊",
                title: "Text-to-Speech",
                description: "Listen to content while reading to improve comprehension",
                color: "#10B981"
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                description: "Visual progress indicators to maintain motivation",
                color: "#10B981"
              },
              {
                icon: "🧠",
                title: "Cognitive Load Reduction",
                description: "Simplified interfaces to reduce mental fatigue",
                color: "#10B981"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: "20px",
                  background: "#FFFFFF",
                  borderRadius: "12px",
                  border: "2px solid rgba(16, 185, 129, 0.2)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.2)";
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
              background: "rgba(16, 185, 129, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(16, 185, 129, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>📏</span>
                <strong style={{ fontSize: "16px", color: "#10B981" }}>Word Spacing: 2x</strong>
              </div>
              <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                Moderate spacing helps reduce visual crowding while maintaining reading flow
              </p>
            </div>
            <div style={{
              padding: "16px",
              background: "rgba(16, 185, 129, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(16, 185, 129, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>🔤</span>
                <strong style={{ fontSize: "16px", color: "#10B981" }}>Font: Arial</strong>
              </div>
              <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                Clean, sans-serif font that's easy to read without being distracting
              </p>
            </div>
            <div style={{
              padding: "16px",
              background: "rgba(16, 185, 129, 0.05)",
              borderRadius: "12px",
              border: "2px solid rgba(16, 185, 129, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>🎨</span>
                <strong style={{ fontSize: "16px", color: "#10B981" }}>Color Theme: Default</strong>
              </div>
              <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                Balanced colors that are easy on the eyes and reduce visual stimulation
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
              "Use the Pomodoro Timer to break work into manageable 25-minute chunks",
              "Enable text-to-speech to engage multiple senses while reading",
              "Take advantage of the quiz generator to test comprehension and maintain engagement",
              "Use the highlight feature to identify key concepts and reduce cognitive load",
              "Keep your workspace organized and minimize external distractions",
              "Take regular breaks and use the focus timer to maintain productivity"
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
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
          border: "3px solid #10B981",
          textAlign: "center",
          padding: "60px 40px"
        }}>
          <div style={{ fontSize: "80px", marginBottom: "24px" }}>📄</div>
          <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "16px", color: "#10B981" }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: "18px", color: "var(--muted)", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
            Upload your document and we'll automatically apply ADHD-optimized settings to make it easier to read and focus on.
          </p>
          <Link href="/uploads?profile=adhd">
            <button
              style={{
                padding: "20px 48px",
                borderRadius: "16px",
                border: "none",
                background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                color: "#FFFFFF",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(16, 185, 129, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.3)";
              }}
            >
              🚀 Upload Document
            </button>
          </Link>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "20px" }}>
            Your document will be automatically optimized with: 2x spacing, Arial font, and default theme
          </p>
        </div>
      </div>
    </div>
  );
}

