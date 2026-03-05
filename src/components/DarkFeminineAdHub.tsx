import { useState } from "react";
import {
    Megaphone, TrendingUp, DollarSign, MousePointer, Target, ShoppingCart,
    CheckCircle, PauseCircle, AlertTriangle, Flame, Zap, Copy, Check,
    BarChart2, Activity, Info, RefreshCw, Loader2, Globe
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
    DF_CAMPAIGN, DF_ADSETS, DF_DAILY, DF_ALL_CAMPAIGNS,
    DateRange, CampaignRegion,
} from "@/data/darkfeminine";
import type { CampaignData } from "@/data/darkfeminine";
import { useDarkFemLive } from "@/hooks/useDarkFemLive";
import type { LiveAdInsight } from "@/hooks/useDarkFemLive";

// ── helpers ──────────────────────────────────────────────────
const fmtRp = (n: number) =>
    n >= 1_000_000 ? `Rp ${(n / 1_000_000).toFixed(2)}M`
        : n >= 1_000 ? `Rp ${(n / 1000).toFixed(0)}K`
            : `Rp ${Math.round(n)}`;

type AbsorpStatus = "top" | "active" | "low" | "ghost" | "paused";

function getAbsorption(ad: LiveAdInsight): AbsorpStatus {
    if (ad.status === "PAUSED") return "paused";
    if (ad.spend > 100_000) return "top";
    if (ad.spend > 10_000 && ad.impressions > 50) return "active";
    if (ad.spend > 0 && ad.impressions > 0) return "low";
    return "ghost";
}

const ABSORB_META: Record<AbsorpStatus, { label: string; color: string; bg: string; icon: React.ReactNode; why: string }> = {
    top: { label: "Top Spender", color: "text-emerald", bg: "bg-emerald/10", icon: <Flame className="w-3 h-3" />, why: "Winning the auction. Meta is allocating most budget here — highest relevance score. Keep running." },
    active: { label: "Active", color: "text-accent", bg: "bg-accent/10", icon: <Activity className="w-3 h-3" />, why: "Getting consistent delivery. Good healthy competition with other ads." },
    low: { label: "Low Absorb", color: "text-warning", bg: "bg-warning/10", icon: <AlertTriangle className="w-3 h-3" />, why: "Running but losing auctions to higher-performing creatives in the same adset." },
    ghost: { label: "Not Absorbed", color: "text-destructive", bg: "bg-destructive/10", icon: <Zap className="w-3 h-3" />, why: "Near-zero delivery. Creative ranked lowest in internal auction." },
    paused: { label: "Paused", color: "text-muted-foreground", bg: "bg-muted/40", icon: <PauseCircle className="w-3 h-3" />, why: "Manually paused. Not competing." },
};

const DATE_OPTIONS: { key: string; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "today_and_yesterday", label: "Today & Yesterday" },
    { key: "last_7d", label: "7 Days" },
    { key: "last_30d", label: "30 Days" },
    { key: "maximum", label: "Maximum" },
];

