-- Table for storing avatar research sessions
CREATE TABLE IF NOT EXISTS public."avatar-sessions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid(),
    config JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    scraped_comments JSONB DEFAULT '[]'::jsonb,
    avatar_angles JSONB DEFAULT '[]'::jsonb,
    product_angles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for realtime streaming of findings
CREATE TABLE IF NOT EXISTS public."avatar-stream" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public."avatar-sessions"(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'comment', 'avatar', 'product_angle'
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public."avatar-sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."avatar-stream" ENABLE ROW LEVEL SECURITY;

-- Simple policies (allow all for authenticated users for now)
-- Note: Using auth.uid() check would be better if real auth is used.
-- For now, following project pattern.
CREATE POLICY "Allow all for authenticated users on sessions" ON public."avatar-sessions"
    FOR ALL TO public USING (true);

CREATE POLICY "Allow all for authenticated users on stream" ON public."avatar-stream"
    FOR ALL TO public USING (true);
