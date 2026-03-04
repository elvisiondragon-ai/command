// ============================================================
// Dark Feminine — Multi-Campaign Real Meta Ads Data
// Account: act_1852914552158992
// Updated: 2026-03-04
// ============================================================

export type DateRange = "today" | "yesterday" | "last_7d" | "last_30d";
export type CampaignRegion = "id" | "en" | "ph";

export interface CampaignData {
    id: string;
    name: string;
    region: CampaignRegion;
    flag: string;
    label: string;
    status: "ACTIVE" | "PAUSED";
    objective: string;
    startTime: string;
    dailyBudget: number;
    currency: string;
    landingUrl: string;
    adsets: AdsetData[];
    ads: AdData[];
}

export interface AdsetData {
    id: string;
    name: string;
    status: "ACTIVE" | "PAUSED";
    optimizationGoal: string;
    billingEvent: string;
    startTime: string;
}

export interface AdData {
    id: string;
    name: string;
    status: "ACTIVE" | "PAUSED";
    type: "image" | "video";
}

// ── INDONESIA CAMPAIGN ───────────────────────────────────────
export const DF_CAMPAIGN_ID: CampaignData = {
    id: "120238241212550464",
    name: "DarkFem",
    region: "id",
    flag: "🇮🇩",
    label: "Indonesia",
    status: "ACTIVE",
    objective: "OUTCOME_SALES",
    startTime: "2026-02-26",
    dailyBudget: 100000,
    currency: "IDR",
    landingUrl: "https://ai.elvisiongroup.com/darkfeminine?id",
    adsets: [
        { id: "120238241212560464", name: "indo women", status: "ACTIVE", optimizationGoal: "OFFSITE_CONVERSIONS", billingEvent: "IMPRESSIONS", startTime: "2026-02-26" },
    ],
    ads: [
        { id: "120238243569650464", name: "DF_2AM_Scroll_Diam2_Pengen_Jadi_Dia", status: "ACTIVE", type: "image" },
        { id: "120238243583260464", name: "DF_WakeUp_Bukan_Kurang_Cantik", status: "ACTIVE", type: "image" },
        { id: "120238243575990464", name: "DF_Comparison_Temen_Biasa_Dpt_Gila", status: "ACTIVE", type: "image" },
        { id: "120238243581640464", name: "DF_Secret_Ilmu_Tak_Pernah_Diajarkan", status: "ACTIVE", type: "image" },
        { id: "120238243577410464", name: "DF_Ghosted_Lagi_Pattern_Toxic", status: "ACTIVE", type: "image" },
        { id: "120238243568210464", name: "DF_Paradox_Kenapa_Rendah_Dpt_CEO", status: "ACTIVE", type: "image" },
        { id: "120238243585480464", name: "DF_SocietyLie_Aturan_Bohong", status: "ACTIVE", type: "image" },
        { id: "120238243574980464", name: "DF_TemanCurhat_Stop_Jadi_Opsi", status: "ACTIVE", type: "image" },
        { id: "120238243603160464", name: "DF_Video_Sari_Istri_Dilupakan", status: "ACTIVE", type: "video" },
        // V2 replacements
        { id: "120238442862000464", name: "DF_V2_Jangan_Nonton_Jadi_Leading_Lady", status: "ACTIVE", type: "image" },
        { id: "120238442875480464", name: "DF_V2_Kenapa_Cewek_Baik_Ditinggalin", status: "ACTIVE", type: "image" },
        { id: "120238442910900464", name: "DF_V2_Video_Gaby_Dari_Dibuang_Jadi_Dikejar", status: "ACTIVE", type: "video" },
        // V3 batch — 10 new angles
        { id: "120238444450310464", name: "DF_V3_Kenapa_Dipilih_Terakhir", status: "ACTIVE", type: "image" },
        { id: "120238444459970464", name: "DF_V3_Satu_Perubahan_Pria_Respect", status: "ACTIVE", type: "image" },
        { id: "120238444465390464", name: "DF_V3_Jangan_Lakukan_Ditinggal", status: "ACTIVE", type: "image" },
        { id: "120238444468150464", name: "DF_V3_Dia_Berubah_Dingin", status: "ACTIVE", type: "image" },
        { id: "120238444471550464", name: "DF_V3_Cantik_Tidak_Cukup", status: "ACTIVE", type: "image" },
        { id: "120238444476160464", name: "DF_V3_Terakhir_Dipilih_V2", status: "ACTIVE", type: "image" },
        { id: "120238444479270464", name: "DF_V3_Respect_V2", status: "ACTIVE", type: "image" },
        { id: "120238444483440464", name: "DF_V3_Kesalahan_Fatal_V2", status: "ACTIVE", type: "image" },
        { id: "120238444488840464", name: "DF_V3_Mendingin_Tiba_V2", status: "ACTIVE", type: "image" },
        { id: "120238444493060464", name: "DF_V3_Sifat_V2_Magnetik", status: "ACTIVE", type: "image" },
        // PAUSED
        { id: "120238243579580464", name: "DF_Drakor_Fantasy_Leading_Man", status: "PAUSED", type: "image" },
        { id: "120238243571690464", name: "DF_NiceGirl_Selalu_Finish_Last", status: "PAUSED", type: "image" },
        { id: "120238243589880464", name: "DF_Video_Gaby_Ditinggal_Jadi_Ditakuti", status: "PAUSED", type: "video" },
        { id: "120238301384020464", name: "SARI HOME", status: "PAUSED", type: "image" },
        { id: "120238243596290464", name: "DF_Video_Rina_Diabaikan_Jadi_Dikagumi", status: "PAUSED", type: "video" },
    ],
};

