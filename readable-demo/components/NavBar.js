// components/NavBar.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function NavBar(){
  const router = useRouter();
  const active = (path) => router.pathname === path ? "active" : "";
  const [currentProfile, setCurrentProfile] = useState("adhd"); // "adhd" or "dyslexia"

  // Update current profile based on route
  useEffect(() => {
    if (router.pathname === "/dyslexia") {
      setCurrentProfile("dyslexia");
    } else if (router.pathname === "/adhd") {
      setCurrentProfile("adhd");
    }
  }, [router.pathname]);

  const toggleProfile = () => {
    const newProfile = currentProfile === "adhd" ? "dyslexia" : "adhd";
    setCurrentProfile(newProfile);
    router.push(`/${newProfile}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo">
          <img 
            src="/PHOTO-2025-11-14-15-18-06.jpg" 
            alt="FocusAid Logo"
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover", 
              borderRadius: "12px"
            }}
          />
        </div>
        <div className="brand-text">
          <h1>FocusAid</h1>
        </div>
      </div>

      <div className="navbar-links" style={{gap: "8px", display: "flex", alignItems: "center"}}>
        <Link href="/" className={active("/")}>Home</Link>
        
        {/* Profile Toggle Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px",
            background: "#F3F4F6",
            borderRadius: "12px",
            border: "2px solid rgba(0, 0, 0, 0.1)",
            position: "relative",
          }}
        >
          <button
            onClick={toggleProfile}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: currentProfile === "adhd" 
                ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                : "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              minWidth: "140px",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span style={{ fontSize: "18px" }}>
              {currentProfile === "adhd" ? "🎯" : "📖"}
            </span>
            <span style={{ textTransform: "uppercase" }}>
              {currentProfile === "adhd" ? "ADHD" : "Dyslexia"}
            </span>
            <span style={{ fontSize: "12px", opacity: 0.8 }}>↔</span>
          </button>
        </div>

        <Link href="/login" style={{textDecoration:"none"}}>
          <button className="btn-nav-cta" style={{marginLeft: "0"}}>Login</button>
        </Link>
      </div>
    </nav>
  );
}