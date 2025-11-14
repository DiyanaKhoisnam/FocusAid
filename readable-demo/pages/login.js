// pages/login.js
import { useState } from "react";

export default function Login(){
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  function submit(e){
    e.preventDefault();
    alert("Demo login — not connected. Email: " + email);
  }
  return (
    <div style={{marginTop:18}}>
      <div className="card" style={{maxWidth:520}}>
        <h2>Log in</h2>
        <p className="small">Demo login for presentation (no backend).</p>
        <form onSubmit={submit}>
          <label className="small">Email</label><br/>
          <input style={{width:"100%", padding:8, marginTop:6, marginBottom:10}} value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="small">Password</label><br/>
          <input type="password" style={{width:"100%", padding:8, marginTop:6}} value={pw} onChange={e=>setPw(e.target.value)} />
          <div style={{marginTop:12, display:"flex", gap:8}}>
            <button className="btn primary" type="submit">Log in</button>
            <button className="btn" type="button" onClick={()=>{ setEmail(""); setPw(""); }}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
}