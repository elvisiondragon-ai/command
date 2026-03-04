import { Megaphone, TrendingUp, DollarSign, MousePointer, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import adData from "../data/ad_performance.json";

const iconMap: Record<string, any> = {
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
  MousePointer: MousePointer,
  Target: Target,
  Megaphone: Megaphone,
};

const dailyData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  spend: Math.floor(Math.random() * 500000 + 300000),
  revenue: Math.floor(Math.random() * 1500000 + 800000),
}));

export function AdPerformanceHub() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-accent" />
            <span>Ad Performance Hub</span>
          </h2>
          <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
            {adData.period}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
          Sync: {adData.last_updated}
        </span>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {adData.metrics.map((m) => {
          const Icon = iconMap[m.icon] || Target;
          return (
            <div key={m.label} className="glass-card p-3 glow-blue">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3 h-3 ${m.color}`} />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{m.label}</span>
              </div>
              <p className="text-sm lg:text-base font-bold truncate">{m.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs font-semibold mb-3 flex items-center justify-between">
            <span>Active Campaigns</span>
            <span className="text-[9px] font-normal text-muted-foreground">Sorted by Spend</span>
          </p>
          <div className="space-y-2">
            {adData.campaigns.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate uppercase tracking-tighter text-accent/80">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.budget}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === "active" ? "bg-emerald/10 text-emerald" : "bg-warning/10 text-warning"
                  }`}>
                    {c.status}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{c.leads.toLocaleString()} reach</p>
                    <p className="text-[10px] text-emerald">{c.sales} purchases</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <p className="text-xs font-semibold mb-3">Ad Spend vs Revenue (14d)</p>
          <div className="flex items-center gap-4 mb-3 text-[10px]">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-accent" /> Spend
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald" /> Revenue
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(220 10% 55%)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(220 10% 55%)" }} tickLine={false} axisLine={false} width={50}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{
                  background: "hsl(240 8% 9% / 0.95)",
                  border: "1px solid hsl(240 6% 18%)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
                formatter={(value: number) => `Rp ${(value / 1000).toFixed(0)}K`}
              />
              <Bar dataKey="spend" fill="hsl(217 91% 60%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="revenue" fill="hsl(155 100% 50%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
