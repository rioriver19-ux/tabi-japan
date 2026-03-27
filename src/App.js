import React, { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are TABI（旅）, a warm and knowledgeable AI concierge for travelers visiting Japan. You are NOT a generic travel guide — you are like a well-connected local friend who knows the hidden side of Japan.

Your personality:
- Friendly, enthusiastic, and genuinely helpful
- You speak natural English but sprinkle in simple Japanese words with translations
- You're like a knowledgeable local friend, not a formal tour guide
- You prioritize LOCAL, AUTHENTIC experiences over tourist traps

YOUR SPECIALTY — LOCAL & HIDDEN JAPAN:
When recommending places, ALWAYS prioritize:
1. Places locals actually go (not tourist spots unless specifically asked)
2. Neighborhood gems — mention specific areas like Shimokitazawa, Koenji, Yanaka, Nakameguro, Nishiogikubo etc.
3. Timing tips — "avoid weekends", "go after 9pm when the rush dies down"
4. Honest crowd warnings — if a place has gone too mainstream, say so
5. The "locals only" angle — standing bars, shotengai, kissaten, sento

IMPORTANT — REAL-TIME PLACE SEARCH:
When a user asks for restaurant/cafe/bar recommendations or asks "where to eat/drink/go", you MUST include the special tag [SEARCH: your search query] somewhere in your response. This will trigger a real-time Google Places search.

Examples:
- User asks "best ramen in Shinjuku" → include [SEARCH: best ramen Shinjuku Tokyo]
- User asks "local bar in Shimokitazawa" → include [SEARCH: local izakaya bar Shimokitazawa Tokyo]
- User asks "coffee shop in Kyoto" → include [SEARCH: specialty coffee Kyoto]
- User asks "hidden gems in Tokyo" → include [SEARCH: local hidden gem restaurant Tokyo]

Format your response naturally, then add the search tag. The search results will be shown as cards below your message.

PHOTO ANALYSIS:
- If it's FOOD: identify boldly (e.g. "🍜 This is Tonkotsu Ramen!"), explain, price in yen, how to order
- If it's a SIGN/MENU: translate everything practically
- If it's a PLACE: identify, give insider tips

Rules:
- Keep responses concise but warm
- Bullet points when listing options  
- Use emoji sparingly
- If asked about something outside Japan travel, gently redirect`;

const SUGGESTIONS = [
  "🍜 Best ramen in Tokyo?",
  "🏘️ Hidden gems in Tokyo?",
  "🍻 Where locals drink?",
  "⛩️ Off-beat spots in Kyoto",
  "☕ Best kissaten cafes?",
  "🛁 Local sento tips",
];

const WelcomeMessage = {
  role: "assistant",
  content: `Irasshaimase（いらっしゃいませ）— Welcome to Japan! 🗾

I'm **TABI**, your personal Japan concierge — specializing in the Japan that locals love.

📸 **Snap & Identify!** Tap the camera to photo any food, sign, or menu.
📍 **Real-time search** — Ask me where to eat or drink and I'll find open places right now!

What can I help you with today?`,
};

export default function App() {
  const [messages, setMessages] = useState([WelcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [placesResults, setPlacesResults] = useState({});
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const searchPlaces = async (query, messageIndex) => {
    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.places && data.places.length > 0) {
        setPlacesResults(prev => ({ ...prev, [messageIndex]: data.places }));
      }
    } catch (err) {
      console.error("Places search failed:", err);
    }
  };

  const extractSearchQuery = (text) => {
    const match = text.match(/\[SEARCH:\s*(.+?)\]/);
    return match ? match[1].trim() : null;
  };

  const cleanText = (text) => {
    return text.replace(/\[SEARCH:\s*.+?\]/g, "").trim();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result;
      autoSendImage(result.split(",")[1], result);
    };
    reader.readAsDataURL(file);
  };

  const autoSendImage = async (base64, preview) => {
    const userMsg = { role: "user", content: "What is this?", image: preview };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              { type: "text", text: "What is this? Please identify this and give me helpful travel tips about it as a visitor to Japan." },
            ],
          }],
        }),
      });
      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't get a response.";
      setMessages(prev => {
        const newMessages = [...prev, { role: "assistant", content: reply }];
        const idx = newMessages.length - 1;
        const searchQuery = extractSearchQuery(reply);
        if (searchQuery) searchPlaces(searchQuery, idx);
        return newMessages;
      });
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sumimasen（すみません）— something went wrong!" }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg = { role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

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

      if (apiMessages.length === 0 || apiMessages[0].role !== "user") {
        apiMessages.unshift({ role: "user", content: userText });
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
      
      setMessages(prev => {
        const newMsgs = [...prev, { role: "assistant", content: reply }];
        const idx = newMsgs.length - 1;
        const searchQuery = extractSearchQuery(reply);
        if (searchQuery) searchPlaces(searchQuery, idx);
        return newMsgs;
      });
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sumimasen（すみません）— something went wrong!" }]);
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

  const getPriceLevel = (level) => {
    const levels = { PRICE_LEVEL_FREE: "Free", PRICE_LEVEL_INEXPENSIVE: "¥", PRICE_LEVEL_MODERATE: "¥¥", PRICE_LEVEL_EXPENSIVE: "¥¥¥", PRICE_LEVEL_VERY_EXPENSIVE: "¥¥¥¥" };
    return levels[level] || "";
  };

  const renderContent = (text) => {
    const cleaned = cleanText(text);
    const lines = cleaned.split("\n");
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c1a 0%, #1a0a2e 40%, #0d1f3c 100%)", fontFamily: "'Georgia', 'Times New Roman', serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", height: "calc(100vh - 32px)", maxHeight: 800 }}>
        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none", borderRadius: "20px 20px 0 0", padding: "20px 28px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 0 20px rgba(232,54,61,0.4)", flexShrink: 0 }}>🗾</div>
          <div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold", letterSpacing: "0.05em" }}>TABI <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "normal" }}>旅</span></div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: "0.08em" }}>YOUR JAPAN CONCIERGE · 日本旅行ガイド</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.06em" }}>ONLINE</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "none", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🗾</div>
                )}
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 8, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.image && <img src={msg.image} alt="uploaded" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 12, border: "2px solid rgba(232,54,61,0.4)" }} />}
                  <div style={{ background: msg.role === "user" ? "linear-gradient(135deg, #e8363d, #c0392b)" : "rgba(255,255,255,0.07)", border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", color: "#fff", fontSize: 14.5, lineHeight: 1.6, boxShadow: msg.role === "user" ? "0 4px 20px rgba(232,54,61,0.3)" : "none" }}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              </div>

              {/* Places Cards */}
              {placesResults[i] && (
                <div style={{ marginTop: 12, marginLeft: 40, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.08em", marginBottom: 4 }}>📍 NEARBY PLACES · LIVE DATA</div>
                  {placesResults[i].map((place, j) => (
                    <a key={j} href={place.googleMapsUri} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>{place.displayName?.text}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                            {place.rating && <span style={{ background: "rgba(232,54,61,0.3)", color: "#fff", fontSize: 12, padding: "2px 8px", borderRadius: 20 }}>⭐ {place.rating}</span>}
                            {place.priceLevel && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{getPriceLevel(place.priceLevel)}</span>}
                          </div>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>{place.formattedAddress}</div>
                        {place.currentOpeningHours && (
                          <div style={{ marginTop: 6, fontSize: 12, color: place.currentOpeningHours.openNow ? "#4ade80" : "#f87171" }}>
                            {place.currentOpeningHours.openNow ? "● Open now" : "● Closed now"}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🗾</div>
              <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px 18px 18px 4px", padding: "14px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j * 0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
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

        {/* Input */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.06)", borderRadius: "0 0 20px 20px", padding: "16px 20px", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageSelect} style={{ display: "none" }} />
          <button onClick={() => cameraInputRef.current?.click()} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "all 0.2s" }}>📷</button>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask me anything about Japan... 🗾" rows={1} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14.5, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: loading || !input.trim() ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #e8363d, #c0392b)", border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.2s", boxShadow: loading || !input.trim() ? "none" : "0 4px 16px rgba(232,54,61,0.4)", color: "#fff" }}>↑</button>
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
