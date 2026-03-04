import { BarChart3, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState } from "react";

const generateData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      organic: Math.floor(Math.random() * 5000 + 8000 + (days - i) * 100),
      paid: Math.floor(Math.random() * 3000 + 2000 + (days - i) * 50),
    });
  }
  return data;
};

const platforms = [
  { name: "TikTok", followers: "124.5K", views: "2.3M", engagement: "6.8%" },
  { name: "Instagram", followers: "89.2K", views: "1.1M", engagement: "4.2%" },
  { name: "YouTube", followers: "45.1K", views: "890K", engagement: "7.1%" },
];

const periods = ["7d", "30d", "90d"] as const;

export function SocialPerformance() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const data = generateData(days);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-secondary" />
          Social Performance
        </h2>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                period === p
                  ? "bg-secondary/20 text-secondary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {platforms.map((p) => (
          <div key={p.name} className="glass-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.name}</p>
            <p className="text-lg font-bold mt-1">{p.followers}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground">{p.views} views</span>
              <span className="text-[10px] text-emerald flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {p.engagement}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4 mb-3 text-[10px]">
          <span className="flex items-center gap-1">
            <div className="w-3 h-0.5 rounded bg-secondary" /> Organic
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-0.5 rounded bg-accent" /> Paid
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(days / 6)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(240 8% 9% / 0.95)",
                border: "1px solid hsl(240 6% 18%)",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            />
            <Line type="monotone" dataKey="organic" stroke="hsl(270 91% 65%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="paid" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