// ── SINGAPORE / EN CAMPAIGN ──────────────────────────────────
export const DF_CAMPAIGN_EN: CampaignData = {
    id: "120238447944760464",
    name: "DarkFem EN",
    region: "en",
    flag: "🇸🇬",
    label: "Singapore / EN",
    status: "ACTIVE",
    objective: "OUTCOME_SALES",
    startTime: "2026-03-04",
    dailyBudget: 0, // set by user in Ads Manager
    currency: "IDR",
    landingUrl: "https://ai.elvisiongroup.com/darkfeminine?en",
    adsets: [
        { id: "120238447944770464", name: "SG/MY/AU women EN", status: "ACTIVE", optimizationGoal: "OFFSITE_CONVERSIONS", billingEvent: "IMPRESSIONS", startTime: "2026-03-04" },
    ],
    ads: [
        { id: "EN_01", name: "DF_EN_Image_01_Paradox", status: "ACTIVE", type: "image" },
        { id: "EN_02", name: "DF_EN_Image_02_2AMScroll", status: "ACTIVE", type: "image" },
        { id: "EN_03", name: "DF_EN_Image_03_NiceGirlFuneral", status: "ACTIVE", type: "image" },
        { id: "EN_04", name: "DF_EN_Image_04_TheSecret", status: "ACTIVE", type: "image" },
        { id: "EN_05", name: "DF_EN_Image_05_TherapistTrap", status: "ACTIVE", type: "image" },
        { id: "EN_06", name: "DF_EN_Image_06_Comparison", status: "ACTIVE", type: "image" },
        { id: "EN_07", name: "DF_EN_Image_07_FuckboyCycle", status: "ACTIVE", type: "image" },
        { id: "EN_08", name: "DF_EN_Image_08_FantasyScreen", status: "ACTIVE", type: "image" },
        { id: "EN_09", name: "DF_EN_Image_09_WakeUpCall", status: "ACTIVE", type: "image" },
        { id: "EN_10", name: "DF_EN_Image_10_SocietyLie", status: "ACTIVE", type: "image" },
    ],
};

// ── PHILIPPINES CAMPAIGN ─────────────────────────────────────
export const DF_CAMPAIGN_PH: CampaignData = {
    id: "120238448144700464",
    name: "DarkFem PH",
    region: "ph",
    flag: "🇵🇭",
    label: "Philippines",
    status: "ACTIVE",
    objective: "OUTCOME_SALES",
    startTime: "2026-03-04",
    dailyBudget: 0,
    currency: "IDR",
    landingUrl: "https://ai.elvisiongroup.com/darkfeminine?ph",
    adsets: [
        { id: "120238448144710464", name: "PH women Tagalog", status: "ACTIVE", optimizationGoal: "OFFSITE_CONVERSIONS", billingEvent: "IMPRESSIONS", startTime: "2026-03-04" },
    ],
    ads: [
        { id: "PH_01", name: "DF_PH_Image_01_Paradox", status: "ACTIVE", type: "image" },
        { id: "PH_03", name: "DF_PH_Image_03_NiceGirl", status: "ACTIVE", type: "image" },
        { id: "PH_04", name: "DF_PH_Image_04_Friendzone", status: "ACTIVE", type: "image" },
        { id: "PH_05", name: "DF_PH_Image_05_Comparison", status: "ACTIVE", type: "image" },
        { id: "PH_06", name: "DF_PH_Image_06_Ghosted", status: "ACTIVE", type: "image" },
        { id: "PH_07", name: "DF_PH_Image_07_KDrama", status: "ACTIVE", type: "image" },
        { id: "PH_08", name: "DF_PH_Image_08_Secret", status: "ACTIVE", type: "image" },
        { id: "PH_09", name: "DF_PH_Image_09_WakeUp", status: "ACTIVE", type: "image" },
        { id: "PH_10", name: "DF_PH_Image_10_SocietyLie", status: "ACTIVE", type: "image" },
    ],
};

