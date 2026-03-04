import { Lightbulb, Heart, MessageCircle, Share2, Bookmark, RefreshCw } from "lucide-react";

const posts = [
  { title: "Day in My Life Vlog", likes: 12400, comments: 890, shares: 2300, saves: 1560 },
  { title: "5 Tips Skincare Pagi", likes: 8900, comments: 560, shares: 1800, saves: 2100 },
  { title: "Tutorial Makeup Natural", likes: 6700, comments: 340, shares: 900, saves: 780 },
  { title: "Review Produk Viral", likes: 4500, comments: 230, shares: 560, saves: 420 },
  { title: "Behind the Scenes Studio", likes: 3200, comments: 180, shares: 340, saves: 290 },
];

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

export function InsightsEngine() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-warning" />
        Insights & Repurpose
      </h2>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Content</th>
                <th className="p-3 text-muted-foreground font-medium"><Heart className="w-3 h-3 mx-auto" /></th>
                <th className="p-3 text-muted-foreground font-medium"><MessageCircle className="w-3 h-3 mx-auto" /></th>
                <th className="p-3 text-muted-foreground font-medium"><Share2 className="w-3 h-3 mx-auto" /></th>
                <th className="p-3 text-muted-foreground font-medium"><Bookmark className="w-3 h-3 mx-auto" /></th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.title} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 text-center text-muted-foreground">{fmt(p.likes)}</td>
                  <td className="p-3 text-center text-muted-foreground">{fmt(p.comments)}</td>
                  <td className="p-3 text-center text-muted-foreground">{fmt(p.shares)}</td>
                  <td className="p-3 text-center text-muted-foreground">{fmt(p.saves)}</td>
                  <td className="p-3">
                    <button className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                      <RefreshCw className="w-3 h-3" /> Repurpose
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
