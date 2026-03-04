import { Bot, PenTool, CheckSquare, Calendar, BarChart3, Megaphone, Flame, AlertTriangle } from "lucide-react";

const agents = [
  { name: "Researcher", icon: Bot, status: "running" as const, progress: 72, task: "Scanning 24 competitors..." },
  { name: "Scriptwriter", icon: PenTool, status: "running" as const, progress: 67, task: "Writing hook v3 — 67%" },
  { name: "Editor", icon: CheckSquare, status: "idle" as const, progress: 0, task: "3 tasks pending approval" },
  { name: "Scheduler", icon: Calendar, status: "running" as const, progress: 100, task: "8 posts queued" },
  { name: "Analytics Agent", icon: BarChart3, status: "running" as const, progress: 45, task: "Processing 30-day data..." },
  { name: "Ad Optimizer", icon: Megaphone, status: "running" as const, progress: 58, task: "Scanning underperforming ads", isAdOptimizer: true },
];

const statusColors = {
  running: "text-emerald",
  idle: "text-muted-foreground",
  error: "text-destructive",
};

const statusBg = {
  running: "bg-emerald/10",
  idle: "bg-muted/50",
  error: "bg-destructive/10",
};

export function AgentMonitor() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-primary" />
        AI Team Monitor
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="glass-card p-4 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${statusBg[agent.status]} flex items-center justify-center`}>
                <agent.icon className={`w-4 h-4 ${statusColors[agent.status]}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{agent.name}</p>
                <div className="flex items-center gap-1">
                  <div className={`status-dot status-${agent.status}`} />
                  <span className={`text-[10px] uppercase font-medium ${statusColors[agent.status]}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>

            {agent.status === "running" && (
              <div className="mb-2">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000 animate-shimmer"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground leading-relaxed">{agent.task}</p>

            {"isAdOptimizer" in agent && agent.isAdOptimizer && (
              <div className="flex gap-2 mt-2">
                <div className="flex items-center gap-1 text-[10px]">
                  <Flame className="w-3 h-3 text-warning" />
                  <span className="text-warning">2 winning</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">1 high CPA</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
