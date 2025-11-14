import { useState, useEffect, useRef } from "react";

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // 'work', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const WORK_TIME = 25;
  const SHORT_BREAK = 5;
  const LONG_BREAK = 15;

  const modeRef = useRef(mode);
  const completedPomodorosRef = useRef(completedPomodoros);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    completedPomodorosRef.current = completedPomodoros;
  }, [completedPomodoros]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                // Timer finished
                setIsActive(false);
                const currentMode = modeRef.current;
                const currentCount = completedPomodorosRef.current;
                
                if (currentMode === "work") {
                  const newCount = currentCount + 1;
                  setCompletedPomodoros(newCount);
                  // After 4 pomodoros, take a long break
                  if (newCount % 4 === 0) {
                    setMode("longBreak");
                    setSeconds(0);
                    if (typeof window !== "undefined" && window.Notification && Notification.permission === "granted") {
                      new Notification("Pomodoro Timer", {
                        body: "Time for a long break!",
                      });
                    }
                    return LONG_BREAK;
                  } else {
                    setMode("shortBreak");
                    setSeconds(0);
                    if (typeof window !== "undefined" && window.Notification && Notification.permission === "granted") {
                      new Notification("Pomodoro Timer", {
                        body: "Time for a break!",
                      });
                    }
                    return SHORT_BREAK;
                  }
                } else {
                  // Break finished, back to work
                  setMode("work");
                  setSeconds(0);
                  if (typeof window !== "undefined" && window.Notification && Notification.permission === "granted") {
                    new Notification("Pomodoro Timer", {
                      body: "Back to work!",
                    });
                  }
                  return WORK_TIME;
                }
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't drag if clicking a button
    setIsDragging(true);
    const rect = timerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - 280;
        const maxY = window.innerHeight - 400;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "work") {
      setMinutes(WORK_TIME);
    } else if (mode === "shortBreak") {
      setMinutes(SHORT_BREAK);
    } else {
      setMinutes(LONG_BREAK);
    }
    setSeconds(0);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === "work") {
      setMinutes(WORK_TIME);
    } else if (newMode === "shortBreak") {
      setMinutes(SHORT_BREAK);
    } else {
      setMinutes(LONG_BREAK);
    }
    setSeconds(0);
  };

  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getModeGradient = () => {
    if (mode === "work") return "linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)";
    if (mode === "shortBreak") return "linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)";
    return "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 50%, #DDD6FE 100%)";
  };

  const getModeColor = () => {
    if (mode === "work") return "#F97316";
    if (mode === "shortBreak") return "#3B82F6";
    return "#A78BFA";
  };

  const getModeLabel = () => {
    if (mode === "work") return "🍅 Focus Time";
    if (mode === "shortBreak") return "☕ Short Break";
    return "🌴 Long Break";
  };

  const getModeEmoji = () => {
    if (mode === "work") return "🍅";
    if (mode === "shortBreak") return "☕";
    return "🌴";
  };

  const totalSeconds = minutes * 60 + seconds;
  const totalTime = mode === "work" ? WORK_TIME * 60 : mode === "shortBreak" ? SHORT_BREAK * 60 : LONG_BREAK * 60;
  const progress = ((totalTime - totalSeconds) / totalTime) * 100;

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            left: "20px",
            bottom: "20px",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: getModeGradient(),
            border: "none",
            color: "#FFFFFF",
            fontSize: "28px",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(255, 255, 255, 0.1)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: "pulse 2s infinite",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.3), 0 0 0 6px rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(255, 255, 255, 0.1)";
          }}
        >
          {getModeEmoji()}
        </button>
      )}

      {/* Timer Card */}
      {isOpen && (
        <div
          ref={timerRef}
          style={{
            position: "fixed",
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1000,
            width: "280px",
            cursor: isDragging ? "grabbing" : "grab",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
            transform: isDragging ? "scale(1.02)" : "scale(1)",
          }}
          onMouseDown={handleMouseDown}
        >
          <style jsx>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
            .timer-card {
              background: linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%);
              border-radius: 24px;
              padding: 24px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.8);
            }
            .progress-ring {
              transform: rotate(-90deg);
            }
            .progress-ring-circle {
              transition: stroke-dashoffset 0.5s ease-in-out;
            }
          `}</style>
          
          <div className="timer-card">
            {/* Header with close button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  background: getModeGradient(),
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "0.5px",
                }}
              >
                {getModeLabel()}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0, 0, 0, 0.05)",
                  color: "var(--text)",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.transform = "rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
              >
                ×
              </button>
            </div>

            {/* Circular Progress Timer */}
            <div style={{ position: "relative", width: "200px", height: "200px", margin: "0 auto 20px" }}>
              <svg className="progress-ring" width="200" height="200" style={{ position: "absolute", top: 0, left: 0 }}>
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.05)"
                  strokeWidth="8"
                />
                <circle
                  className="progress-ring-circle"
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={getModeColor()}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  style={{
                    filter: `drop-shadow(0 0 8px ${getModeColor()}40)`,
                  }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: 800,
                    color: "var(--text)",
                    fontFamily: "monospace",
                    background: getModeGradient(),
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: "4px",
                  }}
                >
                  {formatTime(minutes, seconds)}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  {Math.round(progress)}% complete
                </div>
              </div>
            </div>

            {/* Pomodoro Counter */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              {[...Array(Math.min(completedPomodoros, 8))].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: getModeGradient(),
                    boxShadow: `0 0 8px ${getModeColor()}60`,
                  }}
                />
              ))}
              {completedPomodoros > 0 && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    fontWeight: 600,
                    marginLeft: "4px",
                  }}
                >
                  {completedPomodoros}
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button
                onClick={toggleTimer}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  borderRadius: "12px",
                  border: "none",
                  background: isActive 
                    ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" 
                    : getModeGradient(),
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: isActive 
                    ? "0 4px 12px rgba(239, 68, 68, 0.4)" 
                    : `0 4px 12px ${getModeColor()}40`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = isActive 
                    ? "0 6px 16px rgba(239, 68, 68, 0.5)" 
                    : `0 6px 16px ${getModeColor()}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isActive 
                    ? "0 4px 12px rgba(239, 68, 68, 0.4)" 
                    : `0 4px 12px ${getModeColor()}40`;
                }}
              >
                {isActive ? "⏸ Pause" : "▶ Start"}
              </button>
              <button
                onClick={resetTimer}
                style={{
                  padding: "12px 16px",
                  fontSize: "15px",
                  fontWeight: 600,
                  borderRadius: "12px",
                  border: "2px solid rgba(0, 0, 0, 0.1)",
                  background: "rgba(255, 255, 255, 0.8)",
                  color: "var(--text)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                ↻
              </button>
            </div>

            {/* Mode Switcher */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <button
                onClick={() => switchMode("work")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: mode === "work" 
                    ? "linear-gradient(135deg, #F97316 0%, #FB923C 100%)" 
                    : "rgba(249, 115, 22, 0.1)",
                  color: mode === "work" ? "#FFFFFF" : "#F97316",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (mode !== "work") {
                    e.currentTarget.style.background = "rgba(249, 115, 22, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== "work") {
                    e.currentTarget.style.background = "rgba(249, 115, 22, 0.1)";
                  }
                }}
              >
                <span>🍅</span> Work (25 min)
              </button>
              <button
                onClick={() => switchMode("shortBreak")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: mode === "shortBreak" 
                    ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" 
                    : "rgba(59, 130, 246, 0.1)",
                  color: mode === "shortBreak" ? "#FFFFFF" : "#3B82F6",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (mode !== "shortBreak") {
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== "shortBreak") {
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
                  }
                }}
              >
                <span>☕</span> Short Break (5 min)
              </button>
              <button
                onClick={() => switchMode("longBreak")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  background: mode === "longBreak" 
                    ? "linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)" 
                    : "rgba(167, 139, 250, 0.1)",
                  color: mode === "longBreak" ? "#FFFFFF" : "#A78BFA",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (mode !== "longBreak") {
                    e.currentTarget.style.background = "rgba(167, 139, 250, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== "longBreak") {
                    e.currentTarget.style.background = "rgba(167, 139, 250, 0.1)";
                  }
                }}
              >
                <span>🌴</span> Long Break (15 min)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
