// ============================================================
// useDarkFemLive — Live Meta Graph API hook (Multi-Campaign)
// Fetches campaign insights + per-ad breakdown on every mount
// Supports switching between ID / EN / PH campaigns
// ============================================================
import { useState, useEffect, useCallback } from "react";
import type { DateRange, CampaignRegion } from "@/data/darkfeminine";
import { DF_ALL_CAMPAIGNS } from "@/data/darkfeminine";

const TOKEN = import.meta.env.VITE_META_TOKEN;
const API = "https://graph.facebook.com/v24.0";

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
    refresh: () => void;
}

const DATE_PRESET: Record<string, string> = {
    today: "date_preset=today",
    yesterday: "date_preset=yesterday",
    last_7d: "date_preset=last_7d",
    last_30d: "date_preset=last_30d",
    today_and_yesterday: "time_range={'since':'2026-03-03','until':'2026-03-04'}",
};

async function fetchInsights(campaignId: string, dateRange: string): Promise<LiveInsights> {
    if (!TOKEN) throw new Error("META_TOKEN is missing in environment");
    console.log(`[DEBUG] fetchInsights: ${campaignId}, Range: ${dateRange}`);
    const preset = DATE_PRESET[dateRange] || DATE_PRESET.today;
    const fields = "spend,impressions,clicks,reach,ctr,cpc,cpm,actions,action_values,purchase_roas";
    const url = `${API}/${campaignId}/insights?fields=${fields}&${preset}&access_token=${TOKEN}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.error) {
            console.error(`[DEBUG] Insights API Error:`, data.error);
            throw new Error(data.error.message);
        }

        if (!data.data?.[0]) {
            return { spend: 0, impressions: 0, clicks: 0, reach: 0, ctr: 0, cpc: 0, cpm: 0, purchases: 0, addPaymentInfo: 0, roas: 0, linkClicks: 0 };
        }

        const ins = data.data[0];
        const acts = Object.fromEntries((ins.actions ?? []).map((a: { action_type: string; value: string }) => [a.action_type, parseFloat(a.value)]));
        const vals = Object.fromEntries((ins.action_values ?? []).map((a: { action_type: string; value: string }) => [a.action_type, parseFloat(a.value)]));
        const roas = (ins.purchase_roas ?? []).find((a: { action_type: string; value: string }) => a.action_type === "omni_purchase")?.value ?? "0";

        return {
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
            linkClicks: ins.inline_link_clicks ?? acts["link_click"] ?? 0,
        };
    } catch (err) {
        console.error(`[DEBUG] fetchInsights failed:`, err);
        throw err;
    }
}

async function fetchAdBreakdown(campaignId: string, dateRange: string): Promise<LiveAdInsight[]> {
    console.log(`[DEBUG] fetchAdBreakdown (BULK) started for Campaign: ${campaignId}`);
    const preset = DATE_PRESET[dateRange] || DATE_PRESET.today;
    
    // Instead of looping, we ask for all ads in this campaign at once
    const fields = "ad_id,ad_name,spend,impressions,clicks,ctr,reach,actions,action_values,cost_per_action_type,inline_link_clicks";
    const url = `${API}/${campaignId}/insights?level=ad&fields=${fields}&${preset}&access_token=${TOKEN}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.error) {
            console.error(`[DEBUG] Bulk Ad Insights Error:`, data.error.message);
            return [];
        }

        if (!data.data) return [];

        console.log(`[DEBUG] Found insights for ${data.data.length} ads in campaign ${campaignId}`);

        const ads: LiveAdInsight[] = data.data.map((ins: any) => {
            const acts = Object.fromEntries((ins.actions ?? []).map((a: any) => [a.action_type, parseFloat(a.value)]));
            const cpa = Object.fromEntries((ins.cost_per_action_type ?? []).map((a: any) => [a.action_type, parseFloat(a.value)]));
            
            return {
                id: ins.ad_id,
                name: ins.ad_name,
                status: "ACTIVE", // Insights only return for ads that have data/spending
                spend: parseFloat(ins.spend ?? "0"),
                impressions: parseInt(ins.impressions ?? "0"),
                clicks: parseInt(ins.clicks ?? "0"),
                ctr: parseFloat(ins.ctr ?? "0"),
                reach: parseInt(ins.reach ?? "0"),
                purchases: acts["purchase"] ?? 0,
                addPaymentInfo: acts["add_payment_info"] ?? 0,
                cpaPurchase: cpa["purchase"] ?? 0,
                linkClicks: ins.inline_link_clicks ?? acts["link_click"] ?? 0,
            };
        });

        return ads.sort((a, b) => b.spend - a.spend);
    } catch (err) {
        console.error(`[DEBUG] fetchAdBreakdown Exception:`, err);
        return [];
    }
}

export function useDarkFemLive(dateRange: string, region: CampaignRegion = "id"): LiveData {
    const [insights, setInsights] = useState<LiveInsights | null>(null);
    const [ads, setAds] = useState<LiveAdInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const campaign = DF_ALL_CAMPAIGNS.find(c => c.region === region) ?? DF_ALL_CAMPAIGNS[0];
    const refresh = useCallback(() => setTick(t => t + 1), []);

    // Fetch insights whenever dateRange, region, or tick changes
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchInsights(campaign.id, dateRange)
            .then(d => { if (!cancelled) { setInsights(d); setLastSync(new Date().toLocaleTimeString("id-ID")); } })
            .catch(e => { if (!cancelled) setError(String(e)); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [dateRange, region, tick, campaign.id]);

    // Fetch ad breakdown on region change + manual refresh
    useEffect(() => {
        setAds([]); // clear old region data
        fetchAdBreakdown(campaign.id, dateRange)
            .then(d => setAds(d))
            .catch(() => { }); // silent fail — fallback to static
    }, [region, tick, campaign.id, dateRange]);

    return { insights, ads, loading, error, lastSync, refresh };
}

