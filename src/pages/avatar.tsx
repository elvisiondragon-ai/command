import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type AngleCount = 50 | 100;
type ProblemCategory =
    | "Kesehatan"
    | "Bisnis"
    | "Relationship"
    | "Finansial"
    | "Produktivitas"
    | "Custom";
type Platform =
    | "Reddit"
    | "TikTok"
    | "YouTube"
    | "Facebook"
    | "Instagram"
    | "GoogleTrends";
type UrgencyLevel = "urgent" | "moderate" | "low";
type SortKey = "urgency" | "overlap" | "platform";

interface AvatarAngle {
    id: string;
    name: string;
    primaryUrgency: string;
    emotionalTrigger: string;
    willingnessToPay: string;
    platform: Platform;
    overlapPercent: number;
    urgencyLevel: UrgencyLevel;
}

interface ProductAngle {
    title: string;
    reasoning: string;
    avatarCount: number;
    confidence: number;
}

interface ScraperComment {
    platform: Platform;
    comment: string;
    timestamp: string;
    engagement_signal: number;
}

// ─── MOCK SCRAPER API ─────────────────────────────────────────────────────────
// Replace with real endpoint: POST /api/scrape { platforms, category, priceMin, priceMax }

async function fetchScrapedComments(
    platforms: Platform[],
    category: string
): Promise<ScraperComment[]> {
    // MOCK — replace with: const res = await fetch('/api/scrape', { method:'POST', body: JSON.stringify({platforms, category}) })
    await new Promise((r) => setTimeout(r, 1800));
    const mockComments: ScraperComment[] = [
        {
            platform: "TikTok",
            comment: `Udah coba semua cara tapi ${category.toLowerCase()} masih sama aja, cape banget`,
            timestamp: "2024-01-15",
            engagement_signal: 4200,
        },
        {
            platform: "YouTube",
            comment: `Berapa lama ya hasilnya keliatan? Udah 3 bulan masih gini doang soal ${category.toLowerCase()}`,
            timestamp: "2024-01-14",
            engagement_signal: 890,
        },
        {
            platform: "Reddit",
            comment: `Anyone else merasa stuck di masalah ${category.toLowerCase()} ini? Pengen invest tapi takut scam lagi`,
            timestamp: "2024-01-13",
            engagement_signal: 312,
        },
        {
            platform: "Facebook",
            comment: `Suami udah nyuruh beli solusinya tapi aku ragu harganya mahal banget untuk ${category.toLowerCase()}`,
            timestamp: "2024-01-12",
            engagement_signal: 1560,
        },
        {
            platform: "Instagram",
            comment: `Pengen banget solve problem ${category.toLowerCase()} ini sebelum akhir tahun, ada rekomendasi?`,
            timestamp: "2024-01-11",
            engagement_signal: 2100,
        },
        {
            platform: "GoogleTrends",
            comment: `cara mengatasi ${category.toLowerCase()} dengan cepat tanpa ribet`,
            timestamp: "2024-01-10",
            engagement_signal: 15000,
        },
    ];
    return mockComments.filter((c) => platforms.includes(c.platform));
}

// ─── CLAUDE API CALLS ─────────────────────────────────────────────────────────

async function generateAvatarAngles(
    comments: ScraperComment[],
    count: AngleCount,
    category: string,
    priceMin: number,
    priceMax: number,
    demographics: { age: string; gender: string; location: string }
): Promise<AvatarAngle[]> {
    const commentsText = comments
        .map((c) => `[${c.platform}] ${c.comment} (engagement: ${c.engagement_signal})`)
        .join("\n");

    const demographicContext =
        demographics.age || demographics.gender || demographics.location
            ? `Demographics filter: Age ${demographics.age || "any"}, Gender ${demographics.gender || "any"}, Location ${demographics.location || "Indonesia"}`
            : "Demographics: General Indonesian market";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: `You are a market research intelligence system specializing in Indonesian consumer behavior.
Analyze real pain points from social media comments and search trends.
Generate ${count} specific avatar angles for people willing to spend Rp ${priceMin.toLocaleString("id-ID")}–Rp ${priceMax.toLocaleString("id-ID")} on a solution.

For each avatar return EXACTLY this JSON structure:
{
  "name": "specific persona, e.g. 'Ibu 35th 1 anak susah tidur karena stress kerja'",
  "primaryUrgency": "what keeps them up at night — be specific",
  "emotionalTrigger": "fear OR desire OR frustration — pick one dominant",
  "willingnessToPay": "signal that shows they'll spend (e.g. already tried X, desperate after Y months)",
  "platform": "Reddit|TikTok|YouTube|Facebook|Instagram|GoogleTrends",
  "overlapPercent": <number 5-85>,
  "urgencyLevel": "urgent|moderate|low"
}

Return ONLY a valid JSON array. No markdown, no explanation, no code blocks.`,
            messages: [
                {
                    role: "user",
                    content: `Category: ${category}\n${demographicContext}\n\nReal comments from social platforms:\n${commentsText}\n\nGenerate ${count} avatar angles as JSON array.`,
                },
            ],
        }),
    });

    const data = await response.json();
    const text = data.content?.map((b: { type: string; text?: string }) => b.text || "").join("") || "[]";

    try {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        return parsed.map((a: Omit<AvatarAngle, "id">, i: number) => ({ ...a, id: `avatar-${i}` }));
    } catch {
        // Fallback mock if parse fails
        return generateMockAvatars(count, category);
    }
}

