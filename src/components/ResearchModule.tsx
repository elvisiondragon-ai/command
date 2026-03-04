import { Search, TrendingUp, Eye, Sparkles } from "lucide-react";

const trendingTopics = [
  { title: "5 Skincare Hacks yang Viral di TikTok", niche: "Beauty", score: 95 },
  { title: "AI Tools untuk Bisnis Kecil 2026", niche: "Tech", score: 88 },
  { title: "Resep 15 Menit untuk Meal Prep", niche: "Food", score: 82 },
  { title: "Cara Dapat 10K Followers dalam 30 Hari", niche: "Growth", score: 79 },
];

const competitors = [
  { name: "@beautybylia", platform: "TikTok", followers: "890K", lastActivity: "Posted 2h ago" },
  { name: "@techreview.id", platform: "YouTube", followers: "1.2M", lastActivity: "Posted 5h ago" },
  { name: "@fitnessjkt", platform: "Instagram", followers: "456K", lastActivity: "Posted 1d ago" },
];

const hookFormulas = [
  { formula: "Jangan lakukan [X] sebelum kamu tahu ini...", category: "Curiosity", uses: 24 },
  { formula: "Ini rahasia kenapa [hasil] bisa tercapai dalam [waktu]", category: "Promise", uses: 18 },
  { formula: "POV: Kamu baru sadar [insight mengejutkan]", category: "POV", uses: 31 },
  { formula: "3 kesalahan fatal saat [aktivitas] — nomor 2 paling sering!", category: "Listicle", uses: 15 },
];

export function ResearchModule() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-secondary" />
        Research & Competitor Pulse
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Trending */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <p className="text-xs font-semibold">Trending Topics</p>
          </div>
          <div className="space-y-2">
            {trendingTopics.map((t) => (
              <div key={t.title} className="flex items-start gap-2 py-1.5 border-b border-border/20 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate">{t.title}</p>
                  <span className="text-[9px] text-muted-foreground">{t.niche}</span>
                </div>
                <span className="text-[10px] text-emerald font-mono">{t.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitors */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-accent" />
            <p className="text-xs font-semibold">Competitor Pulse</p>
          </div>
          <div className="space-y-2">
            {competitors.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                <div>
                  <p className="text-xs font-medium">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.platform} · {c.followers}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{c.lastActivity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hook Formulas */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-warning" />
            <p className="text-xs font-semibold">Hook Formulas</p>
          </div>
          <div className="space-y-2">
            {hookFormulas.map((h) => (
              <div key={h.formula} className="py-1.5 border-b border-border/20 last:border-0">
                <p className="text-xs leading-relaxed">"{h.formula}"</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-secondary">{h.category}</span>
                  <button className="text-[9px] text-primary hover:underline">Use This</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
