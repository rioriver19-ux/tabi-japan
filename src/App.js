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
2. Neighborhood gems — Shimokitazawa, Koenji, Yanaka, Nakameguro, Nishiogikubo etc.
3. Timing tips — "avoid weekends", "go after 9pm when the rush dies down"
4. Honest crowd warnings
5. The "locals only" angle — standing bars, shotengai, kissaten, sento

FAMILY & STROLLER FRIENDLY INFO:
When users mention traveling with kids, babies, or strollers, provide:
- Stroller accessibility (elevator availability at stations, ramp access)
- Baby-friendly restaurants (high chairs, kids menus, quiet atmosphere)
- Nursing rooms and diaper changing facilities
- Kid-friendly attractions that aren't overwhelming
- Best times to visit popular spots with young children
- Baby supply stores (Akachan Honpo, BirthDay)

IMPORTANT — YOU MUST ALWAYS DO THIS:
EVERY response about a product, medicine, food, place, or anything visual MUST include [SEARCH: search query here] somewhere in your response. No exceptions. Examples: [SEARCH: Isodine gargle Japan], [SEARCH: best ramen Tokyo], [SEARCH: Japanese convenience store snacks]PLACE NAME FORMATTING:
When mentioning specific places (markets, temples, stations, restaurants, neighborhoods, streets), wrap them in square brackets like this: [Tsukiji Outer Market], [Yanaka Ginza], [Shimokitazawa], [Keio Inokashira Line]. This creates clickable map links for the user.

PHOTO ANALYSIS:
- FOOD: identify boldly, explain, price in yen, how to order
- SIGN/MENU: translate everything practically
- PLACE: identify, give insider tips

Always respond in English.`,

  zh: `你是TABI（旅），一位热情、博学的日本旅行AI礼宾员。你就像一个了解日本隐秘一面的当地朋友。

你的个性：
- 友好、热情、真诚地提供帮助
- 用自然的中文回答，偶尔加入日语词汇和翻译
- 像博学的本地朋友，而不是正式导游
- 优先推荐本地、真实的体验

专长——本地隐藏的日本：
1. 本地人实际去的地方
2. 街区宝藏——下北泽、高円寺、谷中、中目黑等
3. 时间建议——"避开周末"、"晚上9点后去人少"
4. 诚实的拥挤警告
5. 立饮酒吧、商店街、喫茶店、钱汤

亲子/婴儿车出行信息：
当用户提到带孩子、婴儿或婴儿车旅行时，提供：
- 婴儿车无障碍信息（车站电梯、坡道）
- 亲子餐厅（儿童椅、儿童菜单）
- 哺乳室和换尿布设施
- 适合儿童的景点
- 婴儿用品店（赤ちゃん本舗等）

实时地点搜索：
当用户询问推荐时，在回复中包含 [SEARCH: 搜索关键词（英文）]。

地名格式：提到具体地点时（市场、寺庙、车站、餐厅、街道），用方括号包围：[筑地外市场]、[谷中银座]、[下北泽]。

照片分析：食物识别、招牌翻译、地点识别。

始终用中文回答。`,

  ko: `당신은 TABI（旅）, 일본을 방문하는 여행자를 위한 따뜻하고 박식한 AI 컨시어지입니다. 일본의 숨겨진 면을 아는 현지 친구 같은 존재입니다.

당신의 성격:
- 친절하고 열정적이며 진정으로 도움이 되는
- 자연스러운 한국어로 말하되 가끔 일본어 단어 포함
- 현지 친구처럼, 격식적인 가이드가 아닌
- 로컬하고 진정한 경험 우선

전문 분야:
1. 현지인이 실제로 가는 곳
2. 시모키타자와, 코엔지, 야나카, 나카메구로 등
3. 타이밍 팁
4. 솔직한 혼잡 경고
5. 현지인 전용 장소

가족/유모차 여행 정보：
아이, 아기, 유모차를 언급할 때 제공:
- 유모차 접근성 (역 엘리베이터, 경사로)
- 아이 친화적 레스토랑 (유아 의자, 키즈 메뉴)
- 수유실 및 기저귀 교환 시설
- 아이와 함께 가기 좋은 명소
- 아기용품점 (아카짱혼포 등)