function generateMockAvatars(count: AngleCount, category: string): AvatarAngle[] {
    const platforms: Platform[] = ["TikTok", "YouTube", "Reddit", "Facebook", "Instagram", "GoogleTrends"];
    const urgencies: UrgencyLevel[] = ["urgent", "moderate", "low"];
    const triggers = ["fear", "desire", "frustration"];
    const mocks: AvatarAngle[] = [];
    for (let i = 0; i < count; i++) {
        mocks.push({
            id: `avatar-${i}`,
            name: `Persona ${i + 1} — ${category} problem solver`,
            primaryUrgency: `Sudah ${Math.floor(Math.random() * 12) + 1} bulan berjuang dengan ${category.toLowerCase()} tanpa hasil`,
            emotionalTrigger: triggers[i % 3],
            willingnessToPay: `Pernah beli solusi lain Rp ${(Math.floor(Math.random() * 5) + 1) * 500000} tapi gagal`,
            platform: platforms[i % platforms.length],
            overlapPercent: Math.floor(Math.random() * 60) + 10,
            urgencyLevel: urgencies[i % 3],
        });
    }
    return mocks;
}

async function findBestProductAngles(avatars: AvatarAngle[]): Promise<ProductAngle[]> {
    const avatarSummary = avatars
        .map((a) => `- ${a.name} | overlap: ${a.overlapPercent}% | urgency: ${a.urgencyLevel} | trigger: ${a.emotionalTrigger}`)
        .join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: `You are a product strategy expert for Indonesian digital market. 
Analyze avatar angles and find the TOP 3 product positioning with maximum total addressable market.
Return ONLY valid JSON array with this structure:
[{"title": "product angle name", "reasoning": "why this angle wins — specific, data-driven", "avatarCount": <number of avatars this serves>, "confidence": <50-99>}]
No markdown, no explanation.`,
            messages: [
                {
                    role: "user",
                    content: `Analyze these ${avatars.length} avatar angles and find top 3 product angles with widest reach:\n\n${avatarSummary}`,
                },
            ],
        }),
    });

    const data = await response.json();
    const text = data.content?.map((b: { type: string; text?: string }) => b.text || "").join("") || "[]";

    try {
        const clean = text.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    } catch {
        return [
            { title: "Universal Pain Relief", reasoning: "Widest overlap across all urgency levels", avatarCount: Math.floor(avatars.length * 0.6), confidence: 87 },
            { title: "Quick-Win Solution", reasoning: "High urgency segment willing to pay premium", avatarCount: Math.floor(avatars.length * 0.35), confidence: 74 },
            { title: "Long-term Transformation", reasoning: "Moderate urgency but highest LTV potential", avatarCount: Math.floor(avatars.length * 0.25), confidence: 68 },
        ];
    }
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

