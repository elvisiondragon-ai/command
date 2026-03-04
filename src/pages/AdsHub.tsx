import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BrandSelector, Brand, BRANDS } from "@/components/BrandSelector";
import { DarkFeminineAdHub } from "@/components/DarkFeminineAdHub";
import { Megaphone, Layers, ArrowRight } from "lucide-react";

// ── brand-specific map — add new brands here as they get wired ──
function BrandAdHub({ brand }: { brand: Brand }) {
    if (brand.id === "brand_darkfeminine") return <DarkFeminineAdHub />;

    // ── Placeholder for brands not yet wired ──
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl">
                {brand.emoji}
            </div>
            <div>
                <h3 className={`text-base font-bold mb-1 ${brand.color}`}>{brand.label}</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Ads data for this brand hasn't been connected yet.
                    Select <span className="text-purple-400 font-medium">🖤 Dark Feminine</span> to see a live example.
                </p>
            </div>
        </div>
    );
}

export default function AdsHubPage() {
    const [activeBrand, setActiveBrand] = useState<Brand | null>(BRANDS.find(b => b.id === "brand_darkfeminine") || null);

    return (
        <DashboardLayout>
            <div className="pb-10">

                {/* ── PAGE HEADER ─────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-accent" />
                            Ads Hub
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Per-brand ads surgery — campaign · adsets · creative performance · absorption analysis
                        </p>
                    </div>
                    {activeBrand && (
                        <div className="flex items-center gap-2">
                            <div className="status-dot status-running" />
                            <span className="text-xs text-muted-foreground">Synced · Meta API</span>
                        </div>
                    )}
                </div>

                {/* ── BRAND SELECTOR ──────────────────────────────── */}
                <div className="mb-6 relative">
                    <BrandSelector selected={activeBrand} onChange={setActiveBrand} />
                </div>

                {/* ── CONTENT ─────────────────────────────────────── */}
                {activeBrand ? (
                    <>
                        {/* Active brand strip */}
                        <div className="glass-card px-4 py-3 flex items-center gap-3 mb-6 border-accent/20">
                            <span className="text-xl">{activeBrand.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${activeBrand.color}`}>{activeBrand.label}</p>
                                <p className="text-[10px] text-muted-foreground">{activeBrand.id} · Ads Surgery View</p>
                            </div>
                            <div className="flex gap-2">
                                {BRANDS.filter(b => b.id !== activeBrand.id).slice(0, 4).map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => setActiveBrand(b)}
                                        title={b.label}
                                        className="text-lg hover:scale-110 transition-transform opacity-50 hover:opacity-100"
                                    >
                                        {b.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Brand-specific ads hub ── pure ads content ── */}
                        <BrandAdHub brand={activeBrand} />
                    </>
                ) : (
                    /* ── Empty state ──────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center">
                            <Layers className="w-10 h-10 text-accent/50" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground/70 mb-2">Select a Brand to Operate</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                This is your <strong>Ads Surgery Room</strong> — choose a brand above to dissect its campaign,
                                adsets, creative absorption, and get AI optimization prompts.
                            </p>
                        </div>

                        {/* Brand quick-select grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {BRANDS.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => setActiveBrand(b)}
                                    className={`glass-card px-4 py-3 flex items-center gap-3 hover:border-primary/30 transition-all hover:scale-[1.02] text-left ${b.id === "brand_darkfeminine" ? "border-purple-500/30 bg-purple-500/5" : ""
                                        }`}
                                >
                                    <span className="text-xl shrink-0">{b.emoji}</span>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold truncate ${b.color}`}>{b.label}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            {b.id === "brand_darkfeminine" ? (
                                                <><span className="text-emerald">●</span> Live Data</>
                                            ) : (
                                                <><span className="text-muted-foreground/40">●</span> Not connected</>
                                            )}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
