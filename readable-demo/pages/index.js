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
    if(out) out.innerHTML = s.split(/\n+/).map(p => `<div style="margin-bottom:12px;padding:12px;border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,0.9),#fff)">${colorize(p)}</div>`).join("");
  }

  return (
    <div style={{marginTop:18}}>
      <div className="hero">
        <div className="hero-left">
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div style={{background:"linear-gradient(90deg,var(--p3),var(--p2))", padding:"6px 10px", borderRadius:999, fontWeight:700, color:"white"}}>● Empowering learners</div>
          </div>

          <h1 className="h1">FocusAid <span className="mutedline">Making reading easier, one word at a time</span></h1>
          <p className="lead">Transform any educational content into dyslexia- and ADHD-friendly formats with our AI-powered platform — offering instant audio narration, smart summaries, and optimized, distraction-free text rendering designed for diverse neurodivergent learners.</p>

          <div className="cta-row">
            <button className="btn primary" onClick={()=>document.getElementById('upload-input').click()}>Upload Document</button>
            <button className="btn ghost" onClick={()=>alert("Learn More (demo)")} >Learn More</button>
            <input id="upload-input" type="file" accept=".pdf,.txt" style={{display:"none"}} onChange={(e)=>{ const f=e.target.files[0]; if(f) alert("Uploaded: "+f.name); }} />
          </div>

          <div className="features" style={{marginTop:18}}>
            <div className="feature-pill">📄 Smart Text Processing</div>
            <div className="feature-pill">🔊 Audio Narration</div>
            <div className="feature-pill">🧠 AI Summaries</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="float-card">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div style={{fontWeight:800}}>FocusAid Platform</div>
              <div style={{fontSize:12,color:"var(--muted)"}}>Live demo</div>
            </div>

            <div style={{marginTop:12}}>
              <div style={{fontSize:13, color:"var(--muted)"}}>Document Processing</div>
              <div className="progress"><i /></div>
            </div>

            <div className="row">
              <div className="icon doc">DOC</div>
              <div>
                <div style={{fontWeight:700}}>Audio Generation</div>
                <div className="small">High-quality text-to-speech ready</div>
              </div>
            </div>

            <div className="row">
              <div className="icon summary">AI</div>
              <div>
                <div style={{fontWeight:700}}>AI Summary</div>
                <div className="small">“This document explains the water cycle, including evaporation and precipitation...”</div>
              </div>
            </div>

            <div style={{display:"flex", gap:8, marginTop:12}}>
              <button className="btn primary" onClick={()=>alert("Convert (demo)")}>Convert</button>
              <button className="btn" onClick={()=>alert("Preview (demo)")}>Preview</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid">
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

      <div style={{marginTop:18}} className="card">
        <label><strong>Type / paste text to simplify</strong></label>
        <textarea style={{width:"100%", minHeight:120, marginTop:8}} value={text} onChange={e=>setText(e.target.value)} />
        <div style={{marginTop:12, display:"flex", gap:8}}>
          <button className="btn primary" onClick={simplify}>Simplify</button>
          <button className="btn" onClick={()=>{ navigator.clipboard.writeText(simplified || text); alert("Copied to clipboard"); }}>Copy</button>
        </div>
      </div>

      <div className="footer">Made for HackShetra — colorful demo UI</div>
    </div>
  );
}