const formatRupiah = (num: number) => {
    return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseRupiah = (str: string) => {
    return Number(str.replace(/[^\d]/g, ""));
};

function exportData(avatars: AvatarAngle[], format: "csv" | "json") {
    if (format === "json") {
        const blob = new Blob([JSON.stringify(avatars, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "avatar-angles.json";
        a.click();
    } else {
        const headers = ["id", "name", "primaryUrgency", "emotionalTrigger", "willingnessToPay", "platform", "overlapPercent", "urgencyLevel"];
        const rows = avatars.map((a) => headers.map((h) => `"${(a as any)[h]}"`).join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "avatar-angles.csv";
        a.click();
    }
}

const platformColors: Record<Platform, string> = {
    Reddit: "#FF4500",
    TikTok: "#69C9D0",
    YouTube: "#FF0000",
    Facebook: "#1877F2",
    Instagram: "#E1306C",
    GoogleTrends: "#4285F4",
};

const urgencyColors: Record<UrgencyLevel, { bg: string; border: string; text: string }> = {
    urgent: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.4)", text: "#f87171" },
    moderate: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.35)", text: "#fbbf24" },
    low: { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.35)", text: "#818cf8" },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AvatarScraper() {
    // Step state
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

    // Step 1
    const [angleCount, setAngleCount] = useState<AngleCount>(50);

    // Step 2
    const [priceMin, setPriceMin] = useState(1000000);
    const [priceMax, setPriceMax] = useState(5000000);
    const [category, setCategory] = useState<ProblemCategory>("Kesehatan");
    const [customCategory, setCustomCategory] = useState("");
    const [demographics, setDemographics] = useState({ age: "", gender: "", location: "" });

    // Step 3
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["TikTok", "YouTube"]);

    // Step 4-6
    const [loading, setLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState("");
    const [avatars, setAvatars] = useState<AvatarAngle[]>([]);
    const [productAngles, setProductAngles] = useState<ProductAngle[]>([]);
    const [sortKey, setSortKey] = useState<SortKey>("urgency");
    const [sessionId, setSessionId] = useState<string | null>(null);

    const platforms: Platform[] = ["Reddit", "TikTok", "YouTube", "Facebook", "Instagram", "GoogleTrends"];
    const categories: ProblemCategory[] = ["Kesehatan", "Bisnis", "Relationship", "Finansial", "Produktivitas", "Custom"];

    const togglePlatform = (p: Platform) => {
        setSelectedPlatforms((prev) =>
            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
        );
    };

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setLoadingPhase("Menunggu Bot Lokal (main.py --service)...");
        setStep(4);

        try {
            const effectiveCategory = category === "Custom" ? customCategory || "Custom" : category;

            const { data, error } = await supabase.functions.invoke('avatar-generate', {
                body: {
                    action: 'start',
                    config: {
                        angleCount,
                        category: effectiveCategory,
                        priceMin,
                        priceMax,
                        demographics,
                        platforms: selectedPlatforms
                    }
                }
            });

            if (error) throw error;
            if (data?.sessionId) {
                setSessionId(data.sessionId);
            }
        } catch (err) {
            console.error("❌ Generate Error:", err);
            setLoading(false);
            setStep(3);
        }
    }, [angleCount, category, customCategory, selectedPlatforms, priceMin, priceMax, demographics]);

    // Realtime subscription
    useEffect(() => {
        if (!sessionId) return;

        console.log("🚀 Subscribed to stream for session:", sessionId);

        const channel = supabase
            .channel(`avatar-stream-${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'avatar-stream',
                    filter: `session_id=eq.${sessionId}`
                },
                (payload) => {
                    console.log("⚡ Realtime payload received:", payload);
                    const item = payload.new;
                    if (item.type === 'comment') {
                        setLoadingPhase(`Data Masuk: ${item.payload.comment.substring(0, 40)}...`);
                    } else if (item.type === 'status') {
                        setLoadingPhase(item.payload.message);
                    } else if (item.type === 'avatar') {
                        console.log("👤 New avatar received from stream:", item.payload);
                        setAvatars((prev) => [...prev, { ...item.payload, id: item.id }]);
                    }
                }
            )
            .subscribe();

        // Also poll session status for completion
        const statusPoll = setInterval(async () => {
            const { data, error } = await supabase
                .from('avatar-sessions')
                .select('status, avatar_angles, scraped_comments')
                .eq('id', sessionId)
                .single();

            if (error) {
                console.error("❌ Error polling status:", error);
                return;
            }

            console.log(`📡 Polling status (${sessionId}):`, data?.status, "Avatars in DB:", data?.avatar_angles?.length);

            if (data?.status === 'done') {
                if (data.avatar_angles?.length > 0) {
                    console.log("🏁 Research complete. Setting", data.avatar_angles.length, "avatars.");
                    setAvatars(data.avatar_angles);
                } else {
                    console.error("🏁 Research complete but 0 avatars found in DB.");
                }
                setLoading(false);
                setStep(5); // Move to results step
                setLoadingPhase("");
                clearInterval(statusPoll);
            }
        }, 3000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(statusPoll);
        };
    }, [sessionId]);

    const handleFindBestAngle = useCallback(async () => {
        if (!sessionId) return;
        setLoading(true);
        setLoadingPhase("Finding highest-overlap product angles...");
        setStep(6);

        try {
            const { data, error } = await supabase.functions.invoke('avatar-generate', {
                body: {
                    action: 'find-best-angle',
                    session_id: sessionId
                }
            });

            if (error) throw error;
            if (data?.productAngles) {
                setProductAngles(data.productAngles);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingPhase("");
        }
    }, [sessionId, avatars]);

    const sortedAvatars = [...avatars].sort((a, b) => {
        if (sortKey === "urgency") {
            const order = { urgent: 0, moderate: 1, low: 2 };
            return order[a.urgencyLevel] - order[b.urgencyLevel];
        }
        if (sortKey === "overlap") return b.overlapPercent - a.overlapPercent;
        return a.platform.localeCompare(b.platform);
    });

    // ─── RENDER ───────────────────────────────────────────────────────────────

    return (
        <div style={{
            minHeight: "100vh",
            background: "#060b14",
            color: "#e2e8f0",
            fontFamily: "'Inter', 'SF Pro Display', sans-serif",
            padding: "0",
        }}>
            {/* Grid overlay */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
                backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
            }} />

            {/* Header */}
            <header style={{
                position: "relative", zIndex: 10,
                borderBottom: "1px solid rgba(99,102,241,0.15)",
                padding: "20px 40px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(6,11,20,0.95)",
                backdropFilter: "blur(12px)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        width: 36, height: 36,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                    }}>⚡</div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", color: "#f1f5f9" }}>
                            Avatar Scraper Intelligence
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.5px", fontFamily: "monospace" }}>
                            eL VISION GROUP · MARKET RESEARCH ENGINE
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div key={s} style={{
                            width: 28, height: 4, borderRadius: 2,
                            background: step >= s ? "#6366f1" : "rgba(99,102,241,0.2)",
                            transition: "background 0.3s",
                        }} />
                    ))}
                </div>
            </header>

            <main style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "40px 40px" }}>

                {/* STEP 1: Angle Count */}
                {step === 1 && (
                    <FadeIn>
                        <StepLabel number={1} title="Pilih Jumlah Angle" />
                        <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>
                            Jumlah avatar yang akan dianalisis dari komentar real platform sosial
                        </p>
                        <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
                            {([50, 100] as AngleCount[]).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setAngleCount(n)}
                                    style={{
                                        padding: "20px 40px",
                                        borderRadius: 12,
                                        border: `2px solid ${angleCount === n ? "#6366f1" : "rgba(99,102,241,0.2)"}`,
                                        background: angleCount === n ? "rgba(99,102,241,0.12)" : "rgba(15,23,42,0.6)",
                                        color: angleCount === n ? "#a5b4fc" : "#64748b",
                                        fontSize: 28, fontWeight: 800,
                                        cursor: "pointer", transition: "all 0.2s",
                                        letterSpacing: "-1px",
                                    }}
                                >
                                    {n}
                                    <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, letterSpacing: 0 }}>Angles</div>
                                </button>
                            ))}
                        </div>
                        <NextButton onClick={() => setStep(2)} />
                    </FadeIn>
                )}

                {/* STEP 2: Parameters */}
                {step === 2 && (
                    <FadeIn>
                        <StepLabel number={2} title="Parameter Produk & Target" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                            <Field label="Harga Minimum">
                                <input
                                    type="text"
                                    value={formatRupiah(priceMin)}
                                    onChange={(e) => setPriceMin(parseRupiah(e.target.value))}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Harga Maksimum">
                                <input
                                    type="text"
                                    value={formatRupiah(priceMax)}
                                    onChange={(e) => setPriceMax(parseRupiah(e.target.value))}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Kategori Problem">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                                    style={inputStyle}
                                >
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                            {category === "Custom" && (
                                <Field label="Custom Kategori">
                                    <input
                                        placeholder="e.g. Parenting, Kehamilan, Karir..."
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        style={inputStyle}
                                    />
                                </Field>
                            )}
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <div style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.5px", marginBottom: 12, textTransform: "uppercase" }}>
                                Demografi Target (Opsional)
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                                <Field label="Rentang Usia">
                                    <input placeholder="e.g. 25-40" value={demographics.age}
                                        onChange={(e) => setDemographics(d => ({ ...d, age: e.target.value }))}
                                        style={inputStyle} />
                                </Field>
                                <Field label="Gender">
                                    <select value={demographics.gender}
                                        onChange={(e) => setDemographics(d => ({ ...d, gender: e.target.value }))}
                                        style={inputStyle}>
                                        <option value="">Semua</option>
                                        <option value="Perempuan">Perempuan</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                    </select>
                                </Field>
                                <Field label="Lokasi">
                                    <input placeholder="e.g. Jakarta, Surabaya" value={demographics.location}
                                        onChange={(e) => setDemographics(d => ({ ...d, location: e.target.value }))}
                                        style={inputStyle} />
                                </Field>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                            <BackButton onClick={() => setStep(1)} />
                            <NextButton onClick={() => setStep(3)} />
                        </div>
                    </FadeIn>
                )}

                {/* STEP 3: Platform Selection */}
                {step === 3 && (
                    <FadeIn>
                        <StepLabel number={3} title="Pilih Sumber Data" />
                        <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>
                            Scraping komentar real — bukan post, bukan caption
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
                            {platforms.map((p) => {
                                const active = selectedPlatforms.includes(p);
                                return (
                                    <button
                                        key={p}
                                        onClick={() => togglePlatform(p)}
                                        disabled={p === "Facebook" || p === "Instagram"}
                                        style={{
                                            padding: "20px 24px",
                                            borderRadius: 12,
                                            border: `2px solid ${active ? platformColors[p] : "rgba(99,102,241,0.15)"}`,
                                            background: active ? `${platformColors[p]}18` : "rgba(15,23,42,0.5)",
                                            color: active ? platformColors[p] : "#475569",
                                            fontSize: 14, fontWeight: 600,
                                            cursor: (p === "Facebook" || p === "Instagram") ? "not-allowed" : "pointer",
                                            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
                                            textAlign: "left",
                                            opacity: (p === "Facebook" || p === "Instagram") ? 0.4 : 1,
                                            position: "relative"
                                        }}>
                                        <span style={{ fontSize: 20 }}>{platformIcon(p)}</span>
                                        {p === "GoogleTrends" ? "Google Trends" : `${p} Comments`}
                                        {(p === "Facebook" || p === "Instagram") && (
                                            <span style={{
                                                fontSize: 8,
                                                background: "rgba(239, 68, 68, 0.2)",
                                                color: "#f87171",
                                                padding: "2px 6px",
                                                borderRadius: 4,
                                                position: "absolute",
                                                top: 10,
                                                right: 10
                                            }}>
                                                NOT AVAILABLE
                                            </span>
                                        )}
                                        {active && (
                                            <span style={{ fontSize: 10, background: platformColors[p], color: "#fff", padding: "2px 6px", borderRadius: 4 }}>
                                                AKTIF
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <BackButton onClick={() => setStep(2)} />
                            <button
                                onClick={handleGenerate}
                                disabled={selectedPlatforms.length === 0}
                                style={{
                                    padding: "14px 32px", borderRadius: 10,
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
                                    cursor: selectedPlatforms.length === 0 ? "not-allowed" : "pointer",
                                    opacity: selectedPlatforms.length === 0 ? 0.5 : 1,
                                    display: "flex", alignItems: "center", gap: 8,
                                }}
                            >
                                ⚡ Generate {angleCount} Angles
                            </button>
                        </div>
                    </FadeIn>
                )}

                {/* STEP 4: Loading */}
                {step === 4 && loading && (
                    <FadeIn>
                        <div style={{ textAlign: "center", padding: "80px 0" }}>
                            <div style={{
                                width: 64, height: 64, margin: "0 auto 24px",
                                border: "3px solid rgba(99,102,241,0.2)",
                                borderTop: "3px solid #6366f1",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                            }} />
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>
                                Analisis Sedang Berjalan
                            </div>
                            <div style={{ fontSize: 14, color: "#64748b", fontFamily: "monospace" }}>{loadingPhase}</div>
                            <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 8 }}>
                                {selectedPlatforms.map((p) => (
                                    <span key={p} style={{
                                        fontSize: 11, padding: "4px 10px", borderRadius: 20,
                                        background: `${platformColors[p]}20`, color: platformColors[p],
                                        border: `1px solid ${platformColors[p]}40`,
                                    }}>{p}</span>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* STEP 5: Results */}
                {step === 5 && !loading && (
                    <FadeIn>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                            <div>
                                <StepLabel number={5} title={`${avatars.length} Avatar Angles Ditemukan`} />
                                <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                                    Dianalisis dari {selectedPlatforms.length} platform · Kategori: {category === "Custom" ? customCategory : category}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <SortButton active={sortKey === "urgency"} onClick={() => setSortKey("urgency")}>Urgency</SortButton>
                                <SortButton active={sortKey === "overlap"} onClick={() => setSortKey("overlap")}>Overlap</SortButton>
                                <SortButton active={sortKey === "platform"} onClick={() => setSortKey("platform")}>Platform</SortButton>
                            </div>
                        </div>

                        {/* Legend */}
                        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                            {(["urgent", "moderate", "low"] as UrgencyLevel[]).map((u) => (
                                <div key={u} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: urgencyColors[u].text }} />
                                    <span style={{ color: "#64748b", textTransform: "capitalize" }}>{u}</span>
                                </div>
                            ))}
                        </div>

                        {/* Avatar Grid */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                            gap: 16, marginBottom: 40,
                        }}>
                            {sortedAvatars.map((a) => {
                                const uc = urgencyColors[a.urgencyLevel];
                                return (
                                    <div key={a.id} style={{
                                        borderRadius: 12,
                                        border: `1px solid ${uc.border}`,
                                        background: uc.bg,
                                        padding: "20px",
                                        transition: "transform 0.15s, box-shadow 0.15s",
                                    }}>
                                        {/* Header */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                                                letterSpacing: "0.5px", color: uc.text,
                                                background: `${uc.text}18`, padding: "3px 8px", borderRadius: 4,
                                            }}>
                                                {a.urgencyLevel}
                                            </span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700,
                                                color: platformColors[a.platform] || "#94a3b8",
                                                background: `${platformColors[a.platform]}18`,
                                                padding: "3px 8px", borderRadius: 4,
                                                border: `1px solid ${platformColors[a.platform]}30`,
                                            }}>
                                                {platformIcon(a.platform)} {a.platform}
                                            </span>
                                        </div>

                                        {/* Name */}
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 12, lineHeight: 1.4 }}>
                                            {a.name}
                                        </div>

                                        {/* Details */}
                                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                                            <span style={{ color: "#64748b" }}>Urgency: </span>{a.primaryUrgency}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                                            <span style={{ color: "#64748b" }}>Trigger: </span>
                                            <span style={{ color: "#a5b4fc", fontStyle: "italic" }}>{a.emotionalTrigger}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
                                            <span style={{ color: "#64748b" }}>WTP Signal: </span>{a.willingnessToPay}
                                        </div>

                                        {/* Overlap Bar */}
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 10, color: "#64748b" }}>OVERLAP</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: uc.text, fontFamily: "monospace" }}>
                                                    {a.overlapPercent}%
                                                </span>
                                            </div>
                                            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                                                <div style={{
                                                    height: "100%", borderRadius: 2,
                                                    background: uc.text,
                                                    width: `${a.overlapPercent}%`,
                                                    transition: "width 0.6s ease",
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                                <ExportButton onClick={() => exportData(avatars, "json")}>↓ Export JSON</ExportButton>
                                <ExportButton onClick={() => exportData(avatars, "csv")}>↓ Export CSV</ExportButton>
                            </div>
                            <button
                                onClick={handleFindBestAngle}
                                style={{
                                    padding: "14px 32px", borderRadius: 10,
                                    background: "linear-gradient(135deg, #059669, #10b981)",
                                    border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 8,
                                }}
                            >
                                🎯 Find Best Product Angle
                            </button>
                        </div>
                    </FadeIn>
                )}

                {/* STEP 6: Best Angles */}
                {step === 6 && (
                    <FadeIn>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "80px 0" }}>
                                <div style={{
                                    width: 64, height: 64, margin: "0 auto 24px",
                                    border: "3px solid rgba(16,185,129,0.2)",
                                    borderTop: "3px solid #10b981",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }} />
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Finding Best Product Angles...</div>
                                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, fontFamily: "monospace" }}>{loadingPhase}</div>
                            </div>
                        ) : (
                            <>
                                <StepLabel number={6} title="Top Product Angles" />
                                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>
                                    Dianalisis dari {avatars.length} avatar — posisi produk dengan irisan terluas
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
                                    {productAngles.map((pa, i) => (
                                        <div key={i} style={{
                                            borderRadius: 16,
                                            border: i === 0 ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(99,102,241,0.2)",
                                            background: i === 0 ? "rgba(16,185,129,0.06)" : "rgba(15,23,42,0.5)",
                                            padding: "28px 32px",
                                            position: "relative", overflow: "hidden",
                                        }}>
                                            {i === 0 && (
                                                <div style={{
                                                    position: "absolute", top: 0, right: 0,
                                                    background: "linear-gradient(135deg, #059669, #10b981)",
                                                    padding: "6px 16px",
                                                    borderBottomLeftRadius: 12,
                                                    fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "0.5px",
                                                }}>
                                                    🏆 STRONGEST ANGLE
                                                </div>
                                            )}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontFamily: "monospace" }}>
                                                        ANGLE #{i + 1}
                                                    </div>
                                                    <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.5px" }}>
                                                        {pa.title}
                                                    </div>
                                                    <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
                                                        {pa.reasoning}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right", marginLeft: 32, flexShrink: 0 }}>
                                                    <div style={{ fontSize: 36, fontWeight: 800, color: i === 0 ? "#10b981" : "#6366f1", letterSpacing: "-2px" }}>
                                                        {pa.confidence}%
                                                    </div>
                                                    <div style={{ fontSize: 10, color: "#64748b" }}>CONFIDENCE</div>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginTop: 8 }}>
                                                        {pa.avatarCount} avatars
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                                    <button onClick={() => { setStep(5); setProductAngles([]); }} style={{
                                        padding: "12px 24px", borderRadius: 10,
                                        border: "1px solid rgba(99,102,241,0.3)",
                                        background: "transparent", color: "#94a3b8",
                                        fontSize: 13, cursor: "pointer",
                                    }}>← Kembali ke Avatars</button>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <ExportButton onClick={() => exportData(avatars, "json")}>↓ Export All JSON</ExportButton>
                                        <button onClick={() => { setStep(1); setAvatars([]); setProductAngles([]); }} style={{
                                            padding: "12px 24px", borderRadius: 10,
                                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                            border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                                        }}>+ Riset Baru</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </FadeIn>
                )}
            </main>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; }
        input, select { outline: none; }
        input::placeholder { color: #334155; }
        button:hover { opacity: 0.88; }
      `}</style>
        </div>
    );
}

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────

function FadeIn({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ animation: "fadeIn 0.35s ease forwards" }}>
            {children}
        </div>
    );
}

