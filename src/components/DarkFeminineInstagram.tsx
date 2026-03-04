import { Instagram, Users, Image, TrendingUp, ExternalLink } from "lucide-react";
import { DF_INSTAGRAM, DF_INSIGHTS, DF_DAILY } from "@/data/darkfeminine";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function DarkFeminineInstagram() {
    const ig = DF_INSTAGRAM;
    const ins = DF_INSIGHTS["last_7d"];

    // Derive engagement-like metric from ad data (paid reach engagement)
    const paidEngagementRate = ((ins.clicks / ins.impressions) * 100).toFixed(2);

    return (
        <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Instagram className="w-5 h-5 text-secondary" />
                Social Performance
                <span className="text-[10px] text-muted-foreground font-normal ml-1">live · Instagram</span>
            </h2>

            {/* Instagram profile card */}
            <div className="glass-card p-4 mb-4 flex items-center gap-4">
                <img
                    src={ig.profilePicture}
                    alt={ig.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-secondary/40"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56/1a1a2e/a855f7?text=IG"; }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">@{ig.username}</p>
                        <a
                            href={`https://instagram.com/${ig.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{ig.name}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5 whitespace-pre-line leading-relaxed line-clamp-2">
                        {ig.biography}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="status-dot status-running ml-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Connected</p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="glass-card p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <Users className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Followers</span>
                    </div>
                    <p className="text-xl font-bold text-secondary">
                        {(ig.followers / 1000).toFixed(1)}K
                    </p>
                </div>
                <div className="glass-card p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <Image className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Posts</span>
                    </div>
                    <p className="text-xl font-bold text-accent">{ig.mediaCount}</p>
                </div>
                <div className="glass-card p-3">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Paid CTR</span>
                    </div>
                    <p className="text-xl font-bold text-emerald">{paidEngagementRate}%</p>
                </div>
            </div>

            {/* Paid reach trend chart */}
            <div className="glass-card p-4">
                <p className="text-xs font-semibold mb-1">Paid Reach Trend (last 5 days)</p>
                <p className="text-[10px] text-muted-foreground mb-3">From Meta Ads · ad account act_1852914552158992</p>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={DF_DAILY}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 16%)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }} tickLine={false} axisLine={false} width={38} />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(240 8% 9% / 0.95)",
                                border: "1px solid hsl(240 6% 18%)",
                                borderRadius: "8px",
                                fontSize: "11px",
                            }}
                        />
                        <Line type="monotone" dataKey="reach" stroke="hsl(270 91% 65%)" strokeWidth={2} dot={{ r: 3 }} name="Reach" />
                        <Line type="monotone" dataKey="impressions" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 3 }} name="Impressions" strokeDasharray="4 2" />
                    </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-[10px] mt-2">
                    <span className="flex items-center gap-1"><div className="w-3 h-0.5 rounded bg-secondary" /> Reach</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-0.5 rounded bg-accent" style={{ backgroundImage: "repeating-linear-gradient(to right, hsl(217 91% 60%) 0px, hsl(217 91% 60%) 4px, transparent 4px, transparent 6px)" }} /> Impressions</span>
                </div>
            </div>
        </section>
    );
}
