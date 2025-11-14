// pages/help.js
export default function Help(){
  return (
    <div style={{marginTop:18}}>
      <div className="card" style={{maxWidth:820}}>
        <h2>Help & How to demo</h2>
        <p className="small">Quick steps to show judges:</p>
        <ol>
          <li>Open Home, paste a multi-paragraph article, click <strong>Simplify</strong>.</li>
          <li>Switch themes to show accessibility colour palettes.</li>
          <li>Open <em>Log in</em> to show planned auth flow (demo only).</li>
          <li>Download JSON or audio (soon) to demonstrate export features.</li>
        </ol>
        <h3 style={{marginTop:12}}>Notes</h3>
        <ul>
          <li className="small">This demo uses a local mock simplifier for speed. Hook the API in `/api/simplify` to connect real NLP later.</li>
          <li className="small">To enable real TTS downloads, integrate Azure/Google TTS on the backend.</li>
        </ul>
      </div>
    </div>
  );
}