function StepLabel({ number, title }: { number: number; title: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>{number}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", margin: 0 }}>
                {title}
            </h2>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.5px", marginBottom: 6, textTransform: "uppercase" }}>
                {label}
            </div>
            {children}
        </div>
    );
}

function NextButton({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            padding: "12px 28px", borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
            Lanjut →
        </button>
    );
}

function BackButton({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            padding: "12px 24px", borderRadius: 10,
            border: "1px solid rgba(99,102,241,0.3)",
            background: "transparent", color: "#94a3b8", fontSize: 14, cursor: "pointer",
        }}>
            ← Kembali
        </button>
    );
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} style={{
            padding: "8px 16px", borderRadius: 8,
            border: `1px solid ${active ? "#6366f1" : "rgba(99,102,241,0.2)"}`,
            background: active ? "rgba(99,102,241,0.15)" : "transparent",
            color: active ? "#a5b4fc" : "#475569",
            fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
        }}>
            {children}
        </button>
    );
}

function ExportButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} style={{
            padding: "10px 18px", borderRadius: 8,
            border: "1px solid rgba(99,102,241,0.25)",
            background: "rgba(99,102,241,0.08)", color: "#818cf8",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>
            {children}
        </button>
    );
}

function platformIcon(p: Platform): string {
    const icons: Record<Platform, string> = {
        Reddit: "🟠", TikTok: "🎵", YouTube: "▶️",
        Facebook: "📘", Instagram: "📸", GoogleTrends: "📈",
    };
    return icons[p] || "🔵";
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)",
    background: "rgba(15,23,42,0.6)",
    color: "#e2e8f0", fontSize: 14,
    fontFamily: "inherit",
};