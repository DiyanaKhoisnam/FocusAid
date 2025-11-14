
import Head from "next/head";
import "../styles/globals.css";
import NavBar from "../components/NavBar";
import PomodoroTimer from "../components/PomodoroTimer";
import ChatBot from "../components/ChatBot";

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
        /* Light beige background with purple buttons */
        html,body,#__next { min-height:100%; }
        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          background: #E0F2FE !important;
          color: #1F2937 !important;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .container {
          max-width:1200px;
          margin:28px auto;
          padding:22px;
          background: rgba(224, 242, 254, 0.0);
        }
        .topbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:6px; }
        .logo { width:54px; height:54px; border-radius:12px; background: #9067C6; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:800; }
        .h1 { font-size:36px; font-weight:800; margin:6px 0; color: #1F2937; }
        .card { padding:24px; border-radius:16px; background: #FFFFFF; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border:1px solid rgba(0, 0, 0, 0.05); }
        .btn.primary { background: #000000; color: #FFFFFF; padding:10px 14px; border-radius:10px; border: none; font-weight:700; }
        /* highlight tokens so colorization is visible */
        .tok.NOUN { color:#7C3AED; font-weight:700; }
        .tok.VERB { color:#9067C6; }
      `}</style>

      <ChatBot />
      <PomodoroTimer />
      <div className="container" style={{paddingTop:0}}>
        <NavBar />
        <main style={{ marginTop: 0 }}>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}