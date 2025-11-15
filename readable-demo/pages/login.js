// pages/login.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiRequest, getErrorMessage, setAuthToken } from "../lib/api";

export default function Login(){
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(true); // Show register form by default
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validateRegister() {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateRegister()) {
      return;
    }
    setLoading(true);

    try {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Registration successful - switch to login
        setSuccess("Account created successfully! Please sign in.");
        setIsRegister(false);
        setError("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      } else {
        const errorMessage = await getErrorMessage(response);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Signup error:", err);
      const errorMsg = err.message || err.toString();
      if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
        setError(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE_URL}`);
      } else {
        setError(`Connection error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e){
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns { access_token, token_type }
        if (data.access_token) {
          setAuthToken(data.access_token);
          setSuccess("Login successful! Redirecting...");
          // Redirect to home page after a brief delay
          setTimeout(() => {
            router.push("/");
          }, 500);
        } else {
          setError("Login successful but no token received");
        }
      } else {
        const errorMessage = await getErrorMessage(response);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.message || err.toString();
      if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
        setError(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE_URL}`);
      } else {
        setError(`Connection error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{marginTop:18, display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh"}}>
      <div className="card" style={{maxWidth:480, width:"100%"}}>
        <div style={{textAlign:"center", marginBottom:24}}>
          <h2 style={{margin:0, marginBottom:8}}>
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="small" style={{margin:0}}>
            {isRegister ? "Join FocusAid and start your learning journey" : "Sign in to your FocusAid account"}
          </p>
        </div>

        {/* Toggle between Register and Login */}
        <div style={{display:"flex", gap:8, marginBottom:24, background:"var(--bg)", padding:4, borderRadius:10}}>
          <button
            onClick={() => {
              setIsRegister(true);
              setError("");
              setSuccess("");
            }}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"none",
              background: isRegister ? "var(--orange)" : "transparent",
              color: isRegister ? "#FFFFFF" : "var(--text)",
              fontWeight:600,
              cursor:"pointer",
              transition:"all 0.2s"
            }}
          >
            Register
          </button>
          <button
            onClick={() => {
              setIsRegister(false);
              setError("");
              setSuccess("");
            }}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"none",
              background: !isRegister ? "var(--orange)" : "transparent",
              color: !isRegister ? "#FFFFFF" : "var(--text)",
              fontWeight:600,
              cursor:"pointer",
              transition:"all 0.2s"
            }}
          >
            Login
          </button>
        </div>

        {success && (
          <div style={{
            padding:"12px 16px",
            marginBottom:16,
            borderRadius:10,
            background:"rgba(34, 197, 94, 0.1)",
            border:"1px solid rgba(34, 197, 94, 0.2)",
            color:"#16a34a",
            fontSize:14
          }}>
            {success}
          </div>
        )}

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

        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <div style={{marginBottom:18}}>
              <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
          )}

          <div style={{marginBottom:18}}>
            <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div style={{marginBottom:20}}>
            <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
              Password
            </label>
            <div style={{position:"relative"}}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
            {isRegister && (
              <p className="small" style={{marginTop:6, marginBottom:0}}>
                Must be at least 8 characters long
              </p>
            )}
            {!isRegister && (
              <div style={{marginTop:8, textAlign:"right"}}>
                <Link href="/forgot-password" style={{fontSize:13, color:"var(--orange)", textDecoration:"none", fontWeight:600}}>
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          {isRegister && (
            <div style={{marginBottom:20}}>
              <label style={{display:"block", marginBottom:8, fontWeight:600, fontSize:14, color:"var(--text)"}}>
                Confirm Password
              </label>
              <div style={{position:"relative"}}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
          )}

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
            {loading 
              ? (isRegister ? "Creating Account..." : "Signing in...") 
              : (isRegister ? "Create Account" : "Sign In")
            }
          </button>
        </form>
      </div>
    </div>
  );
}