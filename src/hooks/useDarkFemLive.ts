// ============================================================
// useDarkFemLive — Live Meta Graph API hook (Multi-Campaign)
// Fetches campaign insights + per-ad breakdown on every mount
// Supports switching between ID / EN / PH campaigns
// Cache: 5 minutes per (campaignId + dateRange) key
// ============================================================
import { useState, useEffect, useCallback } from "react";
import type { DateRange, CampaignRegion } from "@/data/darkfeminine";
import { DF_ALL_CAMPAIGNS } from "@/data/darkfeminine";

const TOKEN = import.meta.env.VITE_META_TOKEN;
const API = "https://graph.facebook.com/v24.0";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── In-memory cache ─────────────────────────────────────────
interface CacheEntry<T> {
    data: T;
    fetchedAt: number; // epoch ms
}
const insightsCache = new Map<string, CacheEntry<LiveInsights>>();
const adsCache = new Map<string, CacheEntry<LiveAdInsight[]>>();

export interface LiveInsights {
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
    ctr: number;
    cpc: number;
    cpm: number;
    purchases: number;
    purchaseValue: number;
    addPaymentInfo: number;
    roas: number;
    linkClicks: number;
}

export interface LiveAdInsight {
    id: string;
    name: string;
    status: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    reach: number;
    purchases: number;
    addPaymentInfo: number;
    cpaPurchase: number;
    linkClicks: number;
}

export interface LiveData {
    insights: LiveInsights | null;
    ads: LiveAdInsight[];
    loading: boolean;
    error: string | null;
    lastSync: string | null;
    cacheAge: number | null; // seconds ago
    refresh: () => void;
}

// ── Local date helper ──────────────────────────────────────────
// Uses the browser's LOCAL timezone (not UTC), so the date is always
// correct for the user (e.g. UTC+7 WIB at 5 AM ≠ UTC's March 4).
function getLocalDateStr(offsetDays = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// ── Meta API date params — fully dynamic, no hardcoded dates ──
// Returns an object to spread into URLSearchParams.
// For today_and_yesterday: uses time_range with local-timezone dates
// because there is no standard 2-day Meta preset, and toISOString()
// gives wrong date for UTC+7 users before midnight UTC.
function buildDateParams(dateRange: string): Record<string, string> {
    switch (dateRange) {
        case "today": return { date_preset: "today" };
        case "yesterday": return { date_preset: "yesterday" };
        case "today_and_yesterday": {
            const since = getLocalDateStr(-1); // yesterday in local tz
            const until = getLocalDateStr(0);  // today in local tz
            return { time_range: JSON.stringify({ since, until }) };
        }
        case "last_7d": return { date_preset: "last_7d" };
        case "last_30d": return { date_preset: "last_30d" };
        case "maximum": return { date_preset: "maximum" };
        default: return { date_preset: "today" };
    }
}

// Cache key includes computed dates for today_and_yesterday
// so the cache entry expires correctly at day boundaries.
function buildCacheKey(campaignId: string, dateRange: string): string {
    if (dateRange === "today_and_yesterday") {
        return `${campaignId}::${dateRange}::${getLocalDateStr(-1)}_${getLocalDateStr(0)}`;
    }
    return `${campaignId}::${dateRange}`;
}


// ── Fetch helpers ────────────────────────────────────────────
async function fetchInsights(
    campaignId: string,
    dateRange: string,
    forceRefresh = false,
): Promise<LiveInsights> {
    if (!TOKEN) throw new Error("META_TOKEN is missing in environment");

    const cacheKey = buildCacheKey(campaignId, dateRange);
    const cached = insightsCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        console.log(`[Cache HIT] insights ${cacheKey} (${Math.round((Date.now() - cached.fetchedAt) / 1000)}s old)`);
        return cached.data;
    }

    const dateParams = buildDateParams(dateRange);
    const fields = "spend,impressions,clicks,reach,ctr,cpc,cpm,actions,action_values,purchase_roas,inline_link_clicks";
    const qs = new URLSearchParams({ fields, access_token: TOKEN, ...dateParams });
    const url = `${API}/${campaignId}/insights?${qs.toString()}`;

    console.log(`[Meta API] fetch insights: ${dateRange} → ${JSON.stringify(dateParams)}`);

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
        console.error(`[Meta API] Insights error:`, data.error);
        throw new Error(data.error.message);
    }

    if (!data.data?.[0]) {
        const empty: LiveInsights = { spend: 0, impressions: 0, clicks: 0, reach: 0, ctr: 0, cpc: 0, cpm: 0, purchases: 0, purchaseValue: 0, addPaymentInfo: 0, roas: 0, linkClicks: 0 };
        insightsCache.set(cacheKey, { data: empty, fetchedAt: Date.now() });
        return empty;
    }

    const ins = data.data[0];
    const acts = Object.fromEntries((ins.actions ?? []).map((a: { action_type: string; value: string }) => [a.action_type, parseFloat(a.value)]));
    const vals = Object.fromEntries((ins.action_values ?? []).map((a: { action_type: string; value: string }) => [a.action_type, parseFloat(a.value)]));
    const roas = (ins.purchase_roas ?? []).find((a: { action_type: string; value: string }) => a.action_type === "omni_purchase")?.value ?? "0";

    const result: LiveInsights = {
        spend: parseFloat(ins.spend ?? "0"),
        impressions: parseInt(ins.impressions ?? "0"),
        clicks: parseInt(ins.clicks ?? "0"),
        reach: parseInt(ins.reach ?? "0"),
        ctr: parseFloat(ins.ctr ?? "0"),
        cpc: parseFloat(ins.cpc ?? "0"),
        cpm: parseFloat(ins.cpm ?? "0"),
        purchases: acts["purchase"] ?? 0,
        purchaseValue: vals["purchase"] ?? 0,
        addPaymentInfo: acts["add_payment_info"] ?? 0,
        roas: parseFloat(roas),
        linkClicks: parseInt(ins.inline_link_clicks ?? "0") || (acts["link_click"] ?? 0),
    };

    insightsCache.set(cacheKey, { data: result, fetchedAt: Date.now() });
    return result;
}

