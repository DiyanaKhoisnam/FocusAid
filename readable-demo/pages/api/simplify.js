// pages/api/simplify.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { text, level } = req.body || {};
  if (!text) return res.status(400).json({ error: "Missing text" });

  const HF_API_KEY = process.env.HF_API_KEY;
  if (!HF_API_KEY) return res.status(500).json({ error: "Missing HF_API_KEY in environment" });

  const prefix = level === "easy" ? "simplify: " : level === "medium" ? "paraphrase: " : "simplify minimally: ";
  const payload = { inputs: prefix + text, options: { wait_for_model: true } };

  try {
    const hfRes = await fetch("https://api-inference.huggingface.co/models/t5-small", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!hfRes.ok) {
      const txt = await hfRes.text();
      return res.status(502).json({ error: "HF Inference error", details: txt });
    }

    const data = await hfRes.json();
    let simplified = "";
    if (Array.isArray(data) && data[0] && data[0].generated_text) simplified = data[0].generated_text;
    else if (data.generated_text) simplified = data.generated_text;
    else simplified = typeof data === "string" ? data : JSON.stringify(data);

    return res.status(200).json({ simplified });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}