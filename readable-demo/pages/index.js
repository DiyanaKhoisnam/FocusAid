// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home(){
  const router = useRouter();
  const [demoText, setDemoText] = useState("The intricate mechanisms underlying cognitive processing in neurodivergent individuals necessitate a comprehensive understanding of how environmental stimuli interact with neural pathways to produce adaptive behavioral responses.");
  const [activeTab, setActiveTab] = useState("original");
  const [compareMode, setCompareMode] = useState(false);

  // Mock simplification function
  function simplifyText(text) {
    return text
      .replace(/\bintricate\b/gi, "complex")
      .replace(/\bmechanisms\b/gi, "ways")
      .replace(/\bunderlying\b/gi, "behind")
      .replace(/\bcognitive processing\b/gi, "thinking")
      .replace(/\bneurodivergent\b/gi, "people with different brain types")
      .replace(/\bnecessitate\b/gi, "need")
      .replace(/\bcomprehensive\b/gi, "full")
      .replace(/\benvironmental stimuli\b/gi, "things around us")
      .replace(/\bneural pathways\b/gi, "brain connections")
      .replace(/\badaptive behavioral responses\b/gi, "helpful actions");
  }

  const simplifiedText = simplifyText(demoText);

  const renderText = () => {
    switch(activeTab) {
      case "dyslexia":
        return (
          <div style={{
            fontSize: "20px",
            lineHeight: "2.0",
            letterSpacing: "0.1em",
            fontFamily: "Arial, sans-serif",
            color: "#1F2937",
            padding: "24px",
            background: "#FFFFFF",
            borderRadius: "12px"
          }}>
            {simplifiedText}
          </div>
        );
      case "adhd":
        return (
          <div style={{
            fontSize: "18px",
            lineHeight: "1.8",
            padding: "24px",
            background: "#F9FAFB",
            borderRadius: "12px",
            border: "2px solid #E5E7EB"
          }}>
            {simplifiedText.split(". ").map((sentence, i) => (
              <div key={i} style={{
                marginBottom: "16px",
                padding: "12px",
                background: i % 2 === 0 ? "#EFF6FF" : "#FFFFFF",
                borderRadius: "8px",
                borderLeft: "4px solid #3B82F6"
              }}>
                {sentence}
              </div>
            ))}
          </div>
        );
      case "simplified":
        return (
          <div style={{
            fontSize: "18px",
            lineHeight: "1.8",
            padding: "24px",
            background: "#FFFFFF",
            borderRadius: "12px"
          }}>
            {simplifiedText}
          </div>
        );
      default:
        return (
          <div style={{
            fontSize: "16px",
            lineHeight: "1.6",
            padding: "24px",
            background: "#FFFFFF",
            borderRadius: "12px"
          }}>
            {demoText}
          </div>
        );
    }
  };

  return (
    <div style={{marginTop: 0}}>
      {/* 🌟 HERO SECTION */}
      <div className="hero" style={{
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)",
        padding: "80px 20px",
        borderRadius: "0 0 40px 40px",
        marginBottom: "80px"
      }}>
        <div style={{maxWidth: "1200px", margin: "0 auto", textAlign: "center"}}>
          <h1 className="h1" style={{
            fontSize: "64px",
            lineHeight: "1.1",
            marginBottom: "24px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #8B5CF6 0%, #10B981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Reading Made Easier for Every Kind of Brain.
          </h1>
          <p className="lead" style={{
            fontSize: "22px",
            lineHeight: "1.6",
            marginBottom: "40px",
            maxWidth: "800px",
            margin: "0 auto 40px",
            color: "var(--muted)"
          }}>
            AI-powered accessibility that turns any text into a personalised, dyslexia-friendly and ADHD-friendly reading experience.
          </p>
          
          <div className="cta-row" style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}>
            <Link href="#demo">
              <button className="btn primary" style={{
                padding: "16px 32px",
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)"
              }}>
                👉 Try Demo
              </button>
            </Link>
            <Link href="/uploads">
              <button className="btn" style={{
                padding: "16px 32px",
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                color: "#FFFFFF",
                border: "none",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
              }}>
                👉 Simplify Text
              </button>
            </Link>
            <Link href="/uploads">
              <button className="btn" style={{
                padding: "16px 32px",
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
                color: "#FFFFFF",
                border: "none",
                boxShadow: "0 4px 20px rgba(249, 115, 22, 0.3)"
              }}>
                👉 Upload PDF
              </button>
            </Link>
          </div>
          
          <p style={{
            fontSize: "16px",
            color: "var(--muted)",
            fontStyle: "italic",
            marginTop: "32px"
          }}>
            Built for neurodiverse learners. Made for everyone.
          </p>
        </div>
      </div>

      {/* 🧠 INTERACTIVE DEMO SECTION */}
      <div id="demo" style={{
        maxWidth: "1200px",
        margin: "0 auto 80px",
        padding: "0 20px"
      }}>
        <div style={{textAlign: "center", marginBottom: "48px"}}>
          <h2 style={{
            fontSize: "42px",
            fontWeight: 800,
            marginBottom: "16px",
            color: "var(--text)"
          }}>
            See the Transformation in Seconds
          </h2>
          <p style={{
            fontSize: "18px",
            color: "var(--muted)",
            maxWidth: "700px",
            margin: "0 auto"
          }}>
            Paste any paragraph and watch it instantly turn into a simplified, spaced, color-coded, focus-friendly version.
          </p>
        </div>

        <div className="card" style={{
          padding: "32px",
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
            borderBottom: "2px solid #E5E7EB",
            paddingBottom: "16px"
          }}>
            {[
              { id: "original", label: "Original" },
              { id: "dyslexia", label: "Dyslexia Mode" },
              { id: "adhd", label: "ADHD Focus Mode" },
              { id: "simplified", label: "Simplified Version" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === tab.id
                    ? "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"
                    : "#F3F4F6",
                  color: activeTab === tab.id ? "#FFFFFF" : "var(--text)",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <div style={{marginBottom: "24px"}}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "8px",
              color: "var(--text)"
            }}>
              Paste your text here:
            </label>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "16px",
                borderRadius: "12px",
                border: "2px solid #E5E7EB",
                fontSize: "16px",
                fontFamily: "inherit",
                resize: "vertical"
              }}
              placeholder="Paste any paragraph here..."
            />
          </div>

          {/* Compare Toggle */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px"
          }}>
            <button
              onClick={() => setCompareMode(!compareMode)}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: "2px solid #8B5CF6",
                background: compareMode
                  ? "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"
                  : "#FFFFFF",
                color: compareMode ? "#FFFFFF" : "#8B5CF6",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {compareMode ? "✓ Compare Before/After" : "Compare Before/After"}
            </button>
          </div>

          {/* Output Display */}
          {compareMode ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px"
            }}>
              <div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "#EF4444"
                }}>
                  BEFORE
                </h3>
                <div style={{
                  padding: "24px",
                  background: "#FEF2F2",
                  borderRadius: "12px",
                  border: "2px solid #FCA5A5",
                  fontSize: "16px",
                  lineHeight: "1.6"
                }}>
                  {demoText}
                </div>
              </div>
              <div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "#10B981"
                }}>
                  AFTER
                </h3>
                {renderText()}
              </div>
            </div>
          ) : (
            <div>
              {renderText()}
            </div>
          )}
        </div>
      </div>

      {/* 💛 WHY THIS MATTERS SECTION */}
      <div style={{
        background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
        padding: "80px 20px",
        marginBottom: "80px"
      }}>
        <div style={{maxWidth: "1000px", margin: "0 auto"}}>
          <h2 style={{
            fontSize: "42px",
            fontWeight: 800,
            marginBottom: "32px",
            textAlign: "center",
            color: "var(--text)"
          }}>
            Learning Isn't One-Size-Fits-All. Our Brains Aren't Either.
          </h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
            marginBottom: "40px"
          }}>
            {[
              "1 in 5 students struggle with reading barriers like dyslexia, ADHD, or processing issues.",
              "Most digital platforms are made for neurotypical learners.",
              "Long paragraphs, tiny fonts, and dense text increase cognitive load and frustration.",
              "Students lose confidence, motivation, and grades suffer."
            ].map((point, i) => (
              <div key={i} className="card" style={{
                padding: "24px",
                background: "#FFFFFF",
                borderRadius: "16px",
                border: "2px solid rgba(249, 115, 22, 0.2)"
              }}>
                <div style={{
                  fontSize: "32px",
                  marginBottom: "12px"
                }}>
                  {i === 0 ? "📊" : i === 1 ? "💻" : i === 2 ? "📄" : "😔"}
                </div>
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "var(--text)"
                }}>
                  {point}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: "center",
            padding: "32px",
            background: "linear-gradient(135deg, #8B5CF6 0%, #10B981 100%)",
            borderRadius: "20px",
            color: "#FFFFFF"
          }}>
            <p style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: 0
            }}>
              We're fixing that — with inclusive, brain-friendly technology.
            </p>
          </div>
        </div>
      </div>

      {/* ⭐ KEY FEATURES SECTION */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 80px",
        padding: "0 20px"
      }}>
        <div style={{textAlign: "center", marginBottom: "48px"}}>
          <h2 style={{
            fontSize: "42px",
            fontWeight: 800,
            marginBottom: "16px",
            color: "var(--text)"
          }}>
            Everything You Need for Stress-Free Reading
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {[
            {
              title: "Dyslexia-Friendly Formatting",
              description: "Better letter spacing, word spacing, and clean fonts scientifically proven to reduce reading strain.",
              icon: "📖",
              color: "#8B5CF6"
            },
            {
              title: "ADHD Focus Mode",
              description: "Distraction-free screen, line-highlighting, and adaptive pacing to keep attention stable.",
              icon: "🎯",
              color: "#10B981"
            },
            {
              title: "One-Click AI Simplification",
              description: "Turns complex sentences into short, clean, easy-to-understand lines.",
              icon: "✨",
              color: "#3B82F6"
            },
            {
              title: "Natural Voice Text-to-Speech",
              description: "Human-like voice narration with adjustable speed for auditory learners.",
              icon: "🔊",
              color: "#F59E0B"
            },
            {
              title: "Color-Coded Structure",
              description: "Highlights keywords, transitions, emotions, and important ideas.",
              icon: "🎨",
              color: "#EC4899"
            },
            {
              title: "Personalisation Engine",
              description: "Choose your font, colors, reading pace, difficulty level, and narration voice.",
              icon: "⚙️",
              color: "#6366F1"
            },
            {
              title: "Smart Study Tools",
              description: "Automatically generates summaries, notes, flashcards, and quizzes from any text.",
              icon: "🧠",
              color: "#14B8A6"
            },
            {
              title: "Cross-Platform Extension",
              description: "Works on PDFs, browser pages, e-learning portals, and even textbooks via camera scan.",
              icon: "🌐",
              color: "#F97316"
            }
          ].map((feature, i) => (
            <div key={i} className="card" style={{
              padding: "32px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
              borderRadius: "20px",
              border: `2px solid ${feature.color}40`,
              transition: "all 0.3s",
              cursor: "pointer",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 12px 32px ${feature.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
            }}
            >
              <div style={{
                fontSize: "48px",
                marginBottom: "16px"
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "12px",
                color: "var(--text)"
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: "15px",
                lineHeight: "1.6",
                color: "var(--muted)",
                flex: 1
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ⚙️ HOW IT WORKS SECTION */}
      <div style={{
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
        padding: "80px 20px",
        marginBottom: "80px"
      }}>
        <div style={{maxWidth: "1000px", margin: "0 auto"}}>
          <h2 style={{
            fontSize: "42px",
            fontWeight: 800,
            marginBottom: "48px",
            textAlign: "center",
            color: "var(--text)"
          }}>
            How It Works
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px"
          }}>
            {[
              {
                step: "1️⃣",
                title: "Input Your Text",
                description: "Paste, upload, or extract text from a website or PDF.",
                icon: "📝"
              },
              {
                step: "2️⃣",
                title: "Choose Your Mode",
                description: "Dyslexia Mode • ADHD Mode • Balanced Mode",
                icon: "🎛️"
              },
              {
                step: "3️⃣",
                title: "Read Effortlessly",
                description: "Get simplified text, better spacing, and real-time voice narration.",
                icon: "✨"
              }
            ].map((step, i) => (
              <div key={i} style={{
                textAlign: "center",
                padding: "40px",
                background: "#FFFFFF",
                borderRadius: "20px",
                border: "2px solid rgba(59, 130, 246, 0.2)",
                position: "relative"
              }}>
                <div style={{
                  fontSize: "64px",
                  marginBottom: "16px"
                }}>
                  {step.icon}
                </div>
                <div style={{
                  fontSize: "32px",
                  marginBottom: "12px",
                  fontWeight: 800
                }}>
                  {step.step}
                </div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "var(--text)"
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "var(--muted)"
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 SHOWCASE EXAMPLE SECTION */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 80px",
        padding: "0 20px"
      }}>
        <div style={{textAlign: "center", marginBottom: "48px"}}>
          <h2 style={{
            fontSize: "42px",
            fontWeight: 800,
            marginBottom: "16px",
            color: "var(--text)"
          }}>
            A Real Example of Our AI Magic
          </h2>
        </div>

        <div className="card" style={{
          padding: "40px",
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "32px"
          }}>
            <div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>❌</span> BEFORE
              </h3>
              <div style={{
                padding: "24px",
                background: "#FEF2F2",
                borderRadius: "12px",
                border: "2px solid #FCA5A5",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#1F2937"
              }}>
                The intricate mechanisms underlying cognitive processing in neurodivergent individuals necessitate a comprehensive understanding of how environmental stimuli interact with neural pathways to produce adaptive behavioral responses.
              </div>
            </div>
            <div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>✅</span> AFTER
              </h3>
              <div style={{
                padding: "24px",
                background: "#F0FDF4",
                borderRadius: "12px",
                border: "2px solid #86EFAC",
                fontSize: "18px",
                lineHeight: "2.0",
                letterSpacing: "0.05em",
                color: "#1F2937"
              }}>
                The complex ways behind thinking in people with different brain types need a full understanding of how things around us interact with brain connections to produce helpful actions.
              </div>
            </div>
          </div>

          {/* TTS Playback Button */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "24px"
          }}>
            <button style={{
              padding: "14px 28px",
              borderRadius: "12px",
              border: "2px solid #3B82F6",
              background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>🔊</span>
              <span>Play Audio</span>
            </button>
          </div>

          {/* Focus Score Bar */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}>
              <span style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text)"
              }}>
                Focus Score
              </span>
              <span style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#10B981"
              }}>
                92/100
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "12px",
              background: "#E5E7EB",
              borderRadius: "6px",
              overflow: "hidden"
            }}>
              <div style={{
                width: "92%",
                height: "100%",
                background: "linear-gradient(90deg, #10B981 0%, #34D399 100%)",
                borderRadius: "6px",
                transition: "width 0.3s"
              }} />
            </div>
            <p style={{
              fontSize: "14px",
              color: "var(--muted)",
              marginTop: "8px"
            }}>
              Improved readability, reduced cognitive load, and enhanced focus.
            </p>
          </div>
        </div>
      </div>

      <div className="footer" style={{
        marginTop: "60px",
        marginBottom: "40px",
        textAlign: "center",
        padding: "40px 20px",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)",
        borderRadius: "20px"
      }}>
        <p style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: "8px"
        }}>
          Made for HackShetra — FocusAid Platform
        </p>
        <p style={{
          fontSize: "14px",
          color: "var(--muted)"
        }}>
          Built for neurodiverse learners. Made for everyone.
        </p>
      </div>
    </div>
  );
}
