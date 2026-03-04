import { useState, useRef, useEffect } from "react";
import { ChevronDown, Layers, Sparkles } from "lucide-react";

export type Brand = {
    id: string;
    label: string;
    emoji: string;
    color: string; // tailwind text color class
    glow: string;  // tailwind shadow utility or inline
};

export const BRANDS: Brand[] = [
    { id: "brand_demo", label: "Demo Brand", emoji: "🧪", color: "text-primary", glow: "shadow-primary/20" },
    { id: "brand_darkfeminine", label: "Dark Feminine", emoji: "🖤", color: "text-purple-400", glow: "shadow-purple-500/20" },
    { id: "brand_rajaranjang", label: "Raja Ranjang", emoji: "👑", color: "text-amber-400", glow: "shadow-amber-500/20" },
    { id: "brand_jewel", label: "El Royal Jewelry", emoji: "💎", color: "text-cyan-400", glow: "shadow-cyan-500/20" },
    { id: "brand_angkung", label: "ag", emoji: "🌿", color: "text-green-400", glow: "shadow-green-500/20" },
    { id: "brand_coparenting", label: "Co-Parenting", emoji: "🤝", color: "text-blue-400", glow: "shadow-blue-500/20" },
    { id: "brand_drelf", label: "Dr. Elf", emoji: "🩺", color: "text-teal-400", glow: "shadow-teal-500/20" },
    { id: "brand_elflow", label: "El Flow", emoji: "🌊", color: "text-sky-400", glow: "shadow-sky-500/20" },
    { id: "brand_elvision", label: "eL Vision", emoji: "⚡", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
    { id: "brand_package", label: "Package Brand", emoji: "📦", color: "text-orange-400", glow: "shadow-orange-500/20" },
    { id: "brand_umkm", label: "UMKM", emoji: "🏪", color: "text-rose-400", glow: "shadow-rose-500/20" },
];

type Props = {
    selected: Brand | null;
    onChange: (brand: Brand | null) => void;
};

export function BrandSelector({ selected, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="mb-8" ref={ref}>
            {/* Label row */}
            <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Select Brand
                </span>
            </div>

            {/* Trigger button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className={`
          relative w-full max-w-sm flex items-center justify-between gap-3
          glass-card px-4 py-3 hover:border-primary/40 transition-all duration-300
          ${open ? "border-primary/50 glow-emerald" : ""}
          ${selected ? "glow-emerald" : ""}
        `}
            >
                {selected ? (
                    <span className="flex items-center gap-2">
                        <span className="text-xl leading-none">{selected.emoji}</span>
                        <span className={`text-sm font-semibold ${selected.color}`}>
                            {selected.label}
                        </span>
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-muted-foreground/60">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm">Choose a brand to load its dashboard…</span>
                    </span>
                )}
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="
            absolute z-50 mt-2 w-full max-w-sm
            glass-card border border-border/60 p-1
            animate-in fade-in slide-in-from-top-2 duration-150
          "
                >
                    {BRANDS.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => {
                                onChange(brand);
                                setOpen(false);
                            }}
                            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                hover:bg-muted/60 transition-colors duration-150
                ${selected?.id === brand.id ? "bg-primary/10 border border-primary/20" : ""}
              `}
                        >
                            <span className="text-lg leading-none w-6 text-center">{brand.emoji}</span>
                            <span className={`text-sm font-medium ${brand.color}`}>{brand.label}</span>
                            {selected?.id === brand.id && (
                                <span className="ml-auto text-[10px] text-primary font-semibold uppercase tracking-wider">
                                    Active
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Clear selection */}
                    {selected && (
                        <div className="border-t border-border/30 mt-1 pt-1">
                            <button
                                onClick={() => {
                                    onChange(null);
                                    setOpen(false);
                                }}
                                className="w-full px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left"
                            >
                                × Clear selection
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
