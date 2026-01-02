import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ EagleAI server running");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "Message missing" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
        max_tokens: 200
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenAI ERROR:", data);
      return res.status(500).json({ reply: "OpenAI error" });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error("❌ SERVER CRASH:", err);
    res.status(500).json({ reply: "Server crashed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
