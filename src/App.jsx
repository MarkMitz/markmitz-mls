import { useState, useRef, useEffect } from "react";

const LISTINGS = [
  { id: 1, address: "4821 Elm Creek Dr", city: "San Antonio", zip: "78230", price: 385000, beds: 4, baths: 3, sqft: 2340, lot: 0.22, year: 2018, type: "Single Family", status: "Active", neighborhood: "Elm Creek", pool: true, garage: 2, school: "Northside ISD", days: 12, desc: "Stunning 4BR in coveted Elm Creek. Open floor plan, chef's kitchen with quartz counters, primary suite with spa bath. Covered patio overlooks sparkling pool." },
  { id: 2, address: "210 Bitters Rd #1402", city: "San Antonio", zip: "78216", price: 229000, beds: 2, baths: 2, sqft: 1180, lot: 0, year: 2015, type: "Condo", status: "Active", neighborhood: "North Central", pool: true, garage: 1, school: "North East ISD", days: 5, desc: "Luxury condo in gated community. Granite counters, stainless appliances, private balcony. Community pool, fitness center, and walking trails." },
  { id: 3, address: "18934 Kendall Bluff", city: "Boerne", zip: "78006", price: 549000, beds: 4, baths: 3.5, sqft: 3100, lot: 1.2, year: 2020, type: "Single Family", status: "Active", neighborhood: "Kendall Ranch", pool: false, garage: 3, school: "Boerne ISD", days: 28, desc: "Hill Country elegance on 1.2 acres. Soaring ceilings, game room, media room, 3-car garage. Backs to greenbelt. No city taxes." },
  { id: 4, address: "7703 Wurzbach Rd", city: "San Antonio", zip: "78240", price: 298000, beds: 3, baths: 2, sqft: 1890, lot: 0.18, year: 2005, type: "Single Family", status: "Active", neighborhood: "Medical Center", pool: false, garage: 2, school: "Northside ISD", days: 3, desc: "Immaculate 3/2 near Medical Center. Updated kitchen, hardwood floors, large backyard. Convenient to 410, USAA, and shopping." },
  { id: 5, address: "1122 King William St", city: "San Antonio", zip: "78204", price: 725000, beds: 4, baths: 4, sqft: 3800, lot: 0.31, year: 1910, type: "Historic", status: "Active", neighborhood: "King William", pool: false, garage: 0, school: "San Antonio ISD", days: 45, desc: "Magnificent Victorian in historic King William district. Fully restored with modern updates. Original heart pine floors, 12ft ceilings, wraparound porch. Steps from the River Walk." },
  { id: 6, address: "3204 Hunters Chase", city: "Schertz", zip: "78154", price: 319000, beds: 4, baths: 2.5, sqft: 2650, lot: 0.25, year: 2016, type: "Single Family", status: "Active", neighborhood: "Hunters Chase", pool: false, garage: 2, school: "Schertz-Cibolo ISD", days: 8, desc: "Gorgeous 4BR in family-friendly Hunters Chase. Open kitchen, bonus room upstairs, large fenced yard. Cul-de-sac lot. Top-rated SCUC ISD schools." },
  { id: 7, address: "9801 Huebner Rd #220", city: "San Antonio", zip: "78240", price: 189000, beds: 2, baths: 2, sqft: 1050, lot: 0, year: 2008, type: "Condo", status: "Active", neighborhood: "Northwest", pool: true, garage: 1, school: "Northside ISD", days: 19, desc: "Move-in ready condo in gated complex. Updated baths, in-unit laundry, covered parking. Pool and clubhouse. Walk to shops and restaurants." },
  { id: 8, address: "25619 Pecan Valley", city: "San Antonio", zip: "78260", price: 462000, beds: 5, baths: 4, sqft: 3450, lot: 0.35, year: 2019, type: "Single Family", status: "Active", neighborhood: "Stone Oak", pool: true, garage: 2, school: "North East ISD", days: 14, desc: "Spacious 5BR in prestigious Stone Oak. Gourmet kitchen, formal dining, downstairs guest suite, sparkling pool and spa. Top-rated NEISD schools." },
  { id: 9, address: "402 Fredericksburg Rd", city: "San Antonio", zip: "78201", price: 245000, beds: 3, baths: 1.5, sqft: 1420, lot: 0.14, year: 1952, type: "Single Family", status: "Active", neighborhood: "Monticello Park", pool: false, garage: 1, school: "San Antonio ISD", days: 21, desc: "Charming mid-century home in Monticello Park. Original hardwoods, updated kitchen, detached garage. Walkable neighborhood with great character." },
  { id: 10, address: "15803 Rim Rock Cir", city: "San Antonio", zip: "78255", price: 875000, beds: 5, baths: 5, sqft: 4900, lot: 0.75, year: 2021, type: "Single Family", status: "Active", neighborhood: "The Dominion", pool: true, garage: 3, school: "Northside ISD", days: 33, desc: "Luxury living in The Dominion. Designer finishes throughout, wine room, outdoor kitchen, resort-style pool. Gated community with 24hr security." },
];

