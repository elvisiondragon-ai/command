# Avatar Scraper Intelligence - technical Flow

This document outlines the end-to-end flow of the Avatar feature when used through the UI.

## 1. Initialization (Front-end)
- **User Input**: User selects parameters (Category, Price Range, Platforms, Demographics).
- **Trigger**: Click "Generate Angles".
- **Action**: `avatar.tsx` calls `supabase.functions.invoke('avatar-generate', { action: 'start', config: ... })`.

## 2. Session creation (Edge Function)
- **Table**: `avatar-sessions`
- **Logic**: A new record is created with `status: 'pending'` and the provided configuration.
- **Response**: Returns `sessionId` back to the frontend immediately.

## 3. Realtime Subscription (Front-end)
- **Action**: Frontend subscribes to Supabase Realtime for the `avatar-stream` table, filtered by `session_id`.
- **UI Update**: As new data arrives in the stream, the UI displays progress (comments found, avatars generated).

## 4. Background Processing (Edge Function)
- **Phase A: Scraping**: 
    - Function scrapes data from selected platforms.
    - Each finding is inserted into `avatar-stream` (type: 'comment').
- **Phase B: Analysis**:
    - Function sends scraped data to Claude AI.
    - Generated avatars are inserted into `avatar-stream` (type: 'avatar').
- **Phase C: Finalize**:
    - Session status in `avatar-sessions` is updated to `done`.
    - All final data is saved in the session record.

## 5. UI completion (Front-end)
- **Action**: Frontend polls/detects `status: 'done'`.
- **Action**: Displays the final 50/100 Avatar Angle cards.
- **Action**: Enables the "Find Best Product Angle" button.

## 6. Product Angle Refinement
- **Trigger**: Click "Find Best Product Angle".
- **Action**: calls `avatar-generate` with `action: 'find-best-angle'`.
- **Logic**: Edge function uses Claude to analyze the existing avatars and returns the top 3 strongest market angles.
- **Storage**: Results are saved to the `product_angles` column in `avatar-sessions`.

---

> [!IMPORTANT]
> **Deployment Note**:
> I have written the code, but you must run the following command in your terminal to make the function live:
> `supabase functions deploy avatar-generate`