실시간 장소 검색:
추천 요청 시 [SEARCH: 검색어(영어로)] 포함.

장소명 형식: 특정 장소를 언급할 때 대괄호로 감싸세요: [츠키지 외시장], [야나카 긴자], [시모키타자와].

사진 분석: 음식 식별, 간판 번역, 장소 식별.

항상 한국어로 답변하세요.`,

  ja: `あなたはTABI（旅）、日本を旅する方々のための温かくて知識豊富なAIコンシェルジュです。一般的な旅行ガイドではなく、日本の隠れた魅力を知るローカルな友人のような存在です。

あなたの個性：
- 親切で熱心、心から役に立とうとする
- 自然な日本語で話し、必要に応じて英語や中国語の説明も添える
- 格式ばったガイドではなく、詳しい地元の友人のように
- 観光地より本物のローカル体験を優先

専門分野——ローカル＆隠れた日本：
1. 地元の人が実際に行く場所
2. 下北沢、高円寺、谷中、中目黒、西荻窪など
3. 時間帯のアドバイス——「週末は避けて」「夜9時以降が空いてる」
4. 正直な混雑情報
5. 立ち飲み、商店街、喫茶店、銭湯

子連れ・ベビーカー情報：
赤ちゃん、子ども、ベビーカーでの旅行について聞かれたら：
- ベビーカーのアクセシビリティ（駅のエレベーター、スロープ）
- 子連れOKのレストラン（ベビーチェア、キッズメニュー）
- 授乳室・おむつ替えスペース
- 子どもと楽しめるスポット
- ベビー用品店（赤ちゃん本舗、バースデイなど）
- 子連れで行くベストな時間帯

重要——リアルタイム場所検索：
レストラン・カフェ・バーなどを聞かれたら、回答に [SEARCH: 検索キーワード（英語）] を含めてください。

場所名フォーマット：具体的な場所を言及するときは角括弧で囲んでください：[築地外市場]、[谷中銀座]、[下北沢]、[京王井の頭線]。これによりクリックできるマップリンクになります。

写真分析：
- 食べ物：大胆に識別、説明、円相場、注文方法
- 看板・メニュー：実用的に翻訳・解説
- 場所：識別して、地元目線のアドバイス

常に日本語で回答してください。`,
};

const WELCOME_MESSAGES = {
  en: `Irasshaimase（いらっしゃいませ）— Welcome to Japan! 🗾

I'm **TABI**, your personal Japan concierge — specializing in the Japan that locals love.

📸 **Snap & Identify!** Tap the camera to photo any food, sign, or menu.
📍 **Real-time search** — Ask me where to eat or drink and I'll find open places right now!
👶 **Traveling with kids?** Ask me about stroller-friendly routes and family spots!

What can I help you with today?`,

  zh: `欢迎光临（いらっしゃいませ）— 欢迎来到日本！🗾

我是 **TABI**，您的私人日本礼宾员——专注于本地人喜爱的日本。

📸 **拍照识别！** 拍摄食物、招牌或菜单，我来告诉您一切！
📍 **实时搜索** — 询问我去哪里吃饭或喝酒！
👶 **带孩子旅行？** 询问我婴儿车友好路线和亲子景点！

今天我可以帮您什么？`,

  ko: `이랏샤이마세（いらっしゃいませ）— 일본에 오신 것을 환영합니다！🗾

저는 **TABI**, 당신의 개인 일본 컨시어지입니다.

📸 **사진으로 식별！** 음식, 간판, 메뉴를 찍으면 모든 것을 알려드립니다！
📍 **실시간 검색** — 어디서 먹거나 마실지 물어보세요！
👶 **아이와 함께？** 유모차 친화적 경로와 가족 명소를 알려드립니다！

오늘 무엇을 도와드릴까요？`,

  ja: `いらっしゃいませ — 日本へようこそ！🗾

私は **TABI**、あなた専属の日本コンシェルジュです。地元の人が愛する日本を専門にご案内します。

