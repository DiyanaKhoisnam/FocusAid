
import Head from "next/head";
import "../styles/globals.css";
import NavBar from "../components/NavBar";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>FocusAid - Read Better</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Inline global fallback styles — this will DEFINITELY apply
          so you can see the colored design while we debug your globals.css */}
      <style jsx global>{`
        /* IMPORTANT: minimal, high-visibility theme to prove styles load */
        html,body,#__next { height:100%; }
        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          background: linear-gradient(180deg,#fff0f8 0%,#fffafc 100%) !important;
          color: #0f172a !important;
        }
        .container {
          max-width:1200px;
          margin:28px auto;
          padding:22px;
          background: rgba(255,255,255,0.0);
        }
        .topbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:6px; }
        .logo { width:54px; height:54px; border-radius:12px; background: linear-gradient(135deg,#9b6bff,#ff86d1); color:white; display:flex; align-items:center; justify-content:center; font-weight:800; }
        .h1 { font-size:36px; font-weight:800; margin:6px 0; background: linear-gradient(90deg,#9b6bff,#ff86d1); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .card { padding:16px; border-radius:12px; background: rgba(255,255,255,0.95); box-shadow: 0 14px 40px rgba(12,18,29,0.06); border:1px solid rgba(0,0,0,0.03); }
        .btn.primary { background: linear-gradient(90deg,#9b6bff,#ff86d1); color: #fff; padding:10px 14px; border-radius:10px; border: none; font-weight:700; }
        /* highlight tokens so colorization is visible */
        .tok.NOUN { color:#ff86d1; font-weight:700; }
        .tok.VERB { color:#9b6bff; }
      `}</style>

      <div className="container">
        <div className="topbar">
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div className="logo">R</div>
            <div>
              <div style={{fontWeight:800}}>Readable</div>
              <div style={{fontSize:13,color:"#6b7280"}}>Demo</div>
            </div>
          </div>

          {/* simple nav fallback if NavBar fails */}
          <div style={{display:"flex", gap:10, alignItems:"center"}}>
            <a href="/" style={{textDecoration:"none", padding:"6px 10px", borderRadius:8}}>Home</a>
            <a href="/login" style={{textDecoration:"none", padding:"6px 10px", borderRadius:8}}>Log in</a>
            <a href="/help" style={{textDecoration:"none", padding:"6px 10px", borderRadius:8}}>Help</a>
          </div>
        </div>

        <main style={{ marginTop: 12 }}>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}