// All campaigns, ordered
export const DF_ALL_CAMPAIGNS: CampaignData[] = [DF_CAMPAIGN_ID, DF_CAMPAIGN_EN, DF_CAMPAIGN_PH];

// ── Legacy: DF_INSIGHTS (used by DarkFeminineInstagram) ──────
// Indonesia campaign aggregate data (last fetched 2026-03-03)
export const DF_INSIGHTS: Record<DateRange, {
    spend: number; impressions: number; clicks: number;
    reach: number; ctr: number; cpc: number; cpm: number;
    purchases: number; roas: number;
    landingPageViews: number; videoViews: number;
}> = {
    today: {
        spend: 134460, impressions: 1169, clicks: 61, reach: 1008,
        ctr: 5.22, cpc: 2204, cpm: 115021, purchases: 3, roas: 4.81,
        landingPageViews: 0, videoViews: 0,
    },
    yesterday: {
        spend: 84827, impressions: 809, clicks: 43, reach: 749,
        ctr: 5.32, cpc: 1973, cpm: 104854, purchases: 1, roas: 2.94,
        landingPageViews: 0, videoViews: 0,
    },
    last_7d: {
        spend: 381896, impressions: 3558, clicks: 207, reach: 2914,
        ctr: 5.82, cpc: 1845, cpm: 107334, purchases: 2, roas: 1.17,
        landingPageViews: 83, videoViews: 22,
    },
    last_30d: {
        spend: 381896, impressions: 3558, clicks: 207, reach: 2914,
        ctr: 5.82, cpc: 1845, cpm: 107334, purchases: 2, roas: 1.17,
        landingPageViews: 83, videoViews: 22,
    },
};

// ── Legacy aliases (backward compat for existing useDarkFemLive) ──
export const DF_CAMPAIGN = {
    id: DF_CAMPAIGN_ID.id,
    name: DF_CAMPAIGN_ID.name,
    status: DF_CAMPAIGN_ID.status,
    objective: DF_CAMPAIGN_ID.objective,
    startTime: DF_CAMPAIGN_ID.startTime,
    dailyBudget: DF_CAMPAIGN_ID.dailyBudget,
};
export const DF_ADSETS = DF_CAMPAIGN_ID.adsets;

// Daily spend/click breakdown (ID campaign — active days from campaign start)
export const DF_DAILY = [
    { date: "Feb 26", spend: 71993, clicks: 32, impressions: 535, reach: 463, ctr: 5.98 },
    { date: "Feb 27", spend: 100378, clicks: 59, impressions: 924, reach: 794, ctr: 6.39 },
    { date: "Feb 28", spend: 59963, clicks: 35, impressions: 614, reach: 607, ctr: 5.70 },
    { date: "Mar 01", spend: 64735, clicks: 38, impressions: 676, reach: 661, ctr: 5.62 },
    { date: "Mar 02", spend: 84827, clicks: 43, impressions: 809, reach: 749, ctr: 5.32 },
    { date: "Mar 03", spend: 134460, clicks: 61, impressions: 1169, reach: 1008, ctr: 5.22 },
];

// Instagram — @elreyzandra
export const DF_INSTAGRAM = {
    id: "17841400529912607",
    username: "elreyzandra",
    name: "eL Reyzandra",
    followers: 96904,
    mediaCount: 17,
    biography: "🌐 Exporting Globally Business\n🚀 No.1 Businesses Support Backend\n🧠 Engineer of Human Subconscious\n🔓 Unlocking Your Invisible Blocks",
    profilePicture: "https://scontent.fcgk33-1.fna.fbcdn.net/v/t51.82787-15/588560496_18542710699017664_3029099979076785742_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=7d201b&_nc_ohc=Ez6FeGrkpqYQ7kNvwGRxtrs&_nc_oc=Adn4QF5dQdwcv-A3KsdvhcrGw8IzAiA0xY3JTRc-6swA9QJ5Sll6wHE8X2H_kZ0ZnlXIXMvlmSXoI3uwE-ynnMwD&_nc_zt=23&_nc_ht=scontent.fcgk33-1.fna&edm=AL-3X8kEAAAA&_nc_gid=upkWe9Wn7lRIC9rS6YyIIw&oh=00_AfwDfWdH9eWLJcfIezJkEnJxzcv1KBcaTWsQIoydldNAnw&oe=69ACBD4B",
};
