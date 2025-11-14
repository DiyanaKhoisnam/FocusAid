// components/NavBar.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function NavBar(){
  const router = useRouter();
  const active = (path) => router.pathname === path ? "active" : "";

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

      <div className="navbar-links" style={{gap: "8px"}}>
        <Link href="/" className={active("/")}>Home</Link>
        <Link 
          href="/uploads" 
          className={active("/uploads")}
          style={{
            background: active("/uploads") === "active" ? "linear-gradient(135deg, #F97316 0%, #FB923C 100%)" : "transparent",
            color: active("/uploads") === "active" ? "#FFFFFF" : "var(--text)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (active("/uploads") !== "active") {
              e.currentTarget.style.background = "rgba(249, 115, 22, 0.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (active("/uploads") !== "active") {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          Uploads
        </Link>
        <Link href="/login" style={{textDecoration:"none"}}>
          <button className="btn-nav-cta" style={{marginLeft: "0"}}>Login</button>
        </Link>
      </div>
    </nav>
  );
}