import React, { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are TABI（旅）, a warm and knowledgeable AI concierge for travelers visiting Japan. 

Your personality:
- Friendly, enthusiastic, and genuinely helpful
- You speak natural English but sprinkle in simple Japanese words with translations (e.g., "Let's find a great izakaya (居酒屋 - Japanese pub)!")
- You're like a knowledgeable local friend, not a formal tour guide

You help with:
- Restaurant & food recommendations (must-try dishes, hidden gems, dietary restrictions)
- Attractions & itinerary planning (famous spots + off-the-beaten-path)
- Transportation (trains, IC cards, taxis, apps to download)
- Cultural tips & etiquette (onsen rules, tipping culture, manners)
- Practical help (emergency numbers, hospital, WiFi, SIM cards, currency)
- Shopping & souvenirs

When analyzing photos:
- If it's FOOD: identify the dish, explain what it is, typical price range, how to order it, and if it's must-try
- If it's a SIGN/MENU in Japanese: translate it and explain what it means practically
- If it's a PLACE: identify the location if possible, explain what it is, and give insider tips
- If it's something else Japan-related: give helpful context for a traveler

Rules:
- Keep responses concise but warm — bullet points when listing options
- Always ask clarifying questions if needed (budget, location, dietary needs)
- Add fun facts about Japan when relevant
- Use relevant emoji sparingly to add warmth
- If asked about something outside Japan travel, gently redirect back to helping with their Japan trip`;

const SUGGESTIONS = [
  "🍜 Best ramen in Tokyo?",
  "🚄 How do I use the Shinkansen?",
  "⛩️ Must-see spots in Kyoto",
  "💴 How much cash should I carry?",
  "📱 What apps do I need?",
  "🛁 Onsen etiquette tips",
];

const WelcomeMessage = {
  role: "assistant",
  content: `Irasshaimase（いらっしゃいませ）— Welcome to Japan! 🗾

I'm **TABI**, your personal Japan concierge. Whether you're navigating the Tokyo subway, hunting for the perfect bowl of ramen, or figuring out onsen etiquette — I've got you covered.

📸 **New!** Send me a photo of food, signs, or menus and I'll tell you everything about it!

What can I help you with today?`,
};

export default function App() {
  const [messages, setMessages] = useState([WelcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if ((!userText && !imageBase64) || loading) return;
    setInput("");

    const userMsg = {
      role: "user",
      content: userText || "What is this?",
      image: imagePreview,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const currentImage = imageBase64;
    const currentText = userText || "What is this? Please identify this and give me helpful travel tips about it.";
    removeImage();

    try {
      const apiMessages = newMessages
        .filter((m) => m !== WelcomeMessage)
        .map((m) => {
          if (m.image) {
            return {
              role: m.role,
              content: [
                { type: "image", source: { type: "base64", media_type: "image/jpeg", data: m.image.split(",")[1] } },
                { type: "text", text: m.content },
              ],
            };
          }
          return { role: m.role, content: m.content };
        });

      if (currentImage) {
        const lastMsg = apiMessages[apiMessages.length - 1];
        if (lastMsg && lastMsg.role === "user" && typeof lastMsg.content === "string") {
          apiMessages[apiMessages.length - 1] = {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: currentImage } },
              { type: "text", text: currentText },
            ],
          };
        }
      }

      if (apiMessages.length === 0 || apiMessages[0].role !== "user") {
        apiMessages.unshift({ role: "user", content: currentText });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sumimasen（すみません）— something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderContent = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <li key={i} dangerouslySetInnerHTML={{ __html: line.slice(2) }} style={{ marginBottom: 4 }} />;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c1a 0%, #1a0a2e 40%, #0d1f3c 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "16px",
    }}>
      <div style={{
        position: "fixed", inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", height: "calc(100vh - 32px)", maxHeight: 800 }}>
        <div style={{
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none",
          borderRadius: "20px 20px 0 0", padding: "20px 28px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, #e8363d, #c0392b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 0 20px rgba(232,54,61,0.4)", flexShrink: 0,
          }}>🗾</div>
          <div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold", letterSpacing: "0.05em" }}>
              TABI <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "normal" }}>旅</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: "0.08em" }}>YOUR JAPAN CONCIERGE · 日本旅行ガイド</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.06em" }}>ONLINE</span>
          </div>
        </div>

        <div style={{
          flex: 1, overflowY: "auto",
          background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "none",
          padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16,
          scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: 10, alignItems: "flex-end",
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #e8363d, #c0392b)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>🗾</div>
              )}
              <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 8, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.image && (
                  <img src={msg.image} alt="uploaded" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 12, border: "2px solid rgba(232,54,61,0.4)" }} />
                )}
                <div style={{
                  background: msg.role === "user" ? "linear-gradient(135deg, #e8363d, #c0392b)" : "rgba(255,255,255,0.07)",
                  border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "12px 16px", color: "#fff", fontSize: 14.5, lineHeight: 1.6,
                  boxShadow: msg.role === "user" ? "0 4px 20px rgba(232,54,61,0.3)" : "none",
                }}>
                  {renderContent(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🗾</div>
              <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px 18px 18px 4px", padding: "14px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "none", padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "6px 14px", color: "rgba(255,255,255,0.75)", fontSize: 12.5, cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em" }}
              onMouseEnter={e => { e.target.style.background = "rgba(232,54,61,0.2)"; e.target.style.borderColor = "rgba(232,54,61,0.4)"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >{s}</button>
            ))}
          </div>
        )}

        {imagePreview && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderBottom: "none", padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <img src={imagePreview} alt="preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "2px solid rgba(232,54,61,0.4)" }} />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>📸 Photo ready to send</span>
            <button onClick={removeImage} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 24, height: 24, color: "#fff", cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.06)", borderRadius: "0 0 20px 20px", padding: "16px 20px", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current?.click()} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: imagePreview ? "rgba(232,54,61,0.3)" : "rgba(255,255,255,0.08)", border: imagePreview ? "1px solid rgba(232,54,61,0.6)" : "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "all 0.2s" }} title="Upload photo">📷</button>

          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={imagePreview ? "Add a message or just send the photo..." : "Ask me anything about Japan... 🗾"}
            rows={1} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14.5, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
          />
          <button onClick={() => sendMessage()} disabled={loading || (!input.trim() && !imageBase64)} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: loading || (!input.trim() && !imageBase64) ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #e8363d, #c0392b)", border: "none", cursor: loading || (!input.trim() && !imageBase64) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.2s", boxShadow: loading || (!input.trim() && !imageBase64) ? "none" : "0 4px 16px rgba(232,54,61,0.4)", color: "#fff" }}>↑</button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        * { box-sizing: border-box; }
        textarea::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