📸 **写真で識別！** 食べ物や看板、メニューを撮影すると何でも教えます！
📍 **リアルタイム検索** — 今営業中のお店をすぐに見つけます！
👶 **お子様連れですか？** ベビーカーOKのルートや子連れスポットもお任せ！

今日は何をお手伝いしましょうか？`,
};

const SUGGESTIONS = {
  en: ["🍜 Best ramen in Tokyo?", "🏘️ Hidden gems in Tokyo?", "🍻 Where locals drink?", "⛩️ Off-beat spots in Kyoto", "👶 Stroller-friendly spots?", "☕ Best kissaten cafes?"],
  zh: ["🍜 东京最好的拉面？", "🏘️ 东京隐藏的宝藏？", "🍻 本地人去哪喝酒？", "⛩️ 京都冷门景点", "👶 适合婴儿车的景点？", "☕ 最好的喫茶店？"],
  ko: ["🍜 도쿄 최고의 라멘？", "🏘️ 도쿄 숨은 명소？", "🍻 현지인이 가는 술집？", "⛩️ 교토 색다른 명소", "👶 유모차 친화적 명소？", "☕ 킷사텐 카페 추천？"],
  ja: ["🍜 東京のおすすめラーメン？", "🏘️ 東京の穴場スポット？", "🍻 地元民が行く居酒屋？", "⛩️ 京都の隠れた名所", "👶 ベビーカーOKのスポット？", "☕ おすすめ喫茶店は？"],
};

const LANG_FLAGS = { en: "🇺🇸", zh: "🇨🇳", ko: "🇰🇷", ja: "🇯🇵" };

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("tabi_lang") || "en"; } catch { return "en"; }
  });
  const [messages, setMessages] = useState(() => {
    try {
      const savedLang = localStorage.getItem("tabi_lang") || "en";
      const saved = localStorage.getItem("tabi_messages_" + savedLang);
      return saved ? JSON.parse(saved) : [{ role: "assistant", content: WELCOME_MESSAGES[savedLang] }];
    } catch { return [{ role: "assistant", content: WELCOME_MESSAGES["en"] }]; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [placesResults, setPlacesResults] = useState({});
  const [imageResults, setImageResults] = useState({});
  const [showPlanner, setShowPlanner] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    try { return !localStorage.getItem("tabi_install_dismissed"); } catch { return true; }
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const [plannerForm, setPlannerForm] = useState({ days: "3", area: "Tokyo", style: "local", budget: "moderate", group: "couple" });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    try {
      const msgsToSave = messages.map(m => m.image ? { ...m, image: null } : m);
      localStorage.setItem("tabi_messages_" + lang, JSON.stringify(msgsToSave));
    } catch (e) { console.error("Failed to save:", e); }
  }, [messages, lang]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    try { localStorage.setItem("tabi_install_dismissed", "1"); } catch {}
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismissInstallBanner();
      setDeferredPrompt(null);
    }
  };

  const switchLang = (newLang) => {
    setLang(newLang);
    try { localStorage.setItem("tabi_lang", newLang); } catch {}
    try {
      const saved = localStorage.getItem("tabi_messages_" + newLang);
      setMessages(saved ? JSON.parse(saved) : [{ role: "assistant", content: WELCOME_MESSAGES[newLang] }]);
    } catch {
      setMessages([{ role: "assistant", content: WELCOME_MESSAGES[newLang] }]);
    }
    setPlacesResults({});
  };

  const clearHistory = () => {
    try { localStorage.removeItem("tabi_messages_" + lang); } catch {}
    setMessages([{ role: "assistant", content: WELCOME_MESSAGES[lang] }]);
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
const searchImages = async (query, messageIndex) => {
    try {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        setImageResults(prev => ({ ...prev, [messageIndex]: data.images }));
      }
    } catch (err) {
      console.error("Image search failed:", err);
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
      autoSendImage(ev.target.result.split(",")[1], ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const autoSendImage = async (base64, preview) => {
    setMessages(prev => [...prev, { role: "user", content: "What is this?", image: preview }]);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: SYSTEM_PROMPTS[lang],
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: "What is this? Please identify this and give me helpful travel tips about it as a visitor to Japan." },
          ]}],
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry!";
      setMessages(prev => {
        const newMsgs = [...prev, { role: "assistant", content: reply }];
        const q = extractSearchQuery(reply);
        if (q) searchPlaces(q, newMsgs.length - 1);
        if (q) searchImages(q, newMsgs.length - 1);
        else searchImages(userText, newMsgs.length - 1);
        return newMsgs;
      });
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Sumimasen— something went wrong!" }]); }
    finally { setLoading(false); }
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const welcomeContent = WELCOME_MESSAGES[lang];
      const apiMessages = newMessages
        .filter(m => m.content !== welcomeContent)
        .map(m => m.image
          ? { role: m.role, content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: m.image.split(",")[1] } }, { type: "text", text: m.content }] }
          : { role: m.role, content: m.content });
      if (!apiMessages.length || apiMessages[0].role !== "user") apiMessages.unshift({ role: "user", content: userText });
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: SYSTEM_PROMPTS[lang], messages: apiMessages }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry!";
      setMessages(prev => {
        const newMsgs = [...prev, { role: "assistant", content: reply }];
        const q = extractSearchQuery(reply);
        if (q) searchPlaces(q, newMsgs.length - 1);
        if (q) searchImages(q, newMsgs.length - 1);
        else searchImages(userText, newMsgs.length - 1);
        return newMsgs;
      });
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Sumimasen— something went wrong!" }]); }
    finally { setLoading(false); inputRef.current?.focus(); }
  };

  const generateItinerary = async () => {
    setShowPlanner(false);
    const { days, area, style, budget, group } = plannerForm;
    const styleMap = { local: "local hidden gems, avoiding tourist traps", balanced: "mix of popular spots and local places", tourist: "popular tourist attractions" };
    const budgetMap = { budget: "budget (under ¥5000/day)", moderate: "moderate (¥5000-15000/day)", luxury: "luxury (¥15000+/day)" };
    const groupMap = { solo: "solo traveler", couple: "couple", family: "family with kids (stroller-friendly options needed)", friends: "group of friends" };
    const prompt = `Please create a detailed ${days}-day itinerary for ${area}, Japan.
