import { Kanban, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const columns = [
  {
    name: "Ideas", color: "bg-muted-foreground",
    items: [
      { title: "5 Tips Skincare Pagi", type: "Short-form", agent: "—", deadline: "Mar 5" },
      { title: "Behind the Scenes Studio", type: "Carousel", agent: "—", deadline: "Mar 7" },
    ],
  },
  {
    name: "Scripting", color: "bg-secondary",
    items: [
      { title: "Review Produk Viral", type: "Short-form", agent: "Scriptwriter", deadline: "Mar 4" },
    ],
  },
  {
    name: "Editing", color: "bg-warning",
    items: [
      { title: "Tutorial Makeup Natural", type: "Short-form", agent: "Editor", deadline: "Mar 3" },
      { title: "Flash Sale Ad Copy", type: "Ad Copy", agent: "Editor", deadline: "Mar 3" },
    ],
  },
  {
    name: "Scheduled", color: "bg-accent",
    items: [
      { title: "Unboxing Produk Baru", type: "Short-form", agent: "Scheduler", deadline: "Mar 4" },
      { title: "Promo Weekend IG Story", type: "Carousel", agent: "Scheduler", deadline: "Mar 5" },
      { title: "Google Search Ad Q1", type: "Ad Copy", agent: "Scheduler", deadline: "Mar 6" },
    ],
  },
  {
    name: "Published", color: "bg-emerald",
    items: [
      { title: "Day in My Life Vlog", type: "Short-form", agent: "—", deadline: "Mar 1" },
    ],
  },
];

const typeBadgeColor: Record<string, string> = {
  "Short-form": "bg-secondary/20 text-secondary",
  "Carousel": "bg-accent/20 text-accent",
  "Ad Copy": "bg-ads-blue/20 text-ads-blue",
};

export function ContentPipeline() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Kanban className="w-5 h-5 text-primary" />
        Content Pipeline
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col.name} className="min-w-[220px] flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-xs font-semibold">{col.name}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.map((item, i) => (
                <div
                  key={i}
                  className="glass-card p-3 hover:border-primary/20 transition-colors cursor-grab group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-3 h-3 text-muted-foreground/30 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${typeBadgeColor[item.type]}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>{item.agent}</span>
                        <span>{item.deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
