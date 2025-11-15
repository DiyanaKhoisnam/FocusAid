// pages/index.js
import { useState } from "react";
import nlp from "compromise";

export default function Home(){
  const [text, setText] = useState("Paste or type an educational paragraph here. Try a long paragraph to see the simplifier in action.");
  const [simplified, setSimplified] = useState("");

  function mockSimplify(t){
    return t.split(/(?<=[.?!])\s+/).map(s=>{
      let r = s.trim();
      if(r.length>160) r = r.slice(0,130) + "…";
      r = r.replace(/\butilize\b/gi,"use").replace(/\bapproximately\b/gi,"about");
      return r;
    }).join(" ");
  }

  function colorize(textStr){
    const doc = nlp(textStr);
    const terms = doc.terms().out("terms");
    if(!terms || terms.length===0) return textStr;
    return terms.map(t=>{
      const w = t.text;
      const tag = (t.tags && t.tags[0]) || "";
      let cls = "tok";
      if(tag.includes("Noun")) cls += " NOUN";
      else if(tag.includes("Verb")) cls += " VERB";
      else if(tag.includes("Adjective")) cls += " ADJ";
      else if(tag.includes("Adverb")) cls += " ADV";
      return `<span class="${cls}">${w}</span>`;
    }).join(" ");
  }

  function simplify(){
    const s = mockSimplify(text);
    setSimplified(s);
    const out = document.getElementById("__out");
    if(out) out.innerHTML = s.split(/\n+/).map(p => `<div style="margin-bottom:12px;padding:12px;border-radius:10px;background:#FFFFFF;border:1px solid var(--p1)">${colorize(p)}</div>`).join("");
  }

  return (
    <div style={{marginTop:0}}>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-left">
          <h1 className="h1" style={{fontSize:"56px", lineHeight:"1.1", marginBottom:20}}>
            Supporting Students with Dyslexia and ADHD
          </h1>
          <p className="lead" style={{fontSize:"18px", lineHeight:"1.6", marginBottom:32, maxWidth:"600px"}}>
            Transform any educational content into dyslexia- and ADHD-friendly formats with our AI-powered platform — offering instant audio narration, smart summaries, and optimized, distraction-free text rendering designed for diverse neurodivergent learners.
          </p>

          <div className="cta-row" style={{gap:16}}>
            <button className="btn primary" style={{padding:"14px 28px", fontSize:"16px"}} onClick={()=>document.getElementById('upload-input').click()}>
              Get Support
            </button>
            <button className="btn ghost" style={{padding:"14px 28px", fontSize:"16px"}} onClick={()=>alert("Learn More (demo)")}>
              Learn More
            </button>
            <input id="upload-input" type="file" accept=".pdf,.txt" style={{display:"none"}} onChange={(e)=>{ const f=e.target.files[0]; if(f) alert("Uploaded: "+f.name); }} />
          </div>
        </div>

        <div className="hero-right" style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
          <div style={{
            width:"100%",
            height:"400px",
            background:"linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(167, 139, 250, 0.1))",
            borderRadius:20,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            border:"2px solid var(--orange)",
            overflow:"hidden",
            position:"relative"
          }}>
            <div style={{
              width:"100%",
              height:"100%",
              backgroundImage:"url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80')",
              backgroundSize:"cover",
              backgroundPosition:"center",
              opacity:0.9,
              filter:"brightness(1.1) saturate(1.2)"
            }} />
            <div style={{
              position:"absolute",
              top:0,
              left:0,
              right:0,
              bottom:0,
              background:"linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(167, 139, 250, 0.2))"
            }} />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div style={{marginTop:60, marginBottom:60, background:"var(--bg)", padding:"40px", borderRadius:20}}>
        <h2 style={{fontSize:"36px", fontWeight:800, marginBottom:32, color:"var(--text)"}}>
          Designed for ADHD and Dyslexic Learners
        </h2>
        
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:24}}>
          <div className="card" style={{background:"var(--card-purple)", border:"none", display:"flex", flexDirection:"column", height:"100%"}}>
            <div style={{fontSize:32, marginBottom:16}}>📖</div>
            <h3 style={{fontSize:"20px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>Reading support</h3>
            <p style={{fontSize:15, color:"var(--muted)", lineHeight:"1.6", marginBottom:20, flex:1}}>
              Tailored tools and features designed to improve reading, writing, and comprehension skills for students with dyslexia.
            </p>
            <button className="btn ghost" style={{width:"100%", marginTop:"auto"}}>Learn More</button>
          </div>

          <div className="card" style={{background:"#A7F3D0", border:"none", display:"flex", flexDirection:"column", height:"100%"}}>
            <div style={{fontSize:32, marginBottom:16}}>🎯</div>
            <h3 style={{fontSize:"20px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>Focus Support</h3>
            <p style={{fontSize:15, color:"var(--muted)", lineHeight:"1.6", marginBottom:20, flex:1}}>
              Tools and strategies designed to help students with ADHD maintain focus, reduce distractions, and improve learning outcomes.
            </p>
            <button className="btn ghost" style={{width:"100%", marginTop:"auto"}}>Learn More</button>
          </div>

          <div className="card" style={{background:"var(--card-yellow)", border:"none", display:"flex", flexDirection:"column", height:"100%"}}>
            <div style={{fontSize:32, marginBottom:16}}>👨‍👩‍👧</div>
            <h3 style={{fontSize:"20px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>Parent Resources</h3>
            <p style={{fontSize:15, color:"var(--muted)", lineHeight:"1.6", marginBottom:20, flex:1}}>
              Guides, workshops, and ongoing advice that empower parents to help their children thrive both at home and at school.
            </p>
            <button className="btn ghost" style={{width:"100%", marginTop:"auto"}}>Learn More</button>
          </div>
        </div>
      </div>

      {/* Text Simplifier Section */}
      <div style={{marginTop:60, marginBottom:60}}>
        <h2 style={{fontSize:"36px", fontWeight:800, marginBottom:16, color:"var(--text)"}}>
          Simplify Your Text
        </h2>
        <p style={{fontSize:"18px", color:"var(--muted)", marginBottom:32}}>
          Use our text simplifier to make educational content more accessible.
        </p>
        
        <div className="grid" style={{gridTemplateColumns:"repeat(3, 1fr)", gap:24, marginBottom:32}}>
          {/* Before → After Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
            border: "2px solid #F59E0B",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "80px",
              height: "80px",
              background: "rgba(245, 158, 11, 0.2)",
              borderRadius: "50%",
            }} />
            <div style={{position: "relative", zIndex: 1}}>
              <div style={{
                fontSize: "32px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>📊</span>
                <h3 style={{margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text)"}}>
                  Before → After
                </h3>
              </div>
              <p style={{fontSize: "14px", color: "var(--muted)", lineHeight: "1.6", marginBottom: "16px"}}>
                See your text transform from complex to simple. Original text on the left, simplified version on the right.
              </p>
              <div style={{
                background: "rgba(255, 255, 255, 0.7)",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(245, 158, 11, 0.3)"
              }}>
                <div style={{display: "flex", gap: "12px", fontSize: "12px"}}>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 700, color: "#92400E", marginBottom: "4px"}}>BEFORE</div>
                    <div style={{color: "#78350F"}}>Complex sentences with difficult words</div>
                  </div>
                  <div style={{fontSize: "20px", color: "#F59E0B"}}>→</div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 700, color: "#92400E", marginBottom: "4px"}}>AFTER</div>
                    <div style={{color: "#78350F"}}>Simple, clear sentences</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Readable Output Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
            border: "2px solid #3B82F6",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "80px",
              height: "80px",
              background: "rgba(59, 130, 246, 0.2)",
              borderRadius: "50%",
            }} />
            <div style={{position: "relative", zIndex: 1}}>
              <div style={{
                fontSize: "32px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>✨</span>
                <h3 style={{margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text)"}}>
                  Readable Output
                </h3>
              </div>
              <p style={{fontSize: "14px", color: "var(--muted)", lineHeight: "1.6", marginBottom: "16px"}}>
                Get color-coded, syntax-highlighted text that's easier to read and understand.
              </p>
              <div id="__out" className="output small" style={{
                background: "rgba(255, 255, 255, 0.8)",
                padding: "16px",
                borderRadius: "8px",
                minHeight: "100px",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                fontSize: "13px",
                lineHeight: "1.6"
              }}>
                <em style={{color: "#6B7280"}}>Press Simplify to generate color-coded output here.</em>
              </div>
              <div style={{
                marginTop: "12px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap"
              }}>
                <div style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1E40AF"
                }}>Color-coded</div>
                <div style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1E40AF"
                }}>Syntax Highlight</div>
                <div style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1E40AF"
                }}>Easy Read</div>
              </div>
            </div>
          </div>

          {/* Accessibility Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
            border: "2px solid #A78BFA",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "80px",
              height: "80px",
              background: "rgba(167, 139, 250, 0.2)",
              borderRadius: "50%",
            }} />
            <div style={{position: "relative", zIndex: 1}}>
              <div style={{
                fontSize: "32px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>♿</span>
                <h3 style={{margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text)"}}>
                  Accessibility
                </h3>
              </div>
              <p style={{fontSize: "14px", color: "var(--muted)", lineHeight: "1.6", marginBottom: "16px"}}>
                Customize text appearance with dyslexia-friendly fonts, spacing, and color themes.
              </p>
              <div style={{
                background: "rgba(255, 255, 255, 0.7)",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(167, 139, 250, 0.3)"
              }}>
                <div style={{display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px"}}>
                  <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <span style={{fontSize: "16px"}}>🔤</span>
                    <span style={{color: "#6B21A8", fontWeight: 600}}>Dyslexia-friendly fonts</span>
                  </div>
                  <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <span style={{fontSize: "16px"}}>📏</span>
                    <span style={{color: "#6B21A8", fontWeight: 600}}>Adjustable spacing</span>
                  </div>
                  <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <span style={{fontSize: "16px"}}>🎨</span>
                    <span style={{color: "#6B21A8", fontWeight: 600}}>Multiple color themes</span>
                  </div>
                  <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <span style={{fontSize: "16px"}}>👁️</span>
                    <span style={{color: "#6B21A8", fontWeight: 600}}>High contrast options</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{marginTop:18}} className="card">
        <label><strong>Type / paste text to simplify</strong></label>
        <textarea style={{width:"100%", minHeight:120, marginTop:8, padding:"12px", borderRadius:10, border:"1px solid rgba(0, 0, 0, 0.1)", background:"#FFFFFF", color:"#1F2937", fontFamily:"inherit", fontSize:15}} value={text} onChange={e=>setText(e.target.value)} />
        <div style={{marginTop:12, display:"flex", gap:8}}>
          <button className="btn primary" onClick={simplify}>Simplify</button>
          <button className="btn" onClick={()=>{ navigator.clipboard.writeText(simplified || text); alert("Copied to clipboard"); }}>Copy</button>
        </div>
      </div>

      <div className="footer" style={{marginTop:60, marginBottom:40}}>Made for HackShetra — FocusAid Platform</div>
    </div>
  );
}