// ── Ad Table Row ──────────────────────────────────────────────
function AdRow({ ad, totalSpend }: {
    ad: LiveAdInsight; totalSpend: number;
}) {
    const absorb = getAbsorption(ad);
    const meta = ABSORB_META[absorb];
    const spendPct = totalSpend > 0 ? (ad.spend / totalSpend * 100) : 0;
    const displayName = ad.name.replace(/^DF_/, "").replace(/_/g, " ");
    const isVideo = ad.name.toLowerCase().includes("video");

    return (
        <div className="py-3 px-2 hover:bg-muted/20 transition-colors rounded-xl mb-2 border border-border/10 bg-muted/5">
            <div className="grid grid-cols-12 text-xs mb-3 items-center">
                <span className="col-span-4 font-bold truncate pr-2 flex items-center gap-1.5 text-accent">
                    {isVideo ? "🎬" : "🖼️"} {displayName}
                </span>
                <span className="col-span-2 text-right font-mono font-bold text-foreground text-[10px]">{fmtRp(ad.spend)}</span>
                <span className={`col-span-1 text-right font-bold text-[10px] ${ad.ctr >= 8 ? "text-emerald" : ad.ctr >= 5 ? "text-accent" : ad.ctr > 0 ? "text-warning" : "text-muted-foreground/40"}`}>
                    {ad.ctr > 0 ? `${ad.ctr.toFixed(1)}%` : "—"}
                </span>
                <span className="col-span-2 flex justify-center">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${ad.status === "ACTIVE" ? "bg-emerald/10 text-emerald border border-emerald/20" : "bg-warning/10 text-warning border border-warning/20"}`}>{ad.status}</span>
                </span>
                <span className="col-span-3 flex justify-end">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${meta.bg} ${meta.color} border border-current/20`}>
                        {meta.icon} {meta.label}
                    </span>
                </span>
            </div>


            <div className="grid grid-cols-6 gap-2 text-[10px]">
                <div className="bg-background/50 rounded-lg p-2 border border-border/20 text-center"><p className="text-muted-foreground mb-0.5">Reach</p><p className="font-bold text-foreground">{ad.reach.toLocaleString()}</p></div>
                <div className="bg-background/50 rounded-lg p-2 border border-border/20 text-center"><p className="text-muted-foreground mb-0.5">Impr.</p><p className="font-bold text-foreground">{ad.impressions.toLocaleString()}</p></div>
                <div className="bg-background/50 rounded-lg p-2 border border-border/20 text-center"><p className="text-muted-foreground mb-0.5">Clicks</p><p className="font-bold text-foreground">{ad.linkClicks.toLocaleString()}</p></div>
                <div className="bg-background/50 rounded-lg p-2 border border-border/20 text-center"><p className="text-muted-foreground mb-0.5">CPC</p><p className="font-bold text-foreground">{ad.linkClicks > 0 ? fmtRp(ad.spend / ad.linkClicks) : '—'}</p></div>
                <div className={`rounded-lg p-2 border border-border/20 text-center ${ad.purchases > 0 ? 'bg-emerald/10 border-emerald/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-background/50'}`}>
                    <p className="text-muted-foreground mb-0.5">Purchase</p>
                    <p className={`font-black ${ad.purchases > 0 ? 'text-emerald' : 'text-foreground/50'}`}>{ad.purchases > 0 ? `${ad.purchases} 🛒` : '—'}</p>
                </div>
                <div className={`rounded-lg p-2 border border-border/20 text-center ${ad.addPaymentInfo > 0 ? 'bg-accent/10 border-accent/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-background/50'}`}>
                    <p className="text-muted-foreground mb-0.5">Add Pay</p>
                    <p className={`font-black ${ad.addPaymentInfo > 0 ? 'text-accent' : 'text-foreground/50'}`}>{ad.addPaymentInfo > 0 ? `${ad.addPaymentInfo} 💳` : '—'}</p>
                </div>
            </div>

            {ad.purchases > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-emerald/5 border border-emerald/20 text-[10px] text-emerald font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                    <span>Converting ad — CPA: <strong>{fmtRp(ad.cpaPurchase)}</strong> {ad.cpaPurchase < 80000 ? "🏆 Scalable Winner!" : "✅ Healthy."}</span>
                </div>
            )}
        </div>
    );
}