const formatPrice = (p) => "$" + p.toLocaleString();

const SYSTEM_PROMPT = `You are a knowledgeable San Antonio real estate assistant with access to SABOR MLS listings. You help buyers and agents find properties through natural conversation.

Here are the current available listings:
${JSON.stringify(LISTINGS, null, 2)}

When a user asks about properties:
1. Search the listings based on their criteria (price, beds, baths, city, neighborhood, pool, type, school district, sqft, etc.)
2. Return matching listing IDs in a special JSON block at the END of your response, formatted EXACTLY like this (no markdown fences):
LISTINGS_JSON:{"ids":[1,2,3]}

3. Then give a warm, conversational summary of what you found — mention highlights, tradeoffs, and ask a follow-up question to narrow down further.

If no listings match, say so and suggest adjusting criteria.
If the user asks general questions about San Antonio real estate, neighborhoods, schools, or market conditions, answer helpfully based on your knowledge.
Always be friendly, professional, and helpful like a great local realtor.`;

export default function SABORDemo() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your SABOR MLS assistant. I have access to current San Antonio area listings. Try asking me something like:\n\n• \"Find me a 4BR under $400k with a pool\"\n• \"What's available in Boerne?\"\n• \"Show me condos under $250k near the Medical Center\"\n• \"I need good schools and at least 3 beds\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [shownListings, setShownListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const apiMsgs = next.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMsgs,
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";

      // Extract listing IDs
      const jsonMatch = raw.match(/LISTINGS_JSON:(\{.*?\})/s);
      let ids = [];
      if (jsonMatch) {
        try { ids = JSON.parse(jsonMatch[1]).ids || []; } catch {}
      }
      const clean = raw.replace(/LISTINGS_JSON:\{.*?\}/s, "").trim();

      setMessages(prev => [...prev, { role: "assistant", content: clean }]);
      if (ids.length > 0) {
        setShownListings(LISTINGS.filter(l => ids.includes(l.id)));
        setSelected(null);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", minHeight: "100vh", background: "#0e1117", color: "#e8e0d5", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 2px; }
        .header { background: #0e1117; border-bottom: 1px solid #1e2028; padding: 16px 24px; display: flex; align-items: center; gap: 12px; }
        .logo { width: 36px; height: 36px; background: linear-gradient(135deg, #c8a96e, #a07840); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .header-text h1 { font-size: 20px; font-weight: 600; letter-spacing: 0.5px; color: #e8e0d5; }
        .header-text p { font-size: 12px; color: #6b6878; font-family: 'DM Mono', monospace; letter-spacing: 0.3px; }
        .demo-badge { margin-left: auto; background: #1e2028; border: 1px solid #2a2a35; color: #c8a96e; font-family: 'DM Mono', monospace; font-size: 10px; padding: 4px 10px; border-radius: 20px; letter-spacing: 1px; }
        .main { display: flex; flex: 1; overflow: hidden; height: calc(100vh - 65px); }
        .chat-panel { width: 400px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #1e2028; }
        .messages { flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 14px; }
        .msg { display: flex; gap: 10px; animation: fadeUp 0.3s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .msg.user { flex-direction: row-reverse; }
        .avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; margin-top: 2px; }
        .avatar.ai { background: linear-gradient(135deg, #c8a96e, #a07840); }
        .avatar.user { background: #1e2028; border: 1px solid #2a2a35; }
        .bubble { max-width: 290px; padding: 10px 14px; border-radius: 12px; font-size: 15px; line-height: 1.55; }
        .bubble.ai { background: #1a1b24; border: 1px solid #22222e; color: #ccc4ba; border-radius: 2px 12px 12px 12px; white-space: pre-wrap; }
        .bubble.user { background: #c8a96e; color: #1a1200; border-radius: 12px 2px 12px 12px; }
        .typing { display: flex; gap: 5px; align-items: center; padding: 14px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: #c8a96e; animation: pulse 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%,60%,100% { opacity:0.3; transform:scale(0.8); } 30% { opacity:1; transform:scale(1.2); } }
        .input-row { padding: 12px 16px; border-top: 1px solid #1e2028; display: flex; gap: 8px; align-items: flex-end; }
        textarea { flex: 1; background: #1a1b24; border: 1px solid #22222e; border-radius: 10px; padding: 10px 14px; color: #e8e0d5; font-family: 'Crimson Pro', serif; font-size: 15px; resize: none; outline: none; min-height: 42px; max-height: 120px; line-height: 1.4; }
        textarea::placeholder { color: #3a3848; }
        textarea:focus { border-color: #c8a96e44; }
        .send { width: 38px; height: 38px; border-radius: 50%; background: #c8a96e; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; color: #1a1200; font-size: 16px; }
        .send:hover { background: #d4b87a; transform: scale(1.05); }
        .send:disabled { background: #2a2a35; color: #4a4858; cursor: default; transform: none; }
        .listings-panel { flex: 1; overflow-y: auto; padding: 20px; }
        .listings-header { font-family: 'DM Mono', monospace; font-size: 11px; color: #6b6878; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
        .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .card { background: #1a1b24; border: 1px solid #22222e; border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
        .card:hover { border-color: #c8a96e44; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .card.active { border-color: #c8a96e; }
        .card-img { height: 140px; background: linear-gradient(135deg, #1e2028 0%, #15161f 100%); display: flex; align-items: center; justify-content: center; font-size: 36px; position: relative; }
        .card-status { position: absolute; top: 10px; right: 10px; background: #0e1117cc; border: 1px solid #2a2a35; font-family: 'DM Mono', monospace; font-size: 9px; color: #4ade80; padding: 3px 8px; border-radius: 20px; letter-spacing: 0.5px; }
        .card-days { position: absolute; top: 10px; left: 10px; background: #0e1117cc; border: 1px solid #2a2a35; font-family: 'DM Mono', monospace; font-size: 9px; color: #c8a96e; padding: 3px 8px; border-radius: 20px; }
        .card-body { padding: 14px; }
        .card-price { font-size: 22px; font-weight: 600; color: #c8a96e; letter-spacing: -0.5px; }
        .card-address { font-size: 14px; color: #9990a0; margin-top: 2px; }
        .card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .tag { background: #22222e; border: 1px solid #2a2a35; font-family: 'DM Mono', monospace; font-size: 10px; color: #8880a0; padding: 3px 8px; border-radius: 4px; }
        .tag.highlight { background: #c8a96e15; border-color: #c8a96e44; color: #c8a96e; }
        .detail-panel { position: fixed; top: 65px; right: 0; bottom: 0; width: 360px; background: #13141c; border-left: 1px solid #1e2028; overflow-y: auto; transform: translateX(100%); transition: transform 0.3s ease; z-index: 10; }
        .detail-panel.open { transform: translateX(0); }
        .detail-hero { height: 180px; background: linear-gradient(135deg, #1e2028, #15161f); display: flex; align-items: center; justify-content: center; font-size: 60px; position: relative; }
        .detail-close { position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; border-radius: 50%; background: #0e1117; border: 1px solid #2a2a35; color: #6b6878; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .detail-body { padding: 20px; }
        .detail-price { font-size: 28px; font-weight: 600; color: #c8a96e; }
        .detail-addr { font-size: 16px; color: #9990a0; margin-top: 4px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
        .detail-stat { background: #1a1b24; border: 1px solid #22222e; border-radius: 8px; padding: 10px 12px; }
        .detail-stat-val { font-size: 18px; font-weight: 600; color: #e8e0d5; }
        .detail-stat-key { font-family: 'DM Mono', monospace; font-size: 10px; color: #6b6878; margin-top: 2px; letter-spacing: 0.5px; }
        .detail-desc { font-size: 14px; color: #9990a0; line-height: 1.7; }
        .detail-section { font-family: 'DM Mono', monospace; font-size: 10px; color: #6b6878; letter-spacing: 1px; text-transform: uppercase; margin: 16px 0 8px; }
        .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #3a3848; text-align: center; padding: 40px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .empty-title { font-size: 18px; color: #4a4858; margin-bottom: 8px; }
        .empty-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: #2a2a35; line-height: 1.7; }
        .cta-btn { margin-top: 20px; background: #c8a96e15; border: 1px solid #c8a96e44; color: #c8a96e; font-family: 'DM Mono', monospace; font-size: 11px; padding: 10px 20px; border-radius: 6px; cursor: default; letter-spacing: 0.5px; }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="logo">🏡</div>
        <div className="header-text">
          <h1>SABOR MLS Assistant</h1>
          <p>LERA MLS · San Antonio & Surrounding Counties</p>
        </div>
        <div className="demo-badge">DEMO MODE</div>
      </div>

      <div className="main">
        {/* Chat */}
        <div className="chat-panel">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className={`avatar ${m.role === "assistant" ? "ai" : "user"}`}>
                  {m.role === "assistant" ? "🏡" : "👤"}
                </div>
                <div className={`bubble ${m.role === "assistant" ? "ai" : "user"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg">
                <div className="avatar ai">🏡</div>
                <div className="bubble ai">
                  <div className="typing">
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="input-row">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask about listings..."
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button className="send" onClick={send} disabled={!input.trim() || loading}>↑</button>
          </div>
        </div>

        {/* Listings panel */}
        <div className="listings-panel">
          {shownListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No listings shown yet</div>
              <div className="empty-sub">Ask me to search for properties<br/>and results will appear here</div>
              <div className="cta-btn">← Try asking the assistant</div>
            </div>
          ) : (
            <>
              <div className="listings-header">{shownListings.length} listing{shownListings.length !== 1 ? "s" : ""} found · SABOR MLS Demo</div>
              <div className="listings-grid">
                {shownListings.map(l => (
                  <div key={l.id} className={`card ${selected?.id === l.id ? "active" : ""}`} onClick={() => setSelected(selected?.id === l.id ? null : l)}>
                    <div className="card-img">
                      {l.type === "Condo" ? "🏢" : l.type === "Historic" ? "🏛️" : "🏠"}
                      <div className="card-status">● ACTIVE</div>
                      <div className="card-days">{l.days}d on market</div>
                    </div>
                    <div className="card-body">
                      <div className="card-price">{formatPrice(l.price)}</div>
                      <div className="card-address">{l.address}, {l.city}</div>
                      <div className="card-tags">
                        <span className="tag">{l.beds} bd</span>
                        <span className="tag">{l.baths} ba</span>
                        <span className="tag">{l.sqft.toLocaleString()} sqft</span>
                        {l.pool && <span className="tag highlight">Pool</span>}
                        <span className="tag">{l.type}</span>
                        <span className="tag">{l.school}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className={`detail-panel ${selected ? "open" : ""}`}>
        {selected && (
          <>
            <div className="detail-hero">
              {selected.type === "Condo" ? "🏢" : selected.type === "Historic" ? "🏛️" : "🏠"}
              <button className="detail-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-body">
              <div className="detail-price">{formatPrice(selected.price)}</div>
              <div className="detail-addr">{selected.address}<br />{selected.city}, TX {selected.zip}</div>

              <div className="detail-grid">
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.beds}</div>
                  <div className="detail-stat-key">Bedrooms</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.baths}</div>
                  <div className="detail-stat-key">Bathrooms</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.sqft.toLocaleString()}</div>
                  <div className="detail-stat-key">Sq Ft</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.year}</div>
                  <div className="detail-stat-key">Year Built</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.garage > 0 ? selected.garage + " Car" : "None"}</div>
                  <div className="detail-stat-key">Garage</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.days}</div>
                  <div className="detail-stat-key">Days on Market</div>
                </div>
              </div>

              <div className="detail-section">Description</div>
              <div className="detail-desc">{selected.desc}</div>

              <div className="detail-section">Details</div>
              <div className="detail-grid">
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.type}</div>
                  <div className="detail-stat-key">Property Type</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val">{selected.pool ? "Yes" : "No"}</div>
                  <div className="detail-stat-key">Pool</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val" style={{ fontSize: 13 }}>{selected.school}</div>
                  <div className="detail-stat-key">School District</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-val" style={{ fontSize: 13 }}>{selected.neighborhood}</div>
                  <div className="detail-stat-key">Neighborhood</div>
                </div>
              </div>

              <div className="detail-section">Price per Sqft</div>
              <div className="detail-stat" style={{ marginBottom: 20 }}>
                <div className="detail-stat-val">${Math.round(selected.price / selected.sqft)}/sqft</div>
                <div className="detail-stat-key">Market average ~$185/sqft</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