Travel style: ${styleMap[style]}
Budget: ${budgetMap[budget]}
Group: ${groupMap[group]}

Format as:
**Day 1 - [Theme]**
🌅 Morning: ...
🌞 Afternoon: ...
🌙 Evening: ...
💴 Estimated cost: ¥XXXX

Include specific neighborhood names, timing tips, and local insider advice. Add [SEARCH: best restaurants in ${area}] at the end.`;

    sendMessage(prompt);
  };

const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) { e.preventDefault(); sendMessage(); } };  const getPriceLevel = (l) => ({ PRICE_LEVEL_INEXPENSIVE: "¥", PRICE_LEVEL_MODERATE: "¥¥", PRICE_LEVEL_EXPENSIVE: "¥¥¥", PRICE_LEVEL_VERY_EXPENSIVE: "¥¥¥¥" }[l] || "");

  const shareItinerary = async (text) => {
    const cleaned = cleanText(text);
    if (navigator.share) {
      try {
        await navigator.share({ title: "TABI 旅 - My Japan Itinerary", text: cleaned });
      } catch (e) { console.log("Share cancelled"); }
    } else {
      navigator.clipboard.writeText(cleaned);
      alert("Itinerary copied to clipboard!");
    }
  };

  const isItinerary = (text) => text.includes("Day 1") || text.includes("## Day") || text.includes("**Day");

  const addMapLinks = (text) => {
    // Match [Place Name] format that AI uses
    return text.replace(/\[([^\]]+)\]/g, (match, placeName) => {
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(placeName + " Japan")}`;
      return `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color:#ff8080;text-decoration:underline;text-decoration-style:dotted;font-weight:bold;">${placeName} 📍</a>`;
    });
  };

  const renderContent = (text) => cleanText(text).split("\n").map((line, i) => {
    // H2 見出し
    if (line.startsWith("## ")) {
      return <div key={i} style={{ fontSize: 16, fontWeight: "bold", color: "#e8363d", marginTop: 16, marginBottom: 6, borderBottom: "1px solid rgba(232,54,61,0.3)", paddingBottom: 4 }}>{line.slice(3)}</div>;
    }
    // H3 見出し
    if (line.startsWith("### ")) {
      return <div key={i} style={{ fontSize: 14, fontWeight: "bold", color: "rgba(255,255,255,0.9)", marginTop: 12, marginBottom: 4 }}>{line.slice(4)}</div>;
    }
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
    line = addMapLinks(line);
    if (line.startsWith("- ") || line.startsWith("• ")) return <li key={i} dangerouslySetInnerHTML={{ __html: line.slice(2) }} style={{ marginBottom: 4 }} />;
    if (line === "") return <br key={i} />;
    return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: line }} />;
  });

  const placeholder = { en: "Ask me anything about Japan... 🗾", zh: "问我任何关于日本的问题... 🗾", ko: "일본에 대해 무엇이든 물어보세요... 🗾", ja: "日本について何でも聞いてください... 🗾" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c1a 0%, #1a0a2e 40%, #0d1f3c 100%)", fontFamily: "'Georgia', 'Times New Roman', serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", height: "calc(100vh - 32px)", maxHeight: 800 }}>
        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none", borderRadius: "20px 20px 0 0", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(232,54,61,0.4)", flexShrink: 0, overflow: "hidden" }}>
            <svg viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sunG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f5c842"/>
                  <stop offset="100%" stopColor="#e8a020"/>
                </linearGradient>
              </defs>
              <circle cx="33" cy="16" r="7" fill="url(#sunG)" opacity="0.9"/>
              <polygon points="22,8 6,34 38,34" fill="white" opacity="0.95"/>
              <polygon points="22,8 14,22 30,22" fill="#e8363d"/>
              <polygon points="22,8 16,18 28,18" fill="white"/>
              <rect x="4" y="33" width="36" height="1.5" fill="white" opacity="0.4" rx="1"/>
            </svg>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold", letterSpacing: "0.05em" }}>TABI <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "normal" }}>旅</span></div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.06em" }}>YOUR JAPAN CONCIERGE</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            {Object.entries(LANG_FLAGS).map(([code, flag]) => (
              <button key={code} onClick={() => switchLang(code)} style={{
                width: 34, height: 34, borderRadius: "50%",
                border: lang === code ? "2px solid rgba(232,54,61,0.8)" : "1px solid rgba(255,255,255,0.15)",
                background: lang === code ? "rgba(232,54,61,0.2)" : "rgba(255,255,255,0.05)",
                cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", boxShadow: lang === code ? "0 0 10px rgba(232,54,61,0.3)" : "none",
              }}>{flag}</button>
            ))}
            <button onClick={clearHistory} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 2 }} title="Clear history">🗑️</button>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", marginLeft: 4 }} />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "none", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <svg viewBox="0 0 30 30" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="sunS" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f5c842"/>
                          <stop offset="100%" stopColor="#e8a020"/>
                        </linearGradient>
                      </defs>
                      <circle cx="22" cy="10" r="5" fill="url(#sunS)" opacity="0.9"/>
                      <polygon points="15,4 3,24 27,24" fill="white" opacity="0.95"/>
                      <polygon points="15,4 9,14 21,14" fill="#e8363d"/>
                      <polygon points="15,4 10,12 20,12" fill="white"/>
                      <rect x="2" y="23" width="26" height="1.5" fill="white" opacity="0.4" rx="1"/>
                    </svg>
                  </div>
                )}
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 8, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.image && <img src={msg.image} alt="uploaded" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 12, border: "2px solid rgba(232,54,61,0.4)" }} />}
                  <div style={{ background: msg.role === "user" ? "linear-gradient(135deg, #e8363d, #c0392b)" : "rgba(255,255,255,0.07)", border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", color: "#fff", fontSize: 14.5, lineHeight: 1.6, boxShadow: msg.role === "user" ? "0 4px 20px rgba(232,54,61,0.3)" : "none" }}>
                    {renderContent(msg.content)}
                  </div>
                  {msg.role === "assistant" && isItinerary(msg.content) && (
                    <button onClick={() => shareItinerary(msg.content)} style={{ alignSelf: "flex-start", marginTop: 6, background: "rgba(232,54,61,0.15)", border: "1px solid rgba(232,54,61,0.4)", borderRadius: 20, padding: "6px 16px", color: "#fff", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      📤 Share Itinerary
                    </button>
                  )}
                </div>
              </div>
{imageResults[i] && (
<div style={{ marginTop: 10, marginLeft: 40, overflow: "hidden" }}>
    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.08em", marginBottom: 8 }}>
      📸 IMAGES
    </div>
<div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, flexWrap: "nowrap", width: "100%", minWidth: 0 }}>
      {imageResults[i].map((img, j) => (
        <a key={j} href={img.contextLink} target="_blank" rel="noopener noreferrer"
          style={{ flexShrink: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
          <img
            src={img.url}
            alt={img.title}
            style={{ width: 140, height: 100, objectFit: "cover", display: "block" }}
            onError={e => e.target.parentElement.style.display = "none"}
          />
        </a>
      ))}
    </div>
  </div>
)}
              {placesResults[i] && (
                <div style={{ marginTop: 12, marginLeft: 40, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.08em" }}>📍 NEARBY PLACES · LIVE DATA</div>
                  {placesResults[i].map((place, j) => (
                    <div key={j} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, overflow: "hidden" }}>
                      {place.photoUrl && <img src={place.photoUrl} alt={place.displayName?.text} style={{ width: "100%", height: 140, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>{place.displayName?.text}</div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            {place.rating && <span style={{ background: "rgba(232,54,61,0.3)", color: "#fff", fontSize: 12, padding: "2px 8px", borderRadius: 20 }}>⭐ {place.rating}</span>}
                            {place.priceLevel && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{getPriceLevel(place.priceLevel)}</span>}
                          </div>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>{place.formattedAddress}</div>
                        {place.currentOpeningHours && <div style={{ marginTop: 6, fontSize: 12, color: place.currentOpeningHours.openNow ? "#4ade80" : "#f87171" }}>{place.currentOpeningHours.openNow ? "● Open now" : "● Closed now"}</div>}
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          {place.googleMapsUri && <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: "rgba(232,54,61,0.2)", border: "1px solid rgba(232,54,61,0.4)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontSize: 12, textAlign: "center", textDecoration: "none" }}>📍 Google Maps</a>}
                          {place.websiteUri && <a href={place.websiteUri} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 12px", color: "#fff", fontSize: 12, textAlign: "center", textDecoration: "none" }}>🌐 Official Site</a>}
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
              <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px 18px 18px 4px", padding: "14px 20px", display: "flex", gap: 6 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j*0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "none", padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTIONS[lang].map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "6px 14px", color: "rgba(255,255,255,0.75)", fontSize: 12.5, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(232,54,61,0.2)"; e.target.style.borderColor = "rgba(232,54,61,0.4)"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >{s}</button>
            ))}
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.06)", borderRadius: "0 0 20px 20px", padding: "16px 20px", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageSelect} style={{ display: "none" }} />
          <button onClick={() => cameraInputRef.current?.click()} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</button>
          <button onClick={() => setShowPlanner(true)} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }} title="Plan itinerary">🗓️</button>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder={placeholder[lang]} rows={1}
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", color: "#fff", fontSize: 14.5, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: loading || !input.trim() ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #e8363d, #c0392b)", border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.2s", boxShadow: loading || !input.trim() ? "none" : "0 4px 16px rgba(232,54,61,0.4)", color: "#fff" }}>↑</button>
        </div>
      </div>

      {/* Install Banner */}
      {showInstallBanner && !isInStandaloneMode && (isIOS || isAndroid) && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(135deg, #1a0a2e, #0d1f3c)", borderTop: "1px solid rgba(255,255,255,0.15)", padding: "16px 20px", zIndex: 200, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #e8363d, #c0392b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
                  <defs><linearGradient id="sunI" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f5c842"/><stop offset="100%" stopColor="#e8a020"/></linearGradient></defs>
                  <circle cx="33" cy="16" r="7" fill="url(#sunI)" opacity="0.9"/>
                  <polygon points="22,8 6,34 38,34" fill="white" opacity="0.95"/>
                  <polygon points="22,8 14,22 30,22" fill="#e8363d"/>
                  <polygon points="22,8 16,18 28,18" fill="white"/>
                  <rect x="4" y="33" width="36" height="1.5" fill="white" opacity="0.4" rx="1"/>
                </svg>
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>ホーム画面に追加</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>アプリとして使えます！</div>
              </div>
            </div>
            <button onClick={dismissInstallBanner} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", padding: 4 }}>×</button>
          </div>

          {isIOS && (
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.8 }}>
                <span style={{ color: "#fff", fontWeight: "bold" }}>iPhoneの場合：</span><br/>
                1. 下の <strong>共有ボタン（□↑）</strong> をタップ<br/>
                2. <strong>「ホーム画面に追加」</strong> を選択<br/>
                3. 「追加」をタップ ✓
              </div>
              <button onClick={dismissInstallBanner} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 10, background: "rgba(232,54,61,0.3)", border: "1px solid rgba(232,54,61,0.5)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
                わかりました！
              </button>
            </div>
          )}

          {isAndroid && (
            <div style={{ display: "flex", gap: 8 }}>
              {deferredPrompt ? (
                <button onClick={handleInstall} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #e8363d, #c0392b)", border: "none", color: "#fff", fontSize: 14, fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 16px rgba(232,54,61,0.4)" }}>
                  📱 インストール
                </button>
              ) : (
                <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.8 }}>
                    <span style={{ color: "#fff", fontWeight: "bold" }}>Androidの場合：</span><br/>
                    1. ブラウザの <strong>メニュー（⋮）</strong> をタップ<br/>
                    2. <strong>「ホーム画面に追加」</strong> を選択
                  </div>
                </div>
              )}
              <button onClick={dismissInstallBanner} style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
                あとで
              </button>
            </div>
          )}
        </div>
      )}

      {/* Planner Modal */}
      {showPlanner && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "linear-gradient(135deg, #1a0a2e, #0d1f3c)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>🗓️ Plan My Trip</div>
              <button onClick={() => setShowPlanner(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 22, cursor: "pointer" }}>×</button>
            </div>

            {[
              { label: "📅 How many days?", key: "days", options: [["2", "2 days"], ["3", "3 days"], ["4", "4 days"], ["5", "5 days"], ["7", "1 week"]] },
              { label: "📍 Main area?", key: "area", options: [["Tokyo", "Tokyo"], ["Kyoto", "Kyoto"], ["Osaka", "Osaka"], ["Tokyo & Kyoto", "Tokyo + Kyoto"], ["Tokyo & Osaka", "Tokyo + Osaka"]] },
              { label: "🎯 Travel style?", key: "style", options: [["local", "🏘️ Local & hidden"], ["balanced", "⚖️ Balanced"], ["tourist", "⛩️ Classic spots"]] },
              { label: "💴 Budget?", key: "budget", options: [["budget", "💰 Budget"], ["moderate", "💳 Moderate"], ["luxury", "✨ Luxury"]] },
              { label: "👥 Who's going?", key: "group", options: [["solo", "🧍 Solo"], ["couple", "👫 Couple"], ["family", "👨‍👩‍👧 Family"], ["friends", "👯 Friends"]] },
            ].map(({ label, key, options }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 8 }}>{label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {options.map(([value, display]) => (
                    <button key={value} onClick={() => setPlannerForm(prev => ({ ...prev, [key]: value }))}
                      style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                        background: plannerForm[key] === value ? "linear-gradient(135deg, #e8363d, #c0392b)" : "rgba(255,255,255,0.07)",
                        border: plannerForm[key] === value ? "none" : "1px solid rgba(255,255,255,0.15)",
                        color: "#fff", boxShadow: plannerForm[key] === value ? "0 4px 12px rgba(232,54,61,0.3)" : "none",
                      }}>{display}</button>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={generateItinerary} style={{ width: "100%", padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #e8363d, #c0392b)", border: "none", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 8, boxShadow: "0 4px 20px rgba(232,54,61,0.4)" }}>
              ✨ Generate My Itinerary
            </button>
          </div>
        </div>
      )}

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
