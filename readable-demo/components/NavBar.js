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

      <div className="navbar-links">
        <Link href="/" className={active("/")}>Home</Link>
        <Link href="/services" className={active("/services")}>Services</Link>
        <Link href="/resources" className={active("/resources")}>Resources</Link>
        <Link href="/about" className={active("/about")}>About Me</Link>
        <Link href="/contact" className={active("/contact")}>Contact Me</Link>
      </div>

      <div className="navbar-cta">
        <Link href="/login" style={{textDecoration:"none"}}>
          <button className="btn-nav-cta">Login</button>
        </Link>
      </div>
    </nav>
  );
}