async function fetchAdBreakdown(
    campaignId: string,
    dateRange: string,
    forceRefresh = false,
): Promise<LiveAdInsight[]> {
    const cacheKey = buildCacheKey(campaignId, dateRange);
    const cached = adsCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        console.log(`[Cache HIT] ads ${cacheKey} (${Math.round((Date.now() - cached.fetchedAt) / 1000)}s old)`);
        return cached.data;
    }

    const dateParams = buildDateParams(dateRange);
    const fields = "ad_id,ad_name,spend,impressions,clicks,ctr,reach,actions,action_values,cost_per_action_type,inline_link_clicks";
    const qs = new URLSearchParams({ level: "ad", fields, access_token: TOKEN, ...dateParams });
    const url = `${API}/${campaignId}/insights?${qs.toString()}`;

    console.log(`[Meta API] fetch ad breakdown: ${dateRange} → ${JSON.stringify(dateParams)}`);

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            console.error(`[Meta API] Ad breakdown error:`, data.error.message);
            return [];
        }
        if (!data.data) return [];

        const ads: LiveAdInsight[] = data.data.map((ins: any) => {
            const acts = Object.fromEntries((ins.actions ?? []).map((a: any) => [a.action_type, parseFloat(a.value)]));
            const cpa = Object.fromEntries((ins.cost_per_action_type ?? []).map((a: any) => [a.action_type, parseFloat(a.value)]));
            return {
                id: ins.ad_id,
                name: ins.ad_name,
                status: "ACTIVE",
                spend: parseFloat(ins.spend ?? "0"),
                impressions: parseInt(ins.impressions ?? "0"),
                clicks: parseInt(ins.clicks ?? "0"),
                ctr: parseFloat(ins.ctr ?? "0"),
                reach: parseInt(ins.reach ?? "0"),
                purchases: acts["purchase"] ?? 0,
                addPaymentInfo: acts["add_payment_info"] ?? 0,
                cpaPurchase: cpa["purchase"] ?? 0,
                linkClicks: parseInt(ins.inline_link_clicks ?? "0") || (acts["link_click"] ?? 0),
            };
        });

        const sorted = ads.sort((a, b) => b.spend - a.spend);
        adsCache.set(cacheKey, { data: sorted, fetchedAt: Date.now() });
        return sorted;
    } catch (err) {
        console.error(`[Meta API] fetchAdBreakdown exception:`, err);
        return [];
    }
}

// ── Hook ─────────────────────────────────────────────────────
export function useDarkFemLive(dateRange: string, region: CampaignRegion = "id"): LiveData {
    const [insights, setInsights] = useState<LiveInsights | null>(null);
    const [ads, setAds] = useState<LiveAdInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [cacheAge, setCacheAge] = useState<number | null>(null);
    const [tick, setTick] = useState(0); // incremented on manual refresh

    const campaign = DF_ALL_CAMPAIGNS.find(c => c.region === region) ?? DF_ALL_CAMPAIGNS[0];

    // Manual refresh bypasses the cache
    const refresh = useCallback(() => setTick(t => t + 1), []);

    // Determine if this tick is a forced refresh (odd = force)
    const isForce = tick % 2 === 1;

    // Fetch insights whenever dateRange, region, or tick changes
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        // Use cache on even ticks (auto), force on odd (manual refresh click)
        fetchInsights(campaign.id, dateRange, isForce)
            .then(d => {
                if (!cancelled) {
                    setInsights(d);
                    const entry = insightsCache.get(`${campaign.id}::${dateRange}`);
                    const ageSeconds = entry ? Math.round((Date.now() - entry.fetchedAt) / 1000) : 0;
                    setCacheAge(ageSeconds);
                    setLastSync(new Date().toLocaleTimeString("id-ID"));
                }
            })
            .catch(e => { if (!cancelled) setError(String(e)); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [dateRange, region, tick, campaign.id, isForce]);

    // Fetch ad breakdown whenever region, dateRange, or tick changes
    useEffect(() => {
        setAds([]);
        fetchAdBreakdown(campaign.id, dateRange, isForce)
            .then(d => setAds(d))
            .catch(() => { });
    }, [region, tick, campaign.id, dateRange, isForce]);

    return { insights, ads, loading, error, lastSync, cacheAge, refresh };
}
