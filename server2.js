// Replace your old server2.js with this
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY missing");
  process.exit(1);
}

app.use(express.json());

// ✅ CORS fixed for Netlify
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://ts-eagleai.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => res.send("✅ EagleAI server running"));

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message missing" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are EagleAI. Reply clearly." },
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 200
      })
    });

    const data = await response.json();
    if (!data?.choices?.length) return res.status(500).json({ reply: "AI error" });

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("❌ CHAT ERROR:", err);
    res.status(500).json({ reply: "Server error" });
  }
});

app.listen(PORT, () => console.log(`🚀 EagleAI running on port ${PORT}`));
