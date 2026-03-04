import { useState } from "react";
import { Send, Zap } from "lucide-react";

export function QuickCapture() {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    // In real app, this would push to the Ideas column
    setIdea("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto pointer-events-auto"
      >
        <div className="glass-card flex items-center gap-3 p-2 glow-emerald">
          <Zap className="w-4 h-4 text-primary ml-2 shrink-0" />
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Quick capture — type an idea and hit Enter..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-lg bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      </form>
    </div>
  );
}
