// pages/signup.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiRequest, getErrorMessage } from "../lib/api";

export default function Signup(){
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError("");
  }

  function validateForm() {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (formData.name.length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }

    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  }

  async function handleSubmit(e){
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Backend only requires email and password (name is kept for UX but not sent)
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        // Registration successful - redirect to login page
        // User needs to login after registration
        router.push("/login?registered=true");
      } else {
        const errorMessage = await getErrorMessage(response);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to connect to server. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{marginTop:18, display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh"}}>
      <div className="card" style={{maxWidth:480, width:"100%"}}>
        <div style={{textAlign:"center", marginBottom:24}}>
          <h2 style={{margin:0, marginBottom:8}}>Create Account</h2>
          <p className="small" style={{margin:0}}>Join FocusAid and start your learning journey</p>
        </div>

        {error && (
          <div style={{
            padding:"12px 16px",
            marginBottom:16,
            borderRadius:10,
            background:"rgba(239, 68, 68, 0.1)",
            border:"1px solid rgba(239, 68, 68, 0.2)",
            color:"#dc2626",
            fontSize:14
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:18}}>
            <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={{
                width:"100%",
                padding:"12px 16px",
                borderRadius:10,
                border:"1px solid rgba(0, 0, 0, 0.1)",
                fontSize:15,
                fontFamily:"inherit",
                background:"#FFFFFF",
                color:"#1F2937",
                transition:"all 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--orange)"; e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(0, 0, 0, 0.1)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{marginBottom:18}}>
            <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={{
                width:"100%",
                padding:"12px 16px",
                borderRadius:10,
                border:"1px solid rgba(0, 0, 0, 0.1)",
                fontSize:15,
                fontFamily:"inherit",
                background:"#FFFFFF",
                color:"#1F2937",
                transition:"all 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--orange)"; e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(0, 0, 0, 0.1)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{marginBottom:18}}>
            <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
              Password
            </label>
            <div style={{position:"relative"}}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
              style={{
                width:"100%",
                padding:"12px 16px",
                paddingRight:48,
                borderRadius:10,
                border:"1px solid rgba(0, 0, 0, 0.1)",
                fontSize:15,
                fontFamily:"inherit",
                background:"#FFFFFF",
                color:"#1F2937",
                transition:"all 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--orange)"; e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(0, 0, 0, 0.1)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position:"absolute",
                  right:12,
                  top:"50%",
                  transform:"translateY(-50%)",
                  background:"none",
                  border:"none",
                  cursor:"pointer",
                  color:"var(--muted)",
                  fontSize:13,
                  fontWeight:600
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="small" style={{marginTop:6, marginBottom:0}}>
              Must be at least 8 characters long
            </p>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
              Confirm Password
            </label>
            <div style={{position:"relative"}}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              style={{
                width:"100%",
                padding:"12px 16px",
                paddingRight:48,
                borderRadius:10,
                border:"1px solid rgba(0, 0, 0, 0.1)",
                fontSize:15,
                fontFamily:"inherit",
                background:"#FFFFFF",
                color:"#1F2937",
                transition:"all 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--orange)"; e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(0, 0, 0, 0.1)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position:"absolute",
                  right:12,
                  top:"50%",
                  transform:"translateY(-50%)",
                  background:"none",
                  border:"none",
                  cursor:"pointer",
                  color:"var(--muted)",
                  fontSize:13,
                  fontWeight:600
                }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className="btn primary"
            type="submit"
            disabled={loading}
            style={{
              width:"100%",
              padding:"14px",
              fontSize:16,
              fontWeight:700,
              marginBottom:16,
              opacity:loading ? 0.7 : 1,
              cursor:loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div style={{textAlign:"center", paddingTop:20, borderTop:"1px solid rgba(0,0,0,0.05)"}}>
            <p className="small" style={{margin:0}}>
              Already have an account?{" "}
              <Link href="/login" style={{color:"var(--orange)", textDecoration:"none", fontWeight:700}}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

