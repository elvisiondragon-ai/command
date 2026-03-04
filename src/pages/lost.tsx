import { useState, useEffect, useRef } from "react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#1A1814", panel: "#211E18", bone: "#E8E0D0",
  dim: "#9A9080", faint: "#4A4540",
  blood: "#8B1A1A", bloodDim: "#5A1010", bloodFaint: "#2A0808",
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const load = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const dayKey = () => new Date().toISOString().slice(0, 10);

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  id: {
    toggle: "EN",
    splashQ: "Sudahkah Kau Berdarah Hari Ini?",
    splashHint: "sentuh untuk masuk",

    // Protocol phases
    phase_volume: "VOLUME",
    phase_release: "DEEP RELEASE",
    phase_clarity: "DEEP CLARITY",
    phase_foundation: "FONDASI",
    phase_request: "PERMINTAAN",

    // Volume
    vol_heading: "Apa titik fokusmu?",
    vol_sub: "Satu objek. Pegang selama mungkin. Tidak ada yang lain.",
    vol_placeholder: "musik / lilin / nafas / ...",
    vol_duration: "Sudah berapa lama?",
    vol_hrs: "jam",
    vol_min: "mnt",
    vol_ready: "Siap masuk ke dalam →",
    vol_anchor_label: "OBJEK HARI INI",

    // Release check
    rel_heading: "Tutup mata. Kembali ke titik itu.",
    rel_anchor: "Objekmu adalah",
    rel_instruction: "Pegang lagi sekarang. Satu titik. Biarkan tubuhmu ada di sana.",
    rel_question: "Apakah ada sesuatu yang terlepas?",
    rel_sub: "Bukan dipikir. Bukan dinilai.\nRasakan saja — adakah pelepasan yang nyata?",
    rel_yes: "Ya — terasa terlepas",
    rel_no: "Belum — kembali isi volume",
    rel_back_instruction: "Kembali ke objekmu. Pegang lagi. Jangan tanya dulu.",

    // Clarity check
    cla_heading: "Tetap di titik itu.",
    cla_instruction: "Jangan bergerak dari sana. Tetap pegang.",
    cla_question: "Apakah kejernihan muncul dengan sendirinya?",
    cla_sub: "Bukan kamu yang memahami.\nApakah sesuatu menjadi jelas dengan sendirinya — tanpa usaha?",
    cla_yes: "Ya — terasa jernih",
    cla_no: "Belum — kembali isi volume",

    // Foundation
    found_heading: "Fondasi terbentuk.",
    found_sub: "Kamu sudah punya kedalaman nyata sekarang.\nApapun yang kamu minta tidak bisa melampaui realitas yang baru saja kamu bangun.\nJangan tergesa. Ini adalah lantainya.",
    found_depth_label: "KEDALAMAN REALITAS HARI INI",
    found_obj: "Objek",
    found_vol: "Volume",
    found_continue: "Mulai meminta →",
    found_close: "Cukup untuk hari ini",

    // Request
    req_heading: "Apa yang ingin kamu minta?",
    req_sub: "Bukan memaksa. Meminta — dari kedalaman yang sama dengan yang baru kamu bangun.",
    req_placeholder: "tuliskan keinginanmu...",
    req_add: "Tambah",
    req_clarity_q: "Minta Deep Clarity untuk ini.",
    req_clarity_inst: "Pegang keinginan ini di titik yang sama. Minta kejernihan tentangnya. Rasakan.",
    req_clarity_felt: "Sudah terasa jernih",
    req_clarity_not: "Belum jernih",
    req_relax_q: "Minta Deep Relax untuk ini.",
    req_relax_inst: "Sekarang minta ketenangan yang dalam tentangnya. Dari titik yang sama. Bukan pikiran.",
    req_relax_felt: "Sudah terasa tenang",
    req_relax_not: "Belum tenang",
    req_done_msg: "Permintaan ini setara dengan kedalaman realitasmu. Tidak lebih. Tidak kurang.",
    req_another: "+ Permintaan baru",
    req_finish: "Selesai",

    // Log
    log_heading: "Catatan Sesi",
    log_placeholder: "tulis — ia tidak bisa dihapus",
    log_empty: "Belum ada catatan.",
    log_sessions: "SESI TERSIMPAN",
    log_no_sessions: "Belum ada sesi.",

    // Nav
    nav_ritual: "Ritual",
    nav_log: "Jurnal",
    nav_history: "Riwayat",

    // History
    hist_heading: "Riwayat Sesi",
    hist_empty: "Belum ada sesi yang tersimpan.",
    hist_vol: "Volume",
    hist_obj: "Objek",
    hist_depth: "Kedalaman",
    hist_req: "Permintaan",
    days_ago: (n) => n === 0 ? "Hari ini" : n === 1 ? "Kemarin" : `${n} hari lalu`,
  },
  en: {
    toggle: "ID",
    splashQ: "Have You Bled Today?",
    splashHint: "touch to enter",

    phase_volume: "VOLUME",
    phase_release: "DEEP RELEASE",
    phase_clarity: "DEEP CLARITY",
    phase_foundation: "FOUNDATION",
    phase_request: "REQUEST",

    vol_heading: "What is your focus point?",
    vol_sub: "One object. Hold it as long as possible. Nothing else.",
    vol_placeholder: "music / candle / breath / ...",
    vol_duration: "How long so far?",
    vol_hrs: "h",
    vol_min: "m",
    vol_ready: "Ready to go deeper →",
    vol_anchor_label: "TODAY'S OBJECT",

    rel_heading: "Close your eyes. Return to the point.",
    rel_anchor: "Your object is",
    rel_instruction: "Hold it again now. One point. Let your body be there.",
    rel_question: "Is there something releasing?",
    rel_sub: "Not thought. Not judged.\nJust feel — is there a real release happening?",
    rel_yes: "Yes — I feel it releasing",
    rel_no: "Not yet — back to volume",
    rel_back_instruction: "Return to your object. Hold it again. Don't ask yet.",

    cla_heading: "Stay at the point.",
    cla_instruction: "Don't move from there. Keep holding.",
    cla_question: "Does clarity arise on its own?",
    cla_sub: "Not you understanding.\nDoes something become clear by itself — without effort?",
    cla_yes: "Yes — clarity is here",
    cla_no: "Not yet — back to volume",

    found_heading: "Foundation formed.",
    found_sub: "You have real depth now.\nAnything you ask cannot exceed the reality you just built.\nDon't rush. This is the floor.",
    found_depth_label: "TODAY'S DEPTH REALITY",
    found_obj: "Object",
    found_vol: "Volume",
    found_continue: "Begin requesting →",
    found_close: "Enough for today",

    req_heading: "What do you want to ask for?",
    req_sub: "Not forcing. Asking — from the same depth you just built.",
    req_placeholder: "write your desire...",
    req_add: "Add",
    req_clarity_q: "Ask for Deep Clarity on this.",
    req_clarity_inst: "Hold this desire at the same point. Ask for clarity about it. Feel.",
    req_clarity_felt: "Clarity felt",
    req_clarity_not: "Not yet clear",
    req_relax_q: "Ask for Deep Relax on this.",
    req_relax_inst: "Now ask for deep ease about it. From the same point. Not the mind.",
    req_relax_felt: "Ease felt",
    req_relax_not: "Not yet",
    req_done_msg: "This request is aligned with the depth of your reality. No more. No less.",
    req_another: "+ New request",
    req_finish: "Finish",

    log_heading: "Session Notes",
    log_placeholder: "write — it cannot be deleted",
    log_empty: "No entries yet.",
    log_sessions: "SAVED SESSIONS",
    log_no_sessions: "No sessions yet.",

    nav_ritual: "Ritual",
    nav_log: "Journal",
    nav_history: "History",

    hist_heading: "Session History",
    hist_empty: "No sessions saved yet.",
    hist_vol: "Volume",
    hist_obj: "Object",
    hist_depth: "Depth",
    hist_req: "Requests",
    days_ago: (n) => n === 0 ? "Today" : n === 1 ? "Yesterday" : `${n} days ago`,
  },
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const mono = { fontFamily: "'Space Mono', monospace" };
const serif = { fontFamily: "'Cormorant Garamond', serif" };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #1A1814; color: #E8E0D0; overflow-x: hidden; }

  @keyframes pulseBlood {
    0%, 100% { opacity: .12; transform: scale(1); }
    50% { opacity: .28; transform: scale(1.04); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes breathe {
    0%, 100% { opacity: .5; } 50% { opacity: 1; }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  .blood-orb {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse at 50% 50%, #8B1A1A1A 0%, transparent 68%);
    animation: pulseBlood 5s ease-in-out infinite;
  }
  .phase-enter { animation: fadeUp 0.6s ease forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .breathe { animation: breathe 4s ease-in-out infinite; }

  ::-webkit-scrollbar { width: 3px; background: #1A1814; }
  ::-webkit-scrollbar-thumb { background: #2A0808; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input:focus, textarea:focus { outline: none; border-color: #8B1A1A !important; }
  button { cursor: pointer; }
  button:hover { opacity: .85; }
`;

// ─── PHASE STEP INDICATOR ────────────────────────────────────────────────────
const PHASES = ["phase_volume","phase_release","phase_clarity","phase_foundation","phase_request"];

function PhaseBar({ current, t }) {
  const idx = PHASES.indexOf(current);
  return (
    <div style={{ display: "flex", gap: "0", marginBottom: "40px" }}>
      {PHASES.map((ph, i) => (
        <div key={ph} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{
            height: "2px", width: "100%",
            background: i <= idx ? C.blood : C.faint,
            transition: "background 0.4s ease",
          }} />
          <span style={{
            ...mono, fontSize: "8px", letterSpacing: "1.5px",
            color: i === idx ? C.blood : i < idx ? C.bloodDim : C.faint,
            textAlign: "center",
          }}>
            {t[ph]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── ANCHOR REMINDER ─────────────────────────────────────────────────────────
function AnchorPulse({ label, object }) {
  return (
    <div className="breathe" style={{
      border: `1px solid ${C.bloodDim}`,
      padding: "12px 18px",
      marginBottom: "28px",
      display: "flex", alignItems: "center", gap: "12px",
      background: C.bloodFaint,
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.blood, flexShrink: 0 }} />
      <span style={{ ...mono, fontSize: "10px", color: C.dim, letterSpacing: "2px", textTransform: "uppercase" }}>{label}:</span>
      <span style={{ ...serif, fontSize: "18px", color: C.bone, fontWeight: 300, fontStyle: "italic" }}>{object}</span>
    </div>
  );
}

// ─── RETURN TO VOLUME SCREEN ──────────────────────────────────────────────────
function ReturnToVolume({ t, object, onReturn }) {
  const [count, setCount] = useState(5);
  useEffect(() => {
    if (count <= 0) return;
    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div className="phase-enter" style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ ...serif, fontSize: "clamp(28px,5vw,48px)", color: C.bone, fontWeight: 300, marginBottom: "16px", letterSpacing: "2px" }}>
        {t.rel_back_instruction}
      </div>
      <div style={{ ...mono, fontSize: "60px", color: C.blood, margin: "32px 0", fontWeight: 700 }}>
        {count > 0 ? count : "↓"}
      </div>
      <div style={{ ...serif, fontSize: "22px", color: C.dim, fontStyle: "italic", marginBottom: "40px" }}>
        {object}
      </div>
      <button
        onClick={onReturn}
        style={{
          background: "transparent", border: `1px solid ${C.faint}`,
          color: C.dim, padding: "10px 32px",
          ...mono, fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
        }}
      >
        {t.phase_volume} →
      </button>
    </div>
  );
}

// ─── REQUEST ITEM ─────────────────────────────────────────────────────────────
function RequestItem({ item, idx, t, onChange }) {
  return (
    <div style={{ border: `1px solid ${C.faint}`, padding: "20px", marginBottom: "12px", background: C.panel }}>
      <div style={{ ...serif, fontSize: "20px", color: C.bone, fontWeight: 300, marginBottom: "16px" }}>
        {item.text}
      </div>

      {/* Clarity */}
      <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px solid ${C.faint}` }}>
        <div style={{ ...mono, fontSize: "10px", color: C.bloodDim, letterSpacing: "2px", marginBottom: "8px" }}>
          {t.req_clarity_q}
        </div>
        <p style={{ ...mono, fontSize: "11px", color: C.dim, margin: "0 0 12px 0", lineHeight: 1.7 }}>{t.req_clarity_inst}</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onChange(idx, "clarity", true)}
            style={{
              flex: 1, padding: "8px",
              background: item.clarity === true ? C.bloodFaint : "transparent",
              border: `1px solid ${item.clarity === true ? C.blood : C.faint}`,
              color: item.clarity === true ? C.bone : C.dim,
              ...mono, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
            }}
          >{t.req_clarity_felt}</button>
          <button
            onClick={() => onChange(idx, "clarity", false)}
            style={{
              flex: 1, padding: "8px",
              background: item.clarity === false ? "#00000044" : "transparent",
              border: `1px solid ${item.clarity === false ? C.faint : C.faint}`,
              color: C.dim,
              ...mono, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
            }}
          >{t.req_clarity_not}</button>
        </div>
      </div>

      {/* Relax */}
      <div>
        <div style={{ ...mono, fontSize: "10px", color: C.bloodDim, letterSpacing: "2px", marginBottom: "8px" }}>
          {t.req_relax_q}
        </div>
        <p style={{ ...mono, fontSize: "11px", color: C.dim, margin: "0 0 12px 0", lineHeight: 1.7 }}>{t.req_relax_inst}</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onChange(idx, "relax", true)}
            style={{
              flex: 1, padding: "8px",
              background: item.relax === true ? C.bloodFaint : "transparent",
              border: `1px solid ${item.relax === true ? C.blood : C.faint}`,
              color: item.relax === true ? C.bone : C.dim,
              ...mono, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
            }}
          >{t.req_relax_felt}</button>
          <button
            onClick={() => onChange(idx, "relax", false)}
            style={{
              flex: 1, padding: "8px",
              background: "transparent",
              border: `1px solid ${C.faint}`,
              color: C.dim,
              ...mono, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
            }}
          >{t.req_relax_not}</button>
        </div>
      </div>

      {item.clarity === true && item.relax === true && (
        <div className="fade-in" style={{
          marginTop: "14px", padding: "10px 14px",
          border: `1px solid ${C.bloodDim}`, background: C.bloodFaint,
          ...mono, fontSize: "10px", color: C.dim, lineHeight: 1.7,
        }}>
          {t.req_done_msg}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [lang, setLang] = useState(() => load("lang", "id"));
  const t = T[lang];

  const [screen, setScreen] = useState("splash"); // splash | main | history
  const [nav, setNav] = useState("ritual");        // ritual | log | history
  const [phase, setPhase] = useState(() => load(`phase_${dayKey()}`, "phase_volume"));
  const [returning, setReturning] = useState(false); // back to volume animation

  // Volume
  const [object, setObject] = useState(() => load(`obj_${dayKey()}`, ""));
  const [volH, setVolH] = useState(() => load(`volh_${dayKey()}`, ""));
  const [volM, setVolM] = useState(() => load(`volm_${dayKey()}`, ""));

  // Depth answers
  const [releaseAnswer, setReleaseAnswer] = useState(() => load(`rel_${dayKey()}`, null));
  const [clarityAnswer, setClarityAnswer] = useState(() => load(`cla_${dayKey()}`, null));

  // Requests
  const [requests, setRequests] = useState(() => load(`req_${dayKey()}`, []));
  const [reqInput, setReqInput] = useState("");

  // Log
  const [log, setLog] = useState(() => load("journal", []));
  const [logInput, setLogInput] = useState("");
  const logRef = useRef(null);

  // Sessions history
  const [sessions, setSessions] = useState(() => load("sessions", []));

  // Persist
  useEffect(() => { save("lang", lang); }, [lang]);
  useEffect(() => { save(`phase_${dayKey()}`, phase); }, [phase]);
  useEffect(() => { save(`obj_${dayKey()}`, object); }, [object]);
  useEffect(() => { save(`volh_${dayKey()}`, volH); }, [volH]);
  useEffect(() => { save(`volm_${dayKey()}`, volM); }, [volM]);
  useEffect(() => { save(`rel_${dayKey()}`, releaseAnswer); }, [releaseAnswer]);
  useEffect(() => { save(`cla_${dayKey()}`, clarityAnswer); }, [clarityAnswer]);
  useEffect(() => { save(`req_${dayKey()}`, requests); }, [requests]);
  useEffect(() => { save("journal", log); }, [log]);
  useEffect(() => { save("sessions", sessions); }, [sessions]);

  // Splash click
  useEffect(() => {
    if (screen !== "splash") return;
    const h = () => setScreen("main");
    window.addEventListener("keydown", h);
    window.addEventListener("click", h);
    return () => { window.removeEventListener("keydown", h); window.removeEventListener("click", h); };
  }, [screen]);

  const fmtVol = () => {
    const h = parseInt(volH || 0), m = parseInt(volM || 0);
    if (!h && !m) return "—";
    return `${h}j ${m}m`;
  };

  const addLog = () => {
    if (!logInput.trim()) return;
    const ts = new Date().toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    setLog(p => [...p, { ts, text: logInput.trim(), date: dayKey() }]);
    setLogInput("");
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  };

  const saveSession = () => {
    const sesh = {
      date: dayKey(),
      object,
      volH, volM,
      releaseAnswer, clarityAnswer,
      requests: requests.map(r => ({ text: r.text, clarity: r.clarity, relax: r.relax })),
    };
    setSessions(p => {
      const filtered = p.filter(s => s.date !== dayKey());
      return [sesh, ...filtered];
    });
  };

  const goPhase = (ph) => {
    setPhase(ph);
    setReturning(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReleaseNo = () => { setReturning(true); };
  const handleClarityNo = () => { setReturning(true); };
  const handleReturnDone = () => { goPhase("phase_volume"); };

  const addRequest = () => {
    if (!reqInput.trim()) return;
    setRequests(p => [...p, { text: reqInput.trim(), clarity: null, relax: null }]);
    setReqInput("");
  };

  const updateRequest = (idx, field, val) => {
    setRequests(p => p.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };

  const LangBtn = ({ stopProp }) => (
    <button
      onClick={(e) => { if (stopProp) e.stopPropagation(); setLang(l => l === "id" ? "en" : "id"); }}
      style={{
        background: "transparent", border: `1px solid ${C.faint}`,
        color: C.dim, padding: "4px 10px",
        ...mono, fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase",
      }}
    >{t.toggle}</button>
  );

  // ─── SPLASH ───────────────────────────────────────────────────────────────
  if (screen === "splash") {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "default", position: "relative" }}>
        <style>{CSS}</style>
        <div className="blood-orb" />
        <div style={{ position: "fixed", top: "20px", right: "24px", zIndex: 10 }}>
          <LangBtn stopProp />
        </div>
        <h1 style={{ ...serif, fontSize: "clamp(32px,7vw,68px)", color: C.bone, fontWeight: 300, letterSpacing: "6px", textAlign: "center", margin: "0 0 32px 0", animation: "fadeUp 1.2s ease forwards", opacity: 0 }}>
          {t.splashQ}
        </h1>
        <p style={{ ...mono, fontSize: "11px", color: C.dim, letterSpacing: "4px", textTransform: "uppercase", animation: "fadeUp 1.8s ease forwards", animationDelay: ".5s", opacity: 0, animationFillMode: "forwards" }}>
          {t.splashHint}
        </p>
      </div>
    );
  }

  // ─── MAIN ─────────────────────────────────────────────────────────────────
  const dateStr = new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.bone, position: "relative" }}>
      <style>{CSS}</style>
      <div className="blood-orb" />

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.faint}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
        <span style={{ ...mono, fontSize: "10px", color: C.faint, letterSpacing: "3px" }}>
          PROJECT: LITTLE BIT DYING
        </span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ ...mono, fontSize: "9px", color: C.faint, letterSpacing: "2px" }}>{dateStr}</span>
          <LangBtn />
        </div>
      </div>

      {/* Nav */}
      <div style={{ borderBottom: `1px solid ${C.faint}`, display: "flex", position: "relative", zIndex: 2 }}>
        {[["ritual", t.nav_ritual], ["log", t.nav_log], ["history", t.nav_history]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setNav(key)}
            style={{
              flex: 1, padding: "12px",
              background: nav === key ? C.panel : "transparent",
              border: "none",
              borderBottom: nav === key ? `2px solid ${C.blood}` : "2px solid transparent",
              color: nav === key ? C.bone : C.dim,
              ...mono, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
            }}
          >{label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 2 }}>

        {/* ════ RITUAL ════ */}
        {nav === "ritual" && (
          <div>
            <PhaseBar current={phase} t={t} />

            {/* RETURN TO VOLUME */}
            {returning && (
              <ReturnToVolume t={t} object={object} onReturn={handleReturnDone} />
            )}

            {/* PHASE: VOLUME */}
            {!returning && phase === "phase_volume" && (
              <div className="phase-enter">
                <h2 style={{ ...serif, fontSize: "clamp(28px,5vw,44px)", fontWeight: 300, margin: "0 0 12px 0", letterSpacing: "2px" }}>
                  {t.vol_heading}
                </h2>
                <p style={{ ...mono, fontSize: "11px", color: C.dim, margin: "0 0 32px 0", lineHeight: 1.8 }}>
                  {t.vol_sub}
                </p>
                <div style={{ marginBottom: "20px" }}>
                  <input
                    style={{ background: "transparent", border: "none", borderBottom: `1px solid ${C.faint}`, color: C.bone, width: "100%", padding: "8px 0", ...serif, fontSize: "28px", fontWeight: 300, fontStyle: "italic", letterSpacing: "1px" }}
                    placeholder={t.vol_placeholder}
                    value={object}
                    onChange={e => setObject(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: "32px" }}>
                  <div style={{ ...mono, fontSize: "10px", color: C.dim, letterSpacing: "2px", marginBottom: "10px" }}>{t.vol_duration}</div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input type="number" value={volH} onChange={e => setVolH(e.target.value)}
                      placeholder="0"
                      style={{ background: "transparent", border: `1px solid ${C.faint}`, color: C.bone, padding: "6px 10px", ...mono, fontSize: "20px", width: "80px", textAlign: "center" }} />
                    <span style={{ ...mono, fontSize: "12px", color: C.dim }}>{t.vol_hrs}</span>
                    <input type="number" value={volM} onChange={e => setVolM(e.target.value)}
                      placeholder="0"
                      style={{ background: "transparent", border: `1px solid ${C.faint}`, color: C.bone, padding: "6px 10px", ...mono, fontSize: "20px", width: "80px", textAlign: "center" }} />
                    <span style={{ ...mono, fontSize: "12px", color: C.dim }}>{t.vol_min}</span>
                  </div>
                </div>
                <button
                  onClick={() => { if (object.trim()) goPhase("phase_release"); }}
                  style={{
                    width: "100%", padding: "16px",
                    background: object.trim() ? C.bloodFaint : "transparent",
                    border: `1px solid ${object.trim() ? C.blood : C.faint}`,
                    color: object.trim() ? C.bone : C.faint,
                    ...mono, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase",
                  }}
                >{t.vol_ready}</button>
              </div>
            )}

            {/* PHASE: RELEASE */}
            {!returning && phase === "phase_release" && (
              <div className="phase-enter">
                <AnchorPulse label={t.rel_anchor} object={object} />
                <h2 style={{ ...serif, fontSize: "clamp(26px,5vw,42px)", fontWeight: 300, margin: "0 0 16px 0", letterSpacing: "2px" }}>
                  {t.rel_heading}
                </h2>
                <p style={{ ...mono, fontSize: "11px", color: C.dim, margin: "0 0 40px 0", lineHeight: 1.9 }}>
                  {t.rel_instruction}
                </p>
                <div style={{ borderTop: `1px solid ${C.faint}`, paddingTop: "32px" }}>
                  <h3 style={{ ...serif, fontSize: "clamp(22px,4vw,34px)", fontWeight: 300, margin: "0 0 12px 0", color: C.bone }}>
                    {t.rel_question}
                  </h3>
                  <p style={{ ...mono, fontSize: "10px", color: C.dim, margin: "0 0 24px 0", lineHeight: 1.9, whiteSpace: "pre-line" }}>
                    {t.rel_sub}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      onClick={() => { setReleaseAnswer(true); goPhase("phase_clarity"); }}
                      style={{ padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}
                    >{t.rel_yes}</button>
                    <button
                      onClick={() => { setReleaseAnswer(false); handleReleaseNo(); }}
                      style={{ padding: "16px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}
                    >{t.rel_no}</button>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE: CLARITY */}
            {!returning && phase === "phase_clarity" && (
              <div className="phase-enter">
                <AnchorPulse label={t.rel_anchor} object={object} />
                <h2 style={{ ...serif, fontSize: "clamp(26px,5vw,42px)", fontWeight: 300, margin: "0 0 16px 0", letterSpacing: "2px" }}>
                  {t.cla_heading}
                </h2>
                <p style={{ ...mono, fontSize: "11px", color: C.dim, margin: "0 0 40px 0", lineHeight: 1.9 }}>
                  {t.cla_instruction}
                </p>
                <div style={{ borderTop: `1px solid ${C.faint}`, paddingTop: "32px" }}>
                  <h3 style={{ ...serif, fontSize: "clamp(22px,4vw,34px)", fontWeight: 300, margin: "0 0 12px 0", color: C.bone }}>
                    {t.cla_question}
                  </h3>
                  <p style={{ ...mono, fontSize: "10px", color: C.dim, margin: "0 0 24px 0", lineHeight: 1.9, whiteSpace: "pre-line" }}>
                    {t.cla_sub}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      onClick={() => { setClarityAnswer(true); goPhase("phase_foundation"); }}
                      style={{ padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}
                    >{t.cla_yes}</button>
                    <button
                      onClick={() => { setClarityAnswer(false); handleClarityNo(); }}
                      style={{ padding: "16px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}
                    >{t.cla_no}</button>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE: FOUNDATION */}
            {!returning && phase === "phase_foundation" && (
              <div className="phase-enter">
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                  <div style={{ ...mono, fontSize: "9px", color: C.bloodDim, letterSpacing: "3px", marginBottom: "16px" }}>
                    {t.found_depth_label}
                  </div>
                  <h2 style={{ ...serif, fontSize: "clamp(32px,6vw,56px)", fontWeight: 300, margin: "0 0 16px 0", letterSpacing: "3px" }}>
                    {t.found_heading}
                  </h2>
                  <p style={{ ...mono, fontSize: "11px", color: C.dim, lineHeight: 2, whiteSpace: "pre-line", margin: "0 0 32px 0" }}>
                    {t.found_sub}
                  </p>
                </div>

                {/* Summary */}
                <div style={{ border: `1px solid ${C.blood}`, padding: "20px", background: C.bloodFaint, marginBottom: "32px" }}>
                  {[
                    [t.found_obj, object],
                    [t.found_vol, fmtVol()],
                    ["Deep Release", "✓"],
                    ["Deep Clarity", "✓"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${C.bloodDim}`, padding: "8px 0" }}>
                      <span style={{ ...mono, fontSize: "10px", color: C.dim, letterSpacing: "2px" }}>{k.toUpperCase()}</span>
                      <span style={{ ...serif, fontSize: "18px", color: C.bone, fontWeight: 300, fontStyle: "italic" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={() => { saveSession(); goPhase("phase_request"); }}
                    style={{ padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}
                  >{t.found_continue}</button>
                  <button
                    onClick={() => { saveSession(); }}
                    style={{ padding: "16px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}
                  >{t.found_close}</button>
                </div>
              </div>
            )}

            {/* PHASE: REQUEST */}
            {!returning && phase === "phase_request" && (
              <div className="phase-enter">
                <AnchorPulse label={t.rel_anchor} object={object} />
                <h2 style={{ ...serif, fontSize: "clamp(26px,5vw,42px)", fontWeight: 300, margin: "0 0 12px 0", letterSpacing: "2px" }}>
                  {t.req_heading}
                </h2>
                <p style={{ ...mono, fontSize: "11px", color: C.dim, margin: "0 0 28px 0", lineHeight: 1.9 }}>
                  {t.req_sub}
                </p>

                {/* Add request */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                  <input
                    style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid ${C.faint}`, color: C.bone, padding: "6px 0", ...serif, fontSize: "20px", fontWeight: 300, fontStyle: "italic" }}
                    placeholder={t.req_placeholder}
                    value={reqInput}
                    onChange={e => setReqInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addRequest(); }}
                  />
                  <button
                    onClick={addRequest}
                    style={{ background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, padding: "6px 14px", ...mono, fontSize: "11px", letterSpacing: "2px" }}
                  >{t.req_add}</button>
                </div>

                {/* Request list */}
                {requests.map((item, idx) => (
                  <RequestItem key={idx} item={item} idx={idx} t={t} onChange={updateRequest} />
                ))}

                {requests.length > 0 && (
                  <button
                    onClick={() => { saveSession(); }}
                    style={{ width: "100%", marginTop: "8px", padding: "14px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase" }}
                  >{t.req_finish}</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════ LOG ════ */}
        {nav === "log" && (
          <div className="fade-in">
            <h2 style={{ ...serif, fontSize: "28px", fontWeight: 300, margin: "0 0 24px 0", letterSpacing: "2px" }}>{t.log_heading}</h2>
            <div ref={logRef} style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "16px" }}>
              {log.length === 0 && (
                <p style={{ ...mono, fontSize: "11px", color: C.faint }}>{t.log_empty}</p>
              )}
              {log.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px", borderBottom: `1px solid ${C.faint}`, paddingBottom: "10px" }}>
                  <span style={{ ...mono, fontSize: "9px", color: C.blood, flexShrink: 0, paddingTop: "2px" }}>{e.ts}</span>
                  <span style={{ ...serif, fontSize: "17px", color: C.bone, fontWeight: 300, lineHeight: 1.5 }}>{e.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <textarea
                style={{ flex: 1, background: "transparent", border: `1px solid ${C.faint}`, color: C.bone, padding: "10px", ...mono, fontSize: "12px", resize: "none", height: "80px", lineHeight: 1.7 }}
                placeholder={t.log_placeholder}
                value={logInput}
                onChange={e => setLogInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addLog(); } }}
              />
              <button onClick={addLog} style={{ background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, padding: "10px 16px", ...mono, fontSize: "16px", alignSelf: "stretch" }}>→</button>
            </div>
          </div>
        )}

        {/* ════ HISTORY ════ */}
        {nav === "history" && (
          <div className="fade-in">
            <h2 style={{ ...serif, fontSize: "28px", fontWeight: 300, margin: "0 0 24px 0", letterSpacing: "2px" }}>{t.hist_heading}</h2>
            {sessions.length === 0 && (
              <p style={{ ...mono, fontSize: "11px", color: C.faint }}>{t.hist_empty}</p>
            )}
            {sessions.map((sesh, i) => {
              const days = Math.floor((new Date(dayKey()) - new Date(sesh.date)) / 86400000);
              return (
                <div key={i} style={{ border: `1px solid ${C.faint}`, padding: "20px", marginBottom: "12px", background: C.panel }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
                    <span style={{ ...serif, fontSize: "20px", color: C.bone, fontWeight: 300, fontStyle: "italic" }}>{sesh.object || "—"}</span>
                    <span style={{ ...mono, fontSize: "9px", color: C.dim, letterSpacing: "2px" }}>{t.days_ago(days)}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: sesh.requests?.length ? "14px" : 0 }}>
                    {[
                      [t.hist_vol, `${sesh.volH||0}j ${sesh.volM||0}m`],
                      ["Release", sesh.releaseAnswer ? "✓" : "—"],
                      ["Clarity", sesh.clarityAnswer ? "✓" : "—"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ textAlign: "center" }}>
                        <div style={{ ...mono, fontSize: "8px", color: C.bloodDim, letterSpacing: "2px", marginBottom: "4px" }}>{k.toUpperCase()}</div>
                        <div style={{ ...serif, fontSize: "18px", color: C.bone, fontWeight: 300 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {sesh.requests?.length > 0 && (
                    <div style={{ borderTop: `1px solid ${C.faint}`, paddingTop: "12px" }}>
                      <div style={{ ...mono, fontSize: "8px", color: C.faint, letterSpacing: "2px", marginBottom: "8px" }}>{t.hist_req.toUpperCase()}</div>
                      {sesh.requests.map((r, ri) => (
                        <div key={ri} style={{ ...serif, fontSize: "15px", color: C.dim, fontStyle: "italic", marginBottom: "4px" }}>
                          {r.text}
                          <span style={{ ...mono, fontSize: "9px", color: C.bloodDim, marginLeft: "10px" }}>
                            {r.clarity ? "C✓" : "C—"} {r.relax ? "R✓" : "R—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
