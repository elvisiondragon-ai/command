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

    // Reason Selection
    reason_q: "Apa alasan mu kesini? Keadaan mu Sekarang.",
    reason_a: "Stuck dan Lost",
    reason_b: "Marah Terhadap Tuhan",
    reason_b_intro: "Sadarilah bahwa Tuhan menggunakan ilmu, dan ilmu ini adalah anugrah terbesar yang diberikan ke kamu. Ini memberikanmu kontrol dan kesadaran atas kekuatan hukum alam.",
    reason_b_confirm: "Siap memahami hukum alam?",

    // Bleed Check
    bleed_q: "Sudahkah kamu berdarah hari ini?",

    // Phases
    phase_diag: "DIAGNOSIS",
    phase_bleed: "SACRIFICE",
    phase_vol: "VOLUME",
    phase_clarity: "CLARITY",
    phase_relax: "RELAX",
    phase_triangle: "eL TRIANGLE",
    phase_desire_clarity: "INTENSI",
    phase_desire_relax: "PELEPASAN",

    // Volume
    vol_heading: "Apa titik fokusmu?",
    vol_sub: "Satu objek. Pegang selama mungkin. Tidak ada yang lain.",
    vol_placeholder: "musik / lilin / nafas / ...",
    vol_duration: "Sudah berapa lama?",
    vol_ready: "Siap masuk ke dalam →",

    // Checkpoint Clarity Reality
    check_cla_q: "Apakah Volume Fokus realita sudah diminta untuk kejelasan yang dalam dan terasa jelas?",
    check_cla_no: "Deep Clarity didapatkan bukan dengan usaha memaksa, tapi meminta kepada volume 1 titik jika sudah lama. Jika volume cukup, akan langsung terasa kejelasan yang dalam.",
    check_return: "Kembali kesini nanti.",

    // Checkpoint Relax Reality
    check_rel_q: "Apakah realita yang difokuskan sudah terasa Deep Relax saat diminta?",
    check_rel_no: "Deep Relax didapatkan bukan dengan usaha pura-pura, tapi meminta kepada volume 1 titik. Jika sudah lama, fokus 1 titik akan mewujudkan rasa lepas yang dalam. Jika belum cukup, kembali fokus 1 titik.",

    // eL Triangle / Desire Input
    tri_heading: "Realitas anda sudah eL Triangle.",
    tri_sub: "Sadari bahwa Keinginan kamu mustahil melampaui level eL Triangle saat ini.",
    tri_q: "Apa Keinginan yang sedang kamu fokuskan?",
    tri_placeholder: "misal: 200 juta",

    // Desire Clarity
    des_cla_q: (d) => `Apakah ${d} ini sudah diniatkan terasa begitu jelas yang dalam dengan meminta kepada fokus 1 titik?`,
    des_cla_no: (d) => `Deep Clarity ${d} didapatkan bukan dengan usaha memaksa, tapi meminta kepada volume 1 titik. Jika sudah lama, jika Realita sudah sangat jelas, akan langsung terasa Kejelasan yang dalam.`,
    des_cla_note: "Keinginan mu hanya sebatas level kesadaran Realitas mu, eL Triangle mu.",

    // Desire Relax
    des_rel_q: (d) => `Apakah ${d} ini sudah diniatkan terasa begitu Deep Relax dan Plong?`,
    des_rel_no: (d) => `${d} Deep Relax didapatkan bukan dengan usaha pura-pura, tapi meminta kepada Realitas yang sangat deep relax. Jika realitas sudah sangat deep relax, akan mewujudkan rasa lepas yang dalam di ${d}. Jika belum cukup, kembali fokus 1 titik dan meminta realitasmu terasa sangat Deep Relax.`,

    // Success
    final_heading: "Kamu sedang berproses yang benar.",
    final_msg: "Berdarah setiap hari dengan keyakinan pada momentumnya akan menemukan titik beruntung dan kesiapan. Lanjutkan, jangan dikurangi pengorbanannya.",

    // UI
    btn_yes: "Sudah",
    btn_no: "Belum",
    btn_continue: "Lanjut →",
    btn_back: "Kembali ke Awal",
  },
  en: {
    toggle: "ID",
    splashQ: "Have You Bled Today?",
    splashHint: "touch to enter",

    reason_q: "What brings you here? Your current state.",
    reason_a: "Stuck and Lost",
    reason_b: "Angry at God",
    reason_b_intro: "Realize that God uses knowledge (science), and this knowledge is the greatest gift given to you. It gives you control and awareness over the powers of natural law.",
    reason_b_confirm: "Ready to understand natural law?",

    phase_diag: "DIAGNOSIS",
    phase_vol: "VOLUME",
    phase_clarity: "CLARITY",
    phase_relax: "RELAX",
    phase_triangle: "eL TRIANGLE",
    phase_desire_clarity: "INTENT",
    phase_desire_relax: "RELEASE",

    vol_heading: "What is your focus point?",
    vol_sub: "One object. Hold it as long as possible. Nothing else.",
    vol_placeholder: "music / candle / breath / ...",
    vol_duration: "How long so far?",
    vol_ready: "Ready to go deeper →",

    check_cla_q: "Has the Volume Focus reality been requested for deep clarity and feels clear?",
    check_cla_no: "Deep Clarity is not obtained through force, but by requesting from 1-point volume after sufficient time. If volume is enough, deep clarity will be felt immediately.",
    check_return: "Return here later.",

    check_rel_q: "Does the focused reality feel Deep Relax when requested?",
    check_rel_no: "Deep Relax is not obtained by faking it, but by requesting from 1-point volume. If held long enough, 1-point focus will manifest deep release. If not enough, return to 1-point focus.",

    tri_heading: "Your reality is now eL Triangle.",
    tri_sub: "Realize that your Desire cannot possibly exceed your current eL Triangle level.",
    tri_q: "What Desire are you focusing on?",
    tri_placeholder: "e.g., 200 million",

    des_cla_q: (d) => `Has this ${d} been intended to feel so deeply clear by requesting from the 1-point focus?`,
    des_cla_no: (d) => `Deep Clarity for ${d} is not obtained through force, but by requesting from 1-point volume. If held long enough, and if Reality is already very clear, deep clarity will be felt immediately.`,
    des_cla_note: "Your desire is only as far as the level of your Reality consciousness, your eL Triangle.",

    des_rel_q: (d) => `Has this ${d} been intended to feel Deep Relax and 'Plong' (released)?`,
    des_rel_no: (d) => `Deep Relax for ${d} is not obtained by faking it, but by requesting from a reality that is already very deep relax. If your reality is deeply relaxed, it will manifest deep release in ${d}. If not enough, return to 1-point focus and request your reality to feel Deep Relax.`,

    final_heading: "You are processing correctly.",
    final_msg: "Bleed every day with the conviction that in its momentum, you will find the point of luck and readiness. Continue, do not reduce the sacrifice.",

    btn_yes: "Yes",
    btn_no: "Not Yet",
    btn_continue: "Continue →",
    btn_back: "Return to Start",
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
  .blood-orb {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background: radial-gradient(ellipse at 50% 50%, #8B1A1A1A 0%, transparent 68%);
    animation: pulseBlood 5s ease-in-out infinite;
  }
  .phase-enter { animation: fadeUp 0.6s ease forwards; }
  button { cursor: pointer; transition: all 0.2s; }
  button:hover { opacity: .8; transform: translateY(-1px); }
`;

export default function LostPage() {
  const [lang, setLang] = useState(() => load("lang", "id"));
  const t = T[lang];

  const [screen, setScreen] = useState("splash");
  const [phase, setPhase] = useState("reason");
  const [reason, setReason] = useState(null);
  const [stop, setStop] = useState(false); // When they hit a "Belum"

  // Inputs
  const [object, setObject] = useState("");
  const [volH, setVolH] = useState("");
  const [volM, setVolM] = useState("");
  const [desire, setDesire] = useState("");

  const go = (p) => { setPhase(p); window.scrollTo(0,0); };
  const halt = () => { setStop(true); window.scrollTo(0,0); };

  // Splash click
  useEffect(() => {
    if (screen !== "splash") return;
    const h = () => setScreen("main");
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [screen]);

  const Header = () => (
    <div style={{ borderBottom: `1px solid ${C.faint}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", position: "relative", zIndex: 5 }}>
      <span style={{ ...mono, fontSize: "10px", color: C.faint, letterSpacing: "3px" }}>PROJECT: LOST</span>
      <button onClick={() => setLang(l => l === "id" ? "en" : "id")} style={{ background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, padding: "4px 10px", ...mono, fontSize: "9px" }}>{t.toggle}</button>
    </div>
  );

  if (screen === "splash") {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <style>{CSS}</style>
        <div className="blood-orb" />
        <h1 style={{ ...serif, fontSize: "clamp(32px,7vw,68px)", color: C.bone, fontWeight: 300, letterSpacing: "6px", textAlign: "center", animation: "fadeUp 1.2s ease forwards" }}>{t.splashQ}</h1>
        <p style={{ ...mono, fontSize: "11px", color: C.dim, letterSpacing: "4px", textTransform: "uppercase", marginTop: "20px" }}>{t.splashHint}</p>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.bone, position: "relative" }}>
      <style>{CSS}</style>
      <div className="blood-orb" />
      <Header />

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 2 }}>
        
        {/* REASON SELECTION */}
        {phase === "reason" && (
          <div className="phase-enter">
            <h2 style={{ ...serif, fontSize: "32px", fontWeight: 300, marginBottom: "32px" }}>{t.reason_q}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button onClick={() => { setReason("lost"); go("volume"); }} style={{ padding: "20px", background: C.panel, border: `1px solid ${C.faint}`, color: C.bone, ...mono, fontSize: "12px", textAlign: "left" }}>
                A. {t.reason_a}
              </button>
              <button onClick={() => { setReason("angry"); go("angry_intro"); }} style={{ padding: "20px", background: C.panel, border: `1px solid ${C.faint}`, color: C.bone, ...mono, fontSize: "12px", textAlign: "left" }}>
                B. {t.reason_b}
              </button>
            </div>
          </div>
        )}

        {/* ANGRY INTRO */}
        {phase === "angry_intro" && (
          <div className="phase-enter">
            <p style={{ ...serif, fontSize: "24px", lineHeight: 1.6, color: C.dim, marginBottom: "32px", fontStyle: "italic" }}>{t.reason_b_intro}</p>
            <h3 style={{ ...serif, fontSize: "28px", fontWeight: 300, marginBottom: "24px" }}>{t.reason_b_confirm}</h3>
            <button onClick={() => go("volume")} style={{ width: "100%", padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px", letterSpacing: "2px" }}>
              SIAP →
            </button>
          </div>
        )}

        {/* PHASE: VOLUME */}
        {phase === "volume" && (
          <div className="phase-enter">
            <h2 style={{ ...serif, fontSize: "36px", fontWeight: 300, marginBottom: "12px" }}>{t.vol_heading}</h2>
            <p style={{ ...mono, fontSize: "11px", color: C.dim, marginBottom: "24px" }}>{t.vol_sub}</p>
            <input 
              style={{ background: "transparent", border: "none", borderBottom: `1px solid ${C.faint}`, color: C.bone, width: "100%", padding: "12px 0", ...serif, fontSize: "32px", fontStyle: "italic", marginBottom: "32px" }}
              placeholder={t.vol_placeholder} value={object} onChange={e => setObject(e.target.value)}
            />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ ...mono, fontSize: "10px", color: C.dim, letterSpacing: "2px", marginBottom: "12px" }}>{t.vol_duration}</div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="number" placeholder="0" value={volH} onChange={e => setVolH(e.target.value)} style={{ background: "transparent", border: `1px solid ${C.faint}`, color: C.bone, padding: "10px", width: "80px", textAlign: "center", ...mono, fontSize: "20px" }} />
                <span style={{ ...mono, fontSize: "12px", color: C.dim }}>HRS</span>
                <input type="number" placeholder="0" value={volM} onChange={e => setVolM(e.target.value)} style={{ background: "transparent", border: `1px solid ${C.faint}`, color: C.bone, padding: "10px", width: "80px", textAlign: "center", ...mono, fontSize: "20px" }} />
                <span style={{ ...mono, fontSize: "12px", color: C.dim }}>MIN</span>
              </div>
            </div>
            <button disabled={!object} onClick={() => go("check_clarity")} style={{ width: "100%", padding: "16px", background: object ? C.bloodFaint : "transparent", border: `1px solid ${object ? C.blood : C.faint}`, color: object ? C.bone : C.faint, ...mono, fontSize: "12px", letterSpacing: "2px" }}>
              {t.vol_ready}
            </button>
          </div>
        )}

        {/* CHECK CLARITY REALITY */}
        {phase === "check_clarity" && (
          <div className="phase-enter">
            <h2 style={{ ...serif, fontSize: "28px", fontWeight: 300, marginBottom: "32px", lineHeight: 1.4 }}>{t.check_cla_q}</h2>
            {!stop ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={() => go("check_relax")} style={{ padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px" }}>{t.btn_yes}</button>
                <button onClick={halt} style={{ padding: "16px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "12px" }}>{t.btn_no}</button>
              </div>
            ) : (
              <div className="phase-enter">
                <p style={{ ...mono, fontSize: "13px", lineHeight: 1.8, color: C.bone, marginBottom: "24px" }}>{t.check_cla_no}</p>
                <p style={{ ...mono, fontSize: "11px", color: C.blood, letterSpacing: "2px" }}>{t.check_return}</p>
              </div>
            )}
          </div>
        )}

        {/* CHECK RELAX REALITY */}
        {phase === "check_relax" && (
          <div className="phase-enter">
            <h2 style={{ ...serif, fontSize: "28px", fontWeight: 300, marginBottom: "32px", lineHeight: 1.4 }}>{t.check_rel_q}</h2>
            {!stop ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={() => go("triangle")} style={{ padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px" }}>{t.btn_yes}</button>
                <button onClick={halt} style={{ padding: "16px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "12px" }}>{t.btn_no}</button>
              </div>
            ) : (
              <div className="phase-enter">
                <p style={{ ...mono, fontSize: "13px", lineHeight: 1.8, color: C.bone, marginBottom: "24px" }}>{t.check_rel_no}</p>
                <p style={{ ...mono, fontSize: "11px", color: C.blood, letterSpacing: "2px" }}>{t.check_return}</p>
              </div>
            )}
          </div>
        )}

        {/* PHASE: eL TRIANGLE */}
        {phase === "triangle" && (
          <div className="phase-enter">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ ...serif, fontSize: "42px", fontWeight: 300, color: C.bone, marginBottom: "12px" }}>{t.tri_heading}</h2>
              <p style={{ ...mono, fontSize: "11px", color: C.dim }}>{t.tri_sub}</p>
            </div>
            <h3 style={{ ...serif, fontSize: "24px", fontWeight: 300, marginBottom: "16px" }}>{t.tri_q}</h3>
            <input 
              style={{ background: "transparent", border: "none", borderBottom: `1px solid ${C.faint}`, color: C.bone, width: "100%", padding: "12px 0", ...serif, fontSize: "28px", fontStyle: "italic", marginBottom: "32px" }}
              placeholder={t.tri_placeholder} value={desire} onChange={e => setDesire(e.target.value)}
            />
            <button disabled={!desire} onClick={() => go("desire_clarity")} style={{ width: "100%", padding: "16px", background: desire ? C.bloodFaint : "transparent", border: `1px solid ${desire ? C.blood : C.faint}`, color: desire ? C.bone : C.faint, ...mono, fontSize: "12px", letterSpacing: "2px" }}>
              {t.btn_continue}
            </button>
          </div>
        )}

        {/* CHECK DESIRE CLARITY */}
        {phase === "desire_clarity" && (
          <div className="phase-enter">
            <h2 style={{ ...serif, fontSize: "28px", fontWeight: 300, marginBottom: "32px", lineHeight: 1.4 }}>{t.des_cla_q(desire)}</h2>
            {!stop ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={() => go("desire_relax")} style={{ padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px" }}>{t.btn_yes}</button>
                <button onClick={halt} style={{ padding: "16px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "12px" }}>{t.btn_no}</button>
              </div>
            ) : (
              <div className="phase-enter">
                <p style={{ ...mono, fontSize: "13px", lineHeight: 1.8, color: C.bone, marginBottom: "24px" }}>{t.des_cla_no(desire)}</p>
                <div style={{ padding: "16px", background: C.bloodFaint, borderLeft: `2px solid ${C.blood}`, marginBottom: "24px" }}>
                  <p style={{ ...mono, fontSize: "11px", color: C.bone }}>NOTE: {t.des_cla_note}</p>
                </div>
                <p style={{ ...mono, fontSize: "11px", color: C.blood, letterSpacing: "2px" }}>{t.check_return}</p>
              </div>
            )}
          </div>
        )}

        {/* CHECK DESIRE RELAX */}
        {phase === "desire_relax" && (
          <div className="phase-enter">
            <h2 style={{ ...serif, fontSize: "28px", fontWeight: 300, marginBottom: "32px", lineHeight: 1.4 }}>{t.des_rel_q(desire)}</h2>
            {!stop ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={() => go("success")} style={{ padding: "16px", background: C.bloodFaint, border: `1px solid ${C.blood}`, color: C.bone, ...mono, fontSize: "12px" }}>{t.btn_yes}</button>
                <button onClick={halt} style={{ padding: "16px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "12px" }}>{t.btn_no}</button>
              </div>
            ) : (
              <div className="phase-enter">
                <p style={{ ...mono, fontSize: "13px", lineHeight: 1.8, color: C.bone, marginBottom: "24px" }}>{t.des_rel_no(desire)}</p>
                <p style={{ ...mono, fontSize: "11px", color: C.blood, letterSpacing: "2px" }}>{t.check_return}</p>
              </div>
            )}
          </div>
        )}

        {/* SUCCESS */}
        {phase === "success" && (
          <div className="phase-enter" style={{ textAlign: "center" }}>
            <h2 style={{ ...serif, fontSize: "42px", fontWeight: 300, color: C.bone, marginBottom: "24px" }}>{t.final_heading}</h2>
            <p style={{ ...serif, fontSize: "22px", lineHeight: 1.6, color: C.dim, fontStyle: "italic", marginBottom: "40px" }}>{t.final_msg}</p>
            <button onClick={() => { setStop(false); setDesire(""); go("reason"); }} style={{ padding: "12px 32px", background: "transparent", border: `1px solid ${C.faint}`, color: C.dim, ...mono, fontSize: "10px", letterSpacing: "2px" }}>{t.btn_back}</button>
          </div>
        )}

        {/* STOP STATE ACTION */}
        {stop && (
          <button onClick={() => { setStop(false); go("reason"); }} style={{ marginTop: "40px", width: "100%", padding: "12px", background: "transparent", border: `1px solid ${C.faint}`, color: C.faint, ...mono, fontSize: "10px", letterSpacing: "2px" }}>
            {t.btn_back}
          </button>
        )}

      </div>
    </div>
  );
}
