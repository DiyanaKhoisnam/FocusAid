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
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:16}}>
            <div style={{
              background:"var(--orange)", 
              padding:"6px 12px", 
              borderRadius:999, 
              fontWeight:700, 
              color:"#FFFFFF",
              fontSize:13
            }}>
              1:1 TUTORING FOR EVERY CHILD
            </div>
          </div>

          <h1 className="h1" style={{fontSize:"56px", lineHeight:"1.1", marginBottom:20}}>
            Supporting Children with Dyslexia & Dyscalculia
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
            border:"2px dashed var(--orange)"
          }}>
            <div style={{textAlign:"center", color:"var(--muted)"}}>
              <div style={{fontSize:48, marginBottom:12}}>📚</div>
              <div style={{fontSize:14}}>Illustration Area</div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Cards Section */}
      <div style={{marginTop:60, marginBottom:60}}>
        <h2 style={{fontSize:"36px", fontWeight:800, marginBottom:16, color:"var(--text)"}}>
          Practical strategies, resources, and guidance for parents and teachers
        </h2>
        <p style={{fontSize:"18px", color:"var(--muted)", marginBottom:32, maxWidth:"800px"}}>
          We provide practical strategies, helpful resources, and clear guidance designed to support both parents and teachers in helping children with dyslexia and dyscalculia succeed.
        </p>
        
        <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:24, marginTop:32}}>
          <div className="card" style={{background:"var(--card)"}}>
            <div style={{fontSize:12, fontWeight:700, color:"var(--orange)", marginBottom:12, letterSpacing:"1px"}}>
              SUPPORT FOR PARENTS
            </div>
            <h3 style={{fontSize:"24px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>
              I'm a Parent - Get Support for My Child
            </h3>
            <div style={{
              width:"100%",
              height:"200px",
              background:"linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(167, 139, 250, 0.1))",
              borderRadius:12,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              marginTop:16
            }}>
              <div style={{textAlign:"center", color:"var(--muted)"}}>
                <div style={{fontSize:48}}>👨‍👩‍👧‍👦</div>
              </div>
            </div>
          </div>

          <div className="card" style={{background:"var(--card)"}}>
            <div style={{fontSize:12, fontWeight:700, color:"var(--orange)", marginBottom:12, letterSpacing:"1px"}}>
              CERTIFICATION FOR EDUCATORS
            </div>
            <h3 style={{fontSize:"24px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>
              I'm an Educator - Become a Certified Dyslexia Specialist
            </h3>
            <div style={{
              width:"100%",
              height:"200px",
              background:"linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(167, 139, 250, 0.1))",
              borderRadius:12,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              marginTop:16
            }}>
              <div style={{textAlign:"center", color:"var(--muted)"}}>
                <div style={{fontSize:48}}>🎓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div style={{marginTop:60, marginBottom:60, background:"var(--bg)", padding:"40px", borderRadius:20}}>
        <h2 style={{fontSize:"36px", fontWeight:800, marginBottom:32, color:"var(--text)"}}>
          Tailored Support for Children, Parents, and Educators
        </h2>
        
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:24}}>
          <div className="card" style={{background:"var(--card-purple)", border:"none"}}>
            <div style={{fontSize:32, marginBottom:16}}>📖</div>
            <h3 style={{fontSize:"20px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>Reading support</h3>
            <p style={{fontSize:15, color:"var(--muted)", lineHeight:"1.6", marginBottom:20}}>
              Tailored exercises and therapies designed to improve reading, writing, and spelling skills for children with dyslexia.
            </p>
            <button className="btn ghost" style={{width:"100%"}}>Learn More</button>
          </div>

          <div className="card" style={{background:"var(--card-blue)", border:"none"}}>
            <div style={{fontSize:32, marginBottom:16}}>🔢</div>
            <h3 style={{fontSize:"20px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>Math Confidence</h3>
            <p style={{fontSize:15, color:"var(--muted)", lineHeight:"1.6", marginBottom:20}}>
              Step-by-step guidance, games, and activities that help children with dyscalculia understand numbers and enjoy learning math.
            </p>
            <button className="btn ghost" style={{width:"100%"}}>Learn More</button>
          </div>

          <div className="card" style={{background:"var(--card-yellow)", border:"none"}}>
            <div style={{fontSize:32, marginBottom:16}}>👨‍👩‍👧</div>
            <h3 style={{fontSize:"20px", fontWeight:700, marginBottom:12, color:"var(--text)"}}>Parent Resources</h3>
            <p style={{fontSize:15, color:"var(--muted)", lineHeight:"1.6", marginBottom:20}}>
              Guides, workshops, and ongoing advice that empower parents to help their children thrive both at home and at school.
            </p>
            <button className="btn ghost" style={{width:"100%"}}>Learn More</button>
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
          <div className="card">
            <h3>Before → After</h3>
            <p className="small">Original text on left, simplified on right — use the input below to test.</p>
          </div>
          <div className="card">
            <h3>Readable Output</h3>
            <div id="__out" className="output small"><em>Press Simplify to generate color-coded output here.</em></div>
          </div>
          <div className="card">
            <h3>Accessibility</h3>
            <p className="small">Color-coded tokens, adjustable font and spacing, multiple theme presets for visual comfort.</p>
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