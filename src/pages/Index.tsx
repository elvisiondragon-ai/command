import { useState, lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BrandSelector, Brand, BRANDS } from "@/components/BrandSelector";
import { Layers, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

// ── Lazy Load Heavy Components ───────────────────────────────
const AgentMonitor = lazy(() => import("@/components/AgentMonitor").then(module => ({ default: module.AgentMonitor })));
const SocialPerformance = lazy(() => import("@/components/SocialPerformance").then(module => ({ default: module.SocialPerformance })));
const DarkFeminineInstagram = lazy(() => import("@/components/DarkFeminineInstagram").then(module => ({ default: module.DarkFeminineInstagram })));
const ContentPipeline = lazy(() => import("@/components/ContentPipeline").then(module => ({ default: module.ContentPipeline })));
const ResearchModule = lazy(() => import("@/components/ResearchModule").then(module => ({ default: module.ResearchModule })));
const InsightsEngine = lazy(() => import("@/components/InsightsEngine").then(module => ({ default: module.InsightsEngine })));
const QuickCapture = lazy(() => import("@/components/QuickCapture").then(module => ({ default: module.QuickCapture })));

const ComponentLoader = () => (
  <div className="w-full h-24 flex items-center justify-center bg-muted/5 rounded-xl border border-border/50 animate-pulse">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Loading Module...</div>
  </div>
);

const Index = () => {
  const [activeBrand, setActiveBrand] = useState<Brand | null>(BRANDS.find(b => b.id === "brand_darkfeminine") || null);

  const isDarkFem = activeBrand?.id === "brand_darkfeminine";

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">

        {/* ── Brand Selector ── */}
        <BrandSelector selected={activeBrand} onChange={setActiveBrand} />

        {activeBrand ? (
          <Suspense fallback={<ComponentLoader />}>
            {/* Brand header */}
            <div className="glass-card px-5 py-4 flex items-center gap-3 border-primary/20 glow-emerald">
              <span className="text-2xl">{activeBrand.emoji}</span>
              <div>
                <p className={`text-base font-bold ${activeBrand.color}`}>{activeBrand.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  Overview · {activeBrand.id}
                  {isDarkFem && <span className="ml-2 text-primary">· Live data</span>}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {/* Quick link to Ads Hub */}
                <Link
                  to="/ads"
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                >
                  <Megaphone className="w-3 h-3" /> Ads Hub
                </Link>
                <div className="flex items-center gap-2">
                  <div className="status-dot status-running" />
                  <span className="text-xs text-muted-foreground">
                    {isDarkFem ? "Synced" : "Live Data"}
                  </span>
                </div>
              </div>
            </div>

            {/* Agent Monitor */}
            <AgentMonitor />

            {/* Social Performance — brand-specific if available */}
            {isDarkFem ? <DarkFeminineInstagram /> : <SocialPerformance />}

            {/* Content Pipeline */}
            <ContentPipeline />

            {/* Research Module */}
            <ResearchModule />

            {/* Insights Engine */}
            <InsightsEngine />
          </Suspense>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Layers className="w-8 h-8 text-primary/60" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground/70 mb-1">No Brand Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a brand above to load its overview — agents, social, pipeline, research, and insights.
                <br /><span className="text-accent">Go to <Link to="/ads" className="underline underline-offset-2">Ads Hub</Link> for ads surgery.</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              <button
                onClick={() => setActiveBrand({ id: "brand_demo", label: "Demo Brand", emoji: "🧪", color: "text-primary", glow: "shadow-primary/20" })}
                className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                🧪 Demo Brand
              </button>
              <button
                onClick={() => setActiveBrand({ id: "brand_darkfeminine", label: "Dark Feminine", emoji: "🖤", color: "text-purple-400", glow: "shadow-purple-500/20" })}
                className="text-[11px] px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer"
              >
                🖤 Dark Feminine
              </button>
              {["👑 Raja Ranjang", "💎 El Royal Jewelry", "⚡ eL Vision"].map((b) => (
                <span key={b} className="text-[11px] px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground border border-border/40">{b}</span>
              ))}
              <span className="text-[11px] px-3 py-1.5 rounded-full bg-muted/30 text-muted-foreground/50 border border-border/20">+7 more…</span>
            </div>
          </div>
        )}

      </div>
      <Suspense fallback={null}>
        <QuickCapture />
      </Suspense>
    </DashboardLayout>
  );
};

export default Index;