// ── Paused Ad Row ─────────────────────────────────────────────
function PausedAdRow({ ad }: { ad: LiveAdInsight }) {
    const meta = ABSORB_META["paused"];
    const displayName = ad.name.replace(/^DF_/, "").replace(/_/g, " ");
    return (
        <div className="grid grid-cols-12 text-xs py-2.5 px-2 opacity-40">
            <span className="col-span-3 truncate pr-2 flex items-center gap-1.5">{ad.name.includes("Video") ? "🎬" : "🖼️"} {displayName}</span>
            <span className="col-span-1 text-right">—</span>
            <span className="col-span-1 text-right">—</span>
            <span className="col-span-1 text-center">—</span>
            <span className="col-span-1 text-center">—</span>
            <span className="col-span-2 flex justify-center"><span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-warning/10 text-warning">PAUSED</span></span>
            <span className="col-span-3 flex justify-center">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${meta.bg} ${meta.color}`}>{meta.icon} {meta.label}</span>
            </span>
        </div>
    );
}

// ── Campaign Report Section for EN / PH (New Campaigns) ──────
function NewCampaignReport({ campaign }: { campaign: CampaignData }) {
    const isEN = campaign.region === "en";
    const adCount = campaign.ads.length;

    return (
        <div className="space-y-4">
            {/* Launch Status */}
            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
                <p className="text-xs font-bold text-accent mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4" /> {campaign.flag} {campaign.label} — Day 1 Live Report
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30 font-bold">LEARNING PHASE</span>
                </p>
                <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <p>• <strong className="text-foreground">Campaign:</strong> {campaign.name} ({campaign.id})</p>
                    <p>• <strong className="text-foreground">Adset:</strong> {campaign.adsets[0]?.name} ({campaign.adsets[0]?.id})</p>
                    <p>• <strong className="text-foreground">Landing:</strong> <a href={campaign.landingUrl} target="_blank" className="text-accent hover:underline">{campaign.landingUrl}</a></p>
                    <p>• <strong className="text-foreground">Ads Pushed:</strong> {adCount} image ads — all using PGM (Pain→Gain→Method) copy</p>
                    <p>• <strong className="text-foreground">Snapshot (Mar 3–4):</strong>
                        {isEN
                            ? <span> Spend <strong className="text-foreground">Rp 36K</strong> · CTR <strong className="text-emerald">9.76%</strong> · Clicks 5 · CPC Rp 4K · Reach 76 · 0 purchases (learning)</span>
                            : <span> Spend <strong className="text-foreground">Rp 16K</strong> · CTR <strong className="text-emerald">15.64%</strong> · Clicks 12 · CPC Rp 470 · Reach 203 · 0 purchases (learning)</span>
                        }
                    </p>
                    <div className={`mt-1 px-2 py-1 rounded-lg text-[10px] font-medium ${isEN ? 'bg-emerald/10 text-emerald' : 'bg-emerald/15 text-emerald border border-emerald/30'}`}>
                        {isEN
                            ? '✅ CTR 9.76% is strong — well above 5% threshold. Signal is positive. DO NOT touch yet.'
                            : '🔥 CTR 15.64% is exceptional — HIGHEST of all 3 markets. PH audience is responding powerfully.'}
                    </div>
                </div>
            </div>

            {/* Ad Copy Quality Report */}
            <div className="rounded-xl bg-emerald/5 border border-emerald/20 p-4">
                <p className="text-xs font-bold text-emerald mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Ad Copy Quality Assessment</p>
                <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
                    {isEN ? (
                        <>
                            <div className="border-l-2 border-emerald/50 pl-3">
                                <p className="font-semibold text-foreground">🥇 CURRENT LEADER: DF_EN_Image_01_Paradox — Rp 14K spend, CTR 4.00%</p>
                                <p className="mt-0.5">Day 1 leader by spend. Paradox hook ("Why does the average girl win?") creates cognitive dissonance — proven curiosity trigger. Absorbing budget well on Day 1.</p>
                            </div>
                            <div className="border-l-2 border-emerald/40 pl-3">
                                <p className="font-semibold text-foreground">🔥 WATCH NEXT: TheSecret / TherapistTrap / SocietyLie</p>
                                <p className="mt-0.5">These 3 mirror the ID winning pattern (Forbidden Knowledge + Betrayal). DF_Secret is ID's #1 ad — English version should emerge as top once Meta's learning stabilizes. CTR &gt;5% expected.</p>
                            </div>
                            <div className="border-l-2 border-warning/50 pl-3">
                                <p className="font-semibold text-foreground">⚠️ STILL MONITOR: FuckboyCycle / FantasyScreen / 2AMScroll</p>
                                <p className="mt-0.5">Riskier for conservative SG/MY audience. Aspirational hooks failed in ID (DF_Drakor = 0% CTR). If CTR &lt;1% after Day 3, pause immediately — don't let them drain budget.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="border-l-2 border-emerald/50 pl-3">
                                <p className="font-semibold text-foreground">🥇 CURRENT LEADER: DF_PH_Image_01_Paradox — Rp 5K spend, CTR 15.69%</p>
                                <p className="mt-0.5">Day 1 leader with 15.69% CTR — extraordinary. Filipino audience responds hard to the Paradox hook. PH total campaign CTR 15.64% is the HIGHEST of all 3 markets (ID 5.10%, EN 9.76%).</p>
                            </div>
                            <div className="border-l-2 border-emerald/40 pl-3">
                                <p className="font-semibold text-foreground">🔥 WATCH NEXT: Secret / SocietyLie (Tagalog)</p>
                                <p className="mt-0.5">"Ang Lihim na Hindi Itinuro sa Iyo" mirrors ID's #1. Filipino emotional culture + low CPC (Rp 470) = cheapest clicks of all markets. These hooks should convert hard once budget distributes.</p>
                            </div>
                            <div className="border-l-2 border-warning/50 pl-3">
                                <p className="font-semibold text-foreground">⚠️ WATCH: KDrama / NiceGirl</p>
                                <p className="mt-0.5">Aspirational hooks risk passive dreaming. NiceGirl headline is in English — possible disconnect. If CTR &lt;2% after Day 3, pause immediately. Budget is cheap here, move it to winners fast.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Optimization Plan */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-bold text-primary mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Optimization Plan — {campaign.label}</p>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                    {[
                        isEN
                            ? "✅ Day 1 signal: CTR 9.76% — STRONG. DO NOT touch. Meta still learning."
                            : "🔥 Day 1 signal: CTR 15.64% — EXCEPTIONAL. Cheapest traffic (CPC Rp 470). DO NOT touch.",
                        "Day 3 (Mar 6): Identify any ghost ads (0 impressions) → mark for pause.",
                        "Day 5 (Mar 8): Pause ghost + CTR <1% ads. Budget auto-flows to winners.",
                        isEN
                            ? "Watch TheSecret + SocietyLie — CTR >5% = winner signal matching ID market."
                            : "Watch Secret + SocietyLie (Tagalog) — CTR >5% = confirmed winner. PH avatar is emotional.",
                        isEN
                            ? "If campaign CTR stays <5% after Day 5 → SG/MY audience needs more sophisticated copy angles."
                            : "PH has lowest CPC (Rp 470) — if ROAS >3x after Day 7, scale budget to Rp 50K/day (double).",
                        isEN
                            ? "SG/MY: more educated audience — identity reframe + curiosity beats raw emotional hooks."
                            : "Filipino audience: raw Tagalog pain hooks ('iniwan', 'niloko', 'bakit siya?') outperform.",
                        "DO NOT create new adsets — keep all ads in same adset for Meta CBO optimization.",
                        isEN
                            ? "Day 7: If 2+ purchases → scale budget +20%. If 0 → audit LP (SG/MY price sensitivity)."
                            : "Day 7: If 2+ purchases → PH is scalable market. Can double budget to Rp 30K/day.",
                    ].map((t, i) => (
                        <div key={i} className="flex gap-2"><span className="text-primary font-bold shrink-0">{i + 1}.</span><span>{t}</span></div>
                    ))}
                </div>
            </div>

            {/* Ads List (static, no live data yet) */}
            <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
                <p className="text-xs font-bold mb-3 flex items-center gap-2">📋 All Ads — {campaign.label} ({adCount} total)</p>
                <div className="space-y-1.5">
                    {campaign.ads.map(ad => (
                        <div key={ad.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-muted/30 text-[11px]">
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald/20 text-emerald shrink-0">LIVE ✅</span>
                            <span className="font-medium text-foreground truncate">{ad.name}</span>
                            <span className="text-muted-foreground ml-auto shrink-0">🖼️ Image</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 italic">💡 Live data syncing from Meta API — last snapshot 2026-03-04. Refresh to update.</p>
            </div>
        </div>
    );
}

// ── ID Campaign Analysis — Updated 2026-03-05 ────────────────
function IDCampaignReport() {
    return (
        <div className="space-y-4">
            {/* Winners */}
            <div className="rounded-xl bg-emerald/5 border border-emerald/20 p-4">
                <p className="text-xs font-bold text-emerald mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> 1. What Is Working &amp; Why</p>
                <div className="space-y-3 text-[11px] text-muted-foreground leading-relaxed">
                    <div className="border-l-2 border-emerald/50 pl-3"><p className="font-semibold text-foreground">🥇 DF_Secret_Ilmu_Tak_Pernah_Diajarkan — 73% budget · Rp 405K · CTR 5.41% · 3 purchases</p><p className="mt-0.5"><span className="text-emerald font-medium">Hook:</span> "Forbidden Knowledge" — loss aversion + exclusivity. Avatar feels deliberately kept ignorant. This ONE ad carries the entire campaign. <strong>Do NOT touch.</strong></p></div>
                    <div className="border-l-2 border-emerald/50 pl-3"><p className="font-semibold text-foreground">🥈 DF_TemanCurhat_Stop_Jadi_Opsi — Rp 43K · CTR 4.48% · <span className="text-emerald">2 purchases 🛒 ← SURPRISE WINNER</span></p><p className="mt-0.5"><span className="text-emerald font-bold">CPA Rp 21,643 = cheapest in entire account.</span> "Stop being the option" self-worth trigger converts at bottom of funnel despite modest CTR. Keep alive.</p></div>
                    <div className="border-l-2 border-emerald/30 pl-3"><p className="font-semibold text-foreground">🔥 DF_SocietyLie_Aturan_Bohong — CTR 12.41% (highest) · Rp 17.5K · budget-starved</p><p className="mt-0.5">Betrayal + Anger hook. Will surge when V3 ghosts are cleared and their micro-budget flows here.</p></div>
                    <div className="border-l-2 border-emerald/30 pl-3"><p className="font-semibold text-foreground">💡 DF_WakeUp_Bukan_Kurang_Cantik — CTR 11.54% · Rp 12K · budget-starved</p><p className="mt-0.5">Identity reframe hook resonating. Needs budget to test conversion.</p></div>
                    <div className="p-2 rounded-lg bg-emerald/10 text-emerald font-medium">🏆 <strong>ID VERDICT: WORKING.</strong> 6 purchases · ROAS 2.32x overall (inflated by ghost waste) → true ROAS post-purge est. 3.2x+. <strong>Scale Indonesia.</strong></div>
                </div>
            </div>

            {/* V3 Ghost Purge */}
            <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                <p className="text-xs font-bold text-destructive mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 2. V3 Batch — ALL GHOST → PAUSE NOW</p>
                <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <p className="text-destructive font-semibold mb-2">Every V3 ad confirmed 0% CTR after multiple days of spend. All losing internal auction to DF_Secret.</p>
                    {[
                        "DF_V2_Kenapa_Cewek_Baik — Rp 733 · 0% CTR · 0 clicks · 13 reach",
                        "DF_V3_Satu_Perubahan_Pria_Respect — Rp 381 · 0% CTR · 6 reach",
                        "DF_V2_Video_Gaby_Dari_Dibuang — Rp 357 · 0% CTR · 8 reach",
                        "DF_V3_Kenapa_Dipilih_Terakhir — Rp 343 · 0% CTR · 6 reach",
                        "DF_V3_Cantik_Tidak_Cukup — Rp 146 · 0% CTR · 2 reach",
                        "DF_V3_Mendingin_Tiba_V2 — Rp 108 · 0% CTR · 2 reach",
                        "DF_V3_Respect_V2 — Rp 88 · 0% CTR · 8 reach",
                    ].map((t, i) => <div key={i} className="border-l-2 border-destructive/40 pl-3 py-0.5 text-destructive/80">❌ {t}</div>)}
                    <div className="mt-2 p-2 rounded-lg bg-destructive/10 text-destructive font-medium">→ Pausing all 7 frees their micro-budget to flow to DF_Secret + DF_TemanCurhat + DF_SocietyLie</div>
                </div>
            </div>

            {/* Budget + Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
                    <p className="text-xs font-bold text-accent mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> 3. Budget Strategy</p>
                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                        <p><span className="text-foreground font-medium">30D overall:</span> Rp 557K · 6 purchases · ROAS 2.32x (dragged by V3 ghosts)</p>
                        <p><span className="text-emerald font-medium">True ROAS (winners only):</span> DF_Secret + TemanCurhat → <strong className="text-emerald">≈ ROAS 3.2x</strong></p>
                        <p><span className="text-accent font-medium">After V3 purge:</span> Overall ROAS auto-improves to 3x+ immediately</p>
                        <p><span className="text-emerald font-bold">Scale ID to: Rp 150K–200K/day</span> — market is proven.</p>
                        <p><span className="text-destructive font-medium">Never duplicate DF_Secret</span> — resets learning, kills ROAS.</p>
                    </div>
                </div>
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                    <p className="text-xs font-bold text-primary mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> 4. Next Actions (Priority)</p>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                        {[
                            "🔴 PAUSE all 7 V3 ghost ads NOW (0% CTR confirmed)",
                            "🟢 Scale ID budget → Rp 150K–200K/day",
                            "✅ Keep DF_TemanCurhat — CPA Rp 21K = cheapest in account",
                            "📈 Watch DF_SocietyLie (CTR 12.41%) surge after ghost purge",
                            "🎬 New creative: Video version of DF_Secret hook (ilmu terlarang angle)",
                            "🧪 New angle: 'Kenapa kamu selalu jadi pilihan terakhir?' (shame trigger)",
                            "🧪 New angle: 'Dia bukan luck — dia pakai ilmu ini' (envy + FOMO)",
                            "📦 Retargeting adset for LP visitors after Day 10",
                        ].map((t, i) => (
                            <div key={i} className="flex gap-2"><span className="text-primary font-bold shrink-0">{i + 1}.</span><span>{t}</span></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Log */}
            <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
                <p className="text-xs font-bold text-warning mb-2 flex items-center gap-2">🔄 Optimization Log — 2026-03-05</p>
                <div className="space-y-2 text-[11px]">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-destructive/20 text-destructive shrink-0 mt-0.5">DONE</span>
                        <p className="text-muted-foreground">Paused: Drakor (0% CTR) · NiceGirl (0% CTR) · Video Gaby (ghost) · SG Campaign (Rp 36K, 0 purchases — correctly killed)</p>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-warning/20 text-warning shrink-0 mt-0.5">⚠️ DO NOW</span>
                        <p className="text-muted-foreground">Pause 7 V3 ghost ads · Scale ID budget to Rp 150K/day · PH decision: run 3 more days</p>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald/20 text-emerald shrink-0 mt-0.5">WINNERS</span>
                        <p className="text-muted-foreground">DF_Secret (ROAS 3x+, dominant) · DF_TemanCurhat (surprise: 2 purchases, CPA Rp 21K)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────

export function DarkFeminineAdHub() {
    const [region, setRegion] = useState<CampaignRegion>("id");
    const [dateRange, setDateRange] = useState<DateRange>("today");
    const [copied, setCopied] = useState(false);
    const [expandedAd, setExpandedAd] = useState<string | null>(null);

    const campaign = DF_ALL_CAMPAIGNS.find(c => c.region === region) ?? DF_ALL_CAMPAIGNS[0];

    // ── LIVE DATA from Meta API ────────────────────────────────
    const { insights, ads, loading, error, lastSync, cacheAge, refresh } = useDarkFemLive(dateRange, region);

    const activeAds = ads.filter(a => a.status === "ACTIVE");
    const pausedAds = ads.filter(a => a.status === "PAUSED");
    const totalSpend = activeAds.reduce((s, a) => s + a.spend, 0);

    const ins = insights;
    const ASK_PROMPT = `Step 1 — Run this in terminal to fetch latest Meta data:
meta_ads/.venv/bin/python3 meta_ads/help/fetch_ads/fetch_meta_insights_today_yesterday.py

Step 2 — Paste the output here, then update src/components/DarkFeminineAdHub.tsx with next plan advice.

--- Current snapshot (${dateRange}) ---
Campaign: ${campaign.name} | ID: ${campaign.id} | Region: ${campaign.label}
Spend: ${ins ? fmtRp(ins.spend) : "?"} | Purchases: ${ins?.purchases ?? "?"} | ROAS: ${ins?.roas?.toFixed(2) ?? "?"}x
CTR: ${ins?.ctr?.toFixed(2) ?? "?"}% | Clicks: ${ins?.linkClicks ?? "?"} | CPC: ${ins ? fmtRp(ins.cpc) : "?"}
Reach: ${ins?.reach?.toLocaleString() ?? "?"} | Impressions: ${ins?.impressions?.toLocaleString() ?? "?"}

Top performer: ${ads[0]?.name ?? "—"} (spend ${ads[0] ? fmtRp(ads[0].spend) : "?"}, CTR ${ads[0]?.ctr?.toFixed(2) ?? "?"}%)
Not absorbed (ghost): ${ads.filter(a => getAbsorption(a) === "ghost").map(a => a.name).join(", ") || "none"}

After pasting script output, analyze:
1. Which ads are winning the auction and WHY?
2. Which ads should be PAUSED now?
3. What NEW angles to test next?
4. Budget reallocation recommendation?`;

    const handleCopy = () => {
        navigator.clipboard.writeText(ASK_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const metrics = ins ? [
        { label: "Spend", value: fmtRp(ins.spend), icon: DollarSign, color: "text-accent" },
        { label: "Purchase Conver", value: fmtRp(ins.purchaseValue), icon: TrendingUp, color: "text-emerald" },
        { label: "Purchase", value: `${ins.purchases}`, icon: ShoppingCart, color: "text-emerald" },
        { label: "Roas", value: `${ins.roas.toFixed(2)}x`, icon: TrendingUp, color: ins.roas >= 2 ? "text-emerald" : "text-warning" },
        { label: "CPR", value: ins.purchases > 0 ? fmtRp(ins.spend / ins.purchases) : "—", icon: Target, color: "text-warning" },
        { label: "Clicks", value: ins.linkClicks.toLocaleString(), icon: Activity, color: "text-accent" },
        { label: "CPC", value: fmtRp(ins.cpc), icon: Target, color: "text-warning" },
        { label: "CTR", value: `${ins.ctr.toFixed(2)}%`, icon: MousePointer, color: "text-secondary" },
        { label: "Reach", value: ins.reach.toLocaleString(), icon: Megaphone, color: "text-muted-foreground" },
        { label: "Impresion", value: ins.impressions.toLocaleString(), icon: BarChart2, color: "text-muted-foreground" },
    ] : [];

    return (
        <section>
            {/* ── CAMPAIGN TABS ───────────────────────────────────── */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {DF_ALL_CAMPAIGNS.map(c => (
                    <button key={c.region} onClick={() => { setRegion(c.region); setExpandedAd(null); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${region === c.region
                            ? "bg-accent/20 text-accent border-accent/30 shadow-lg shadow-accent/10"
                            : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/50 hover:text-foreground"
                            }`}>
                        <span className="text-base">{c.flag}</span>
                        <span>{c.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.startTime === "2026-03-04" ? "bg-warning/20 text-warning" : "bg-emerald/20 text-emerald"}`}>
                            {c.startTime === "2026-03-04" ? "NEW" : "RUNNING"}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── HEADER ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-accent" />
                    <span>{campaign.flag} {campaign.name} — Ad Performance</span>
                    {loading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                </h2>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
                        {DATE_OPTIONS.map(opt => (
                            <button key={opt.key} onClick={() => setDateRange(opt.key as DateRange)}
                                className={`px-3 py-1 text-xs rounded-md transition-all font-medium ${dateRange === opt.key ? "bg-accent/20 text-accent shadow" : "text-muted-foreground hover:text-foreground"
                                    }`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={refresh} title="Refresh from Meta"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${loading ? "bg-warning animate-pulse" : error ? "bg-destructive" : "bg-emerald animate-pulse"}`} />
                        <span className="text-[10px] text-muted-foreground">
                            {loading ? "fetching…" : error ? "error" : (
                                cacheAge !== null && cacheAge > 0
                                    ? <span title="Cached data — refresh to refetch from Meta">
                                        <span className="text-warning">Cached</span> · {cacheAge}s ago · {lastSync}
                                    </span>
                                    : `Live · ${lastSync}`
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── ERROR ──────────────────────────────────────────── */}
            {error && (
                <div className="glass-card p-3 mb-4 border border-destructive/30 text-[11px] text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>API Error: {error}</span>
                    <button onClick={refresh} className="ml-auto text-accent hover:underline">Retry</button>
                </div>
            )}

            {/* ── METRIC CARDS ───────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2 mb-4">
                {loading && !ins
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card p-3 animate-pulse">
                            <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                            <div className="h-5 bg-muted rounded w-1/2" />
                        </div>
                    ))
                    : metrics.map(m => (
                        <div key={m.label} className="glass-card p-3 glow-blue">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                            </div>
                            <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                        </div>
                    ))}
            </div>

            {/* ── CAMPAIGN + CHART (ID only since it has daily data) ── */}
            {region === "id" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    <div className="glass-card p-4">
                        <p className="text-xs font-semibold mb-3">Campaign Overview</p>
                        <div className="mb-3 pb-3 border-b border-border/30">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-emerald/10 text-emerald">{DF_CAMPAIGN.status}</span>
                                <span className="text-xs font-semibold">{DF_CAMPAIGN.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground pl-1 mt-2">
                                <span>Budget: <span className="text-foreground">{fmtRp(DF_CAMPAIGN.dailyBudget)}/day</span></span>
                                <span>Goal: <span className="text-foreground">Sales</span></span>
                                <span>Since: <span className="text-foreground">{DF_CAMPAIGN.startTime}</span></span>
                                <span>CTR: <span className="text-foreground">{ins?.ctr?.toFixed(2) ?? "—"}%</span></span>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Ad Sets</p>
                        {DF_ADSETS.map(set => (
                            <div key={set.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-emerald/10 text-emerald">{set.status}</span>
                                        <p className="text-xs font-medium">{set.name}</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 pl-1">{set.optimizationGoal}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-emerald">{ins?.impressions?.toLocaleString() ?? "—"} impr.</p>
                                    <p className="text-[10px] text-muted-foreground">{ins?.reach?.toLocaleString() ?? "—"} reach</p>
                                </div>
                            </div>
                        ))}
                        <div className="mt-3 pt-3 border-t border-border/20 flex justify-between text-[10px]">
                            <span className="flex items-center gap-1 text-emerald"><CheckCircle className="w-3 h-3" />{activeAds.length} Active</span>
                            <span className="flex items-center gap-1 text-warning"><PauseCircle className="w-3 h-3" />{pausedAds.length} Paused</span>
                            <span className="flex items-center gap-1 text-muted-foreground"><Megaphone className="w-3 h-3" />{ads.length} Total</span>
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <p className="text-xs font-semibold mb-1">Daily Spend · Clicks</p>
                        <p className="text-[10px] text-muted-foreground mb-3">Campaign lifetime (Feb 26 – Mar 03)</p>
                        <ResponsiveContainer width="100%" height={170}>
                            <BarChart data={DF_DAILY}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(220 10% 55%)" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: "hsl(220 10% 55%)" }} tickLine={false} axisLine={false} width={42}
                                    tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip contentStyle={{ background: "hsl(240 8% 9% / 0.95)", border: "1px solid hsl(240 6% 18%)", borderRadius: "8px", fontSize: "11px" }}
                                    formatter={(v: number, name: string) => [name === "spend" ? fmtRp(v) : v, name === "spend" ? "Spend" : "Clicks"]} />
                                <Bar dataKey="spend" fill="hsl(217 91% 60%)" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="clicks" fill="hsl(155 100% 50%)" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex gap-4 text-[10px] mt-1">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-accent" /> Spend</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald" /> Clicks</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CAMPAIGN INFO STRIP (EN/PH) ────────────────────── */}
            {region !== "id" && (
                <div className="glass-card p-4 mb-4 border border-accent/20">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{campaign.flag}</span>
                        <div>
                            <p className="text-sm font-bold">{campaign.name}</p>
                            <p className="text-[10px] text-muted-foreground">{campaign.id} · {campaign.adsets[0]?.name}</p>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-warning/20 text-warning font-bold ml-auto">JUST LAUNCHED · {campaign.startTime}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-[10px]">
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                            <p className="text-muted-foreground">Ads Live</p>
                            <p className="font-bold text-emerald">{campaign.ads.length}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                            <p className="text-muted-foreground">Landing</p>
                            <p className="font-bold text-accent truncate">{campaign.landingUrl.split("?")[1]}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-bold text-warning">Learning Phase</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── AD REPORT ROOM (Live data table) ────────────────── */}
            {ads.length > 0 && (
                <div className="glass-card p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-semibold">📊 Ad Report Room — What's Working & Why</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Live per-ad breakdown · sorted by spend · click ad to expand</p>
                        </div>
                        <div className="flex gap-2 text-[10px] flex-wrap justify-end">
                            {Object.entries(ABSORB_META).filter(([k]) => k !== "paused").map(([k, v]) => (
                                <span key={k} className={`flex items-center gap-1 ${v.color}`}>{v.icon} {v.label}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 text-[10px] text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/30 px-2">
                        <span className="col-span-4">Ad Name</span>
                        <span className="col-span-2 text-right">Spend</span>
                        <span className="col-span-1 text-right">CTR</span>
                        <span className="col-span-2 text-center">Status</span>
                        <span className="col-span-3 text-center">Absorption</span>
                    </div>

                    {loading && ads.length === 0 && (
                        <div className="space-y-2 mt-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 px-2 py-2 animate-pulse">
                                    <div className="col-span-3 h-3 bg-muted rounded" />
                                    <div className="col-span-1 h-3 bg-muted rounded ml-auto" />
                                    <div className="col-span-1 h-3 bg-muted rounded ml-auto" />
                                    <div className="col-span-1 h-3 bg-muted rounded mx-auto" />
                                    <div className="col-span-1 h-3 bg-muted rounded mx-auto" />
                                    <div className="col-span-2 h-3 bg-muted rounded mx-auto" />
                                    <div className="col-span-3 h-3 bg-muted rounded mx-auto" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="divide-y divide-border/20">
                        {activeAds.map(ad => (
                            <AdRow key={ad.id} ad={ad} totalSpend={totalSpend} />
                        ))}
                        {pausedAds.map(ad => (
                            <PausedAdRow key={ad.id} ad={ad} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── CAMPAIGN-SPECIFIC REPORT ─────────────────────────── */}
            <div className="glass-card p-5 mb-4 border border-secondary/20">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-sm font-bold flex items-center gap-2">
                            🧠 {campaign.flag} Campaign Analysis & Optimization
                            <span className="text-[10px] font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50 border border-border/40">2026-03-04 · 13:42 WIB</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{campaign.name} · {campaign.id}</p>
                    </div>
                    {ins && (
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald/10 text-emerald border border-emerald/20 font-medium shrink-0">
                            {ins.purchases} purchases · ROAS {ins.roas.toFixed(2)}x
                        </span>
                    )}
                </div>
                {region === "id" ? <IDCampaignReport /> : <NewCampaignReport campaign={campaign} />}
            </div>

            {/* ── CROSS-MARKET STRATEGY ────────────────────────────── */}
            <div className="glass-card p-5 mb-4 border border-emerald/20">
                <p className="text-sm font-bold flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-emerald" /> Cross-Market Strategy — Dark Feminine Global
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {DF_ALL_CAMPAIGNS.map(c => (
                        <div key={c.region} className="rounded-xl bg-muted/20 border border-border/30 p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{c.flag}</span>
                                <div>
                                    <p className="text-xs font-bold">{c.label}</p>
                                    <p className="text-[9px] text-muted-foreground">{c.ads.filter(a => a.status === "ACTIVE").length} active · {c.ads.filter(a => a.status === "PAUSED").length} paused</p>
                                </div>
                            </div>
                            <div className="space-y-1 text-[10px] text-muted-foreground">
                                {c.region === "id" && (
                                    <>
                                        <p>• <span className="text-emerald font-medium">Winner:</span> DF_Secret (64% budget, CTR 5.65%)</p>
                                        <p>• <span className="text-accent font-medium">Strategy:</span> Scale winners, optimize V3 batch</p>
                                        <p>• <span className="text-warning font-medium">Next:</span> Monitor V3 ads for 48h evaluation</p>
                                    </>
                                )}
                                {c.region === "en" && (
                                    <>
                                        <p>• <span className="text-warning font-medium">Status:</span> Just launched — learning phase</p>
                                        <p>• <span className="text-accent font-medium">Top Watch:</span> TheSecret + SocietyLie hooks</p>
                                        <p>• <span className="text-emerald font-medium">Next:</span> Wait 3 days, then evaluate ghost ads</p>
                                    </>
                                )}
                                {c.region === "ph" && (
                                    <>
                                        <p>• <span className="text-warning font-medium">Status:</span> Just launched — learning phase</p>
                                        <p>• <span className="text-accent font-medium">Top Watch:</span> Secret + SocietyLie (Tagalog)</p>
                                        <p>• <span className="text-emerald font-medium">Next:</span> Wait 3 days, then evaluate ghost ads</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── ASK UPDATE ─────────────────────────────────────── */}
            <div className="glass-card p-4 border border-primary/20 glow-emerald">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold mb-1 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" /> Ask Update — AI Optimizer Prompt
                        </p>
                        <p className="text-[10px] text-muted-foreground mb-2">Copy prompt with live data → paste to AI agent for full diagnosis.</p>
                        <div className="bg-muted/40 rounded-lg p-2 text-[10px] text-muted-foreground font-mono leading-relaxed line-clamp-2 border border-border/30">
                            {ASK_PROMPT.slice(0, 200)}…
                        </div>
                    </div>
                    <button onClick={handleCopy}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${copied ? "bg-emerald/20 text-emerald border border-emerald/30"
                            : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:scale-105"
                            }`}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Ask Update"}
                    </button>
                </div>
            </div>
        </section>
    );
}
