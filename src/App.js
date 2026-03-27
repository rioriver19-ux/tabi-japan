import React, { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPTS = {
  en: `You are TABI（旅）, a warm and knowledgeable AI concierge for travelers visiting Japan. You are NOT a generic travel guide — you are like a well-connected local friend who knows the hidden side of Japan.

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
When a user asks for restaurant/cafe/bar recommendations, include [SEARCH: your search query] in your response.

PHOTO ANALYSIS:
- If it's FOOD: identify boldly, explain, price in yen, how to order
- If it's a SIGN/MENU: translate everything practically
- If it's a PLACE: identify, give insider tips

Always respond in English.`,

  zh: `你是TABI（旅），一位热情、博学的日本旅行AI礼宾员。你不是普通的旅游指南——你就像一个了解日本隐秘一面的当地朋友。

你的个性：
- 友好、热情、真诚地提供帮助
- 用自然的中文回答，偶尔加入日语词汇和翻译
- 像一个博学的本地朋友，而不是正式的导游
- 优先推荐本地、真实的体验，而不是旅游陷阱

你的专长——本地隐藏的日本：
推荐地点时，始终优先考虑：
1. 本地人实际去的地方
2. 街区宝藏——下北泽、高円寺、谷中、中目黑等
3. 时间建议——"避开周末"、"晚上9点后去人少"
4. 诚实的拥挤警告
5. "仅限本地人"的角落——立饮酒吧、商店街、喫茶店、钱汤

重要——实时地点搜索：
当用户询问餐厅/咖啡厅/酒吧推荐时，在回复中包含 [SEARCH: 搜索关键词（用英文）]。

照片分析：
- 食物：大胆识别，解释是什么，日元价格，如何点餐
- 招牌/菜单：翻译所有内容
- 地点：识别，给出内部建议

始终用中文回答。`,

  ko: `당신은 TABI（旅）, 일본을 방문하는 여행자를 위한 따뜻하고 박식한 AI 컨시어지입니다. 당신은 일반적인 여행 가이드가 아니라 일본의 숨겨진 면을 아는 현지 친구 같은 존재입니다.

당신의 성격:
- 친절하고 열정적이며 진정으로 도움이 되는
- 자연스러운 한국어로 말하되 가끔 일본어 단어와 번역을 섞어서
- 격식적인 투어 가이드가 아닌 박식한 현지 친구처럼
- 관광지보다 로컬하고 진정한 경험을 우선시

전문 분야 — 로컬 & 숨겨진 일본:
장소를 추천할 때 항상 우선시:
1. 현지인이 실제로 가는 곳
2. 동네 숨은 명소 — 시모키타자와, 코엔지, 야나카, 나카메구로 등
3. 타이밍 팁 — "주말 피하기", "혼잡한 시간대 피해 오후 9시 이후"
4. 솔직한 혼잡 경고
5. "현지인 전용" 장소 — 서서 마시는 술집, 상점가, 킷사텐, 센토

중요 — 실시간 장소 검색:
사용자가 레스토랑/카페/바 추천을 요청할 때 답변에 [SEARCH: 검색어(영어로)] 포함.

사진 분석:
- 음식: 대담하게 식별, 설명, 엔화 가격, 주문 방법
- 간판/메뉴: 모든 것을 실용적으로 번역
- 장소: 식별, 내부 팁 제공

항상 한국어로 답변하세요.`,
};

const WELCOME_MESSAGES = {
  en: `Irasshaimase（いらっしゃいませ）— Welcome to Japan! 🗾

I'm **TABI**, your personal Japan concierge — specializing in the Japan that locals love.

📸 **Snap & Identify!** Tap the camera to photo any food, sign, or menu.
📍 **Real-time search** — Ask me where to eat or drink and I'll find open places right now!

What can I help you with today?`,

  zh: `欢迎光临（いらっしゃいませ）— 欢迎来到日本！🗾

我是 **TABI**，您的私人日本礼宾员——专注于本地人喜爱的日本。

📸 **拍照识别！** 点击相机拍摄任何食物、招牌或菜单，我来告诉您一切！
📍 **实时搜索** — 询问我去哪里吃饭或喝酒，我会立即找到正在营业的地方！

今天我可以帮您什么？`,

  ko: `이랏샤이마세（いらっしゃいませ）— 일본에 오신 것을 환영합니다！🗾

저는 **TABI**, 당신의 개인 일본 컨시어지입니다 — 현지인이 사랑하는 일본을 전문으로 합니다.

📸 **사진으로 식별！** 카메라를 탭해서 음식, 간판, 메뉴를 찍으면 모든 것을 알려드립니다！
📍 **실시간 검색** — 어디서 먹거나 마실지 물어보면 지금 영업 중인 곳을 찾아드립니다！

오늘 무엇을 도와드릴까요？`,
};

const SUGGESTIONS = {
  en: ["🍜 Best ramen in Tokyo?", "🏘️ Hidden gems in Tokyo?", "🍻 Where locals drink?", "⛩️ Off-beat spots in Kyoto", "☕ Best kissaten cafes?", "🛁 Local sento tips"],
  zh: ["🍜 东京最好的拉面？", "🏘️ 东京隐藏的宝藏？", "🍻 本地人去哪喝酒？", "⛩️ 京都冷门景点", "☕ 最好的喫茶店？", "🛁 本地钱汤攻略"],
  ko: ["🍜 도쿄 최고의 라멘？", "🏘️ 도쿄 숨은 명소？", "🍻 현지인이 가는 술집？", "⛩️ 교토 색다른 명소", "☕ 킷사텐 카페 추천？", "🛁 현지 센토 팁"],
};

const LANG_FLAGS = { en: "🇺🇸", zh: "🇨🇳", ko: "🇰🇷" };

export default function App() {
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME_MESSAGES["en"] }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [placesResults, setPlacesResults] = useState({});
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const switchLang = (newLang) => {
    setLang(newLang);
    setMessages([{ role: "assistant", content: WELCOME_MESSAGES[newLang] }]);
    setPlacesResults({});
  };

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

  const cleanText = (text) => text.replace(/\[SEARCH:\s*.+?\]/g, "").trim();

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
          system: SYSTEM_PROMPTS[lang],
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: "What is this? Please identify this and give me helpful travel tips about it as a visitor to Japan." },
          ]}],
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
      setMessages(prev => [...prev, { role: "assistant", content: "Sumimasen— something went wrong!" }]);
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
      const welcomeContent = WELCOME_MESSAGES[lang];
      const apiMessages = newMessages
        .filter((m) => m.content !== welcomeContent)
        .map((m) => {
          if (m.image) return { role: m.role, content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: m.image.split(",")[1] } },
            { type: "text", text: m.content },
          ]};
          return { role: m.role, content: m.content };
        });
      if (apiMessages.length === 0 || apiMessages[0].role !== "user") {
        apiMessages.unshift({ role: "user", content: userText });
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: SYSTEM_PROMPTS[lang], messages: apiMessages }),
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
      setMessages(prev => [...prev, { role: "assistant", content: "Sumimasen— something went wrong!" }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getPriceLevel = (level) => {
    const levels = { PRICE_LEVEL_FREE: "Free", PRICE_LEVEL_INEXPENSIVE: "¥", PRICE_LEVEL_MODERATE: "¥¥", PRICE_LEVEL_EXPENSIVE: "¥¥¥", PRICE_LEVEL_VERY_EXPENSIVE: "¥¥¥¥" };
    return levels[level] || "";
  };

  const renderContent = (text) => {
    const cleaned = cleanText(text);
    return cleaned.split("\n").map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (line.startsWith("- ") || line.startsWith("• ")) return <li key={i} dangerouslySetInnerHTML={{ __html: line.slice(2) }} style={{ marginBottom: 4 }} />;
      if (line === "") return <br key={i} />;
      return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c1a 0%, #1a0a2e 40%, #0d1f3c 100%)", fontFamily: "'Georgia', 'Times New Roman', serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", height: "calc(100vh - 32px)", maxHeight: 800 }}>
        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none", borderRadius: "20px 20px 0 0", padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 20px rgba(232,54,61,0.4)", flexShrink: 0 }}>🗾</div>
          <div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold", letterSpacing: "0.05em" }}>TABI <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "normal" }}>旅</span></div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.08em" }}>YOUR JAPAN CONCIERGE</div>
          </div>
          {/* Language switcher */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            {Object.entries(LANG_FLAGS).map(([code, flag]) => (
              <button key={code} onClick={() => switchLang(code)} style={{
                width: 36, height: 36, borderRadius: "50%", border: lang === code ? "2px solid rgba(232,54,61,0.8)" : "1px solid rgba(255,255,255,0.15)",
                background: lang === code ? "rgba(232,54,61,0.2)" : "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", boxShadow: lang === code ? "0 0 10px rgba(232,54,61,0.3)" : "none",
              }}>{flag}</button>
            ))}
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", marginLeft: 6 }} />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "none", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
                {msg.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🗾</div>}
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 8, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.image && <img src={msg.image} alt="uploaded" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 12, border: "2px solid rgba(232,54,61,0.4)" }} />}
                  <div style={{ background: msg.role === "user" ? "linear-gradient(135deg, #e8363d, #c0392b)" : "rgba(255,255,255,0.07)", border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", color: "#fff", fontSize: 14.5, lineHeight: 1.6, boxShadow: msg.role === "user" ? "0 4px 20px rgba(232,54,61,0.3)" : "none" }}>
                    {renderContent(msg.content)}
                  </div>
                </div>
              </div>

              {/* Places Cards */}
              {placesResults[i] && (
                <div style={{ marginTop: 12, marginLeft: 40, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.08em" }}>📍 NEARBY PLACES · LIVE DATA</div>
                  {placesResults[i].map((place, j) => (
                    <div key={j} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, overflow: "hidden" }}>
                      {place.photoUrl && <img src={place.photoUrl} alt={place.displayName?.text} style={{ width: "100%", height: 140, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
                      <div style={{ padding: "12px 14px" }}>
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
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          {place.googleMapsUri && <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: "rgba(232,54,61,0.2)", border: "1px solid rgba(232,54,61,0.4)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontSize: 12, textAlign: "center", textDecoration: "none", display: "block" }}>📍 Google Maps</a>}
                          {place.websiteUri && <a href={place.websiteUri} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontSize: 12, textAlign: "center", textDecoration: "none", display: "block" }}>🌐 Official Site</a>}
                        </div>
                      </div>
                    </div>
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
            {SUGGESTIONS[lang].map((s, i) => (
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
          <button onClick={() => cameraInputRef.current?.click()} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</button>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={lang === "zh" ? "问我任何关于日本的问题... 🗾" : lang === "ko" ? "일본에 대해 무엇이든 물어보세요... 🗾" : "Ask me anything about Japan... 🗾"}
            rows={1} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14.5, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
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
