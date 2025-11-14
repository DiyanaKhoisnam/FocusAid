// components/NavBar.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function NavBar(){
  const router = useRouter();
  const active = (path) => router.pathname === path ? "active" : "";

  return (
    <div className="topbar">
      <div className="brand">
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

        <div>
          <h1>FocusAid</h1>
          <div className="small">AI accessibility platform</div>
        </div>
      </div>

      <div className="navlinks">
        <Link href="/"><a className={active("/")}>Home</a></Link>
        <Link href="/login"><a className={active("/login")}>Log in</a></Link>
        <Link href="/help"><a className={active("/help")}>Help</a></Link>
      </div>
    </div>
  );
}