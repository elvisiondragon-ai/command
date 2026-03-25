import asyncio
import json
import sys
import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from playwright.async_api import async_playwright
from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_POPULAR
from pytrends.request import TrendReq

# Ambil path ke file .env di folder yang sama
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# === KONFIGURASI SUPABASE ===
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nlrgdhpmsittuwiiindq.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY or SUPABASE_KEY == "SERVICE_ROLE_KEY":
    print("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env atau masih placeholder!")
    print("Silahkan masukkan SERVICE_ROLE_KEY Anda ke file: /Users/eldragon/git/el/command/.env")
    print("Format: SUPABASE_SERVICE_ROLE_KEY=your_real_key_here")
    sys.exit(1)

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Supabase connection error: {e}")
    sys.exit(1)

class AvatarBot:
    def __init__(self, session_id, category):
        self.session_id = session_id
        self.category = category

    async def push_status(self, message):
        """Kirim update status proses ke UI secara realtime"""
        data = {
            "session_id": self.session_id,
            "type": "status",
            "payload": {
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
        }
        try:
            supabase.table("avatar-stream").insert(data).execute()
            print(f"📡 [STATUS] {message}")
        except Exception as e:
            print(f"❌ Gagal kirim status update: {e}")

    async def push_to_db(self, platform, comment, engagement=0):
        """Kirim data ke table avatar-stream agar muncul di UI secara realtime"""
        data = {
            "session_id": self.session_id,
            "type": "comment",
            "payload": {
                "platform": platform,
                "comment": comment,
                "engagement_signal": engagement,
                "timestamp": datetime.now().isoformat()
            }
        }
        try:
            supabase.table("avatar-stream").insert(data).execute()
            print(f"✅ [{platform}] Data terkirim")
        except Exception as e:
            print(f"❌ Gagal kirim data: {e}")

    # // --- SCRAPE REDDIT (TANPA API) ---
    async def scrape_reddit(self):
        print("🔍 Memulai Reddit Scraper...")
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
                page = await context.new_page()
                search_url = f"https://www.reddit.com/search/?q={self.category}&type=comment"
                await page.goto(search_url)
                await page.wait_for_timeout(7000)

                # Lebih robust: ambil semua shreddit-comment atau div yang berisi text
                comments = await page.locator("p").all() # Fallback ke paragraph jika selector spesifik gagal
                found = 0
                for c in comments:
                    text = await c.inner_text()
                    if len(text) > 40:
                        await self.push_to_db("Reddit", text.strip(), 10)
                        found += 1
                        if found >= 10: break
                
                if found == 0:
                    print("⚠️ Reddit: No comments found with current selectors.")
                await browser.close()
        except Exception as e:
            print(f"⚠️ Reddit Scraper error: {e}")

    # // --- SCRAPE YOUTUBE (TANPA API) ---
    async def scrape_youtube(self):
        print("🔍 Memulai YouTube Scraper...")
        try:
            downloader = YoutubeCommentDownloader()
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
                page = await context.new_page()
                await page.goto(f"https://www.youtube.com/results?search_query={self.category}+review")
                await page.wait_for_timeout(4000)
                
                # Coba beberapa selector link video
                video_selectors = ["a#video-title", "a#video-title-link", "a.yt-simple-endpoint"]
                video_url = None
                for selector in video_selectors:
                    el = page.locator(selector).first
                    if await el.count() > 0:
                        href = await el.get_attribute("href")
                        if href and "/watch?v=" in href:
                            video_url = f"https://www.youtube.com{href}"
                            break
                
                if video_url:
                    print(f"🎥 Found Video: {video_url}")
                    comments = downloader.get_comments_from_url(video_url, sort_by=SORT_BY_POPULAR)
                    count = 0
                    for comment in comments:
                        if count >= 15: break
                        await self.push_to_db("YouTube", comment['text'], comment['votes'])
                        count += 1
                else:
                    print("⚠️ YouTube: Could not find video link.")
                await browser.close()
        except Exception as e:
            print(f"⚠️ YouTube Scraper error: {e}")

    # // --- SCRAPE TIKTOK (TANPA API) ---
    async def scrape_tiktok(self):
        print("🔍 Memulai TikTok Scraper...")
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
                page = await context.new_page()
                await page.goto(f"https://www.tiktok.com/search/video?q={self.category}")
                await page.wait_for_timeout(7000)

                # Ambil text dari search cards
                elements = await page.locator("div[data-e2e='search-card-video-caption'], div.css-1as6ib8-DivText").all()
                found = 0
                for el in elements:
                    text = await el.inner_text()
                    if text and len(text) > 10:
                        await self.push_to_db("TikTok", text, 50)
                        found += 1
                        if found >= 10: break
                
                if found == 0:
                    print("⚠️ TikTok: No captions found.")
                await browser.close()
        except Exception as e:
            print(f"⚠️ TikTok Scraper error: {e}")

    # // --- SCRAPE GOOGLE TRENDS (TANPA API) ---
    async def scrape_google_trends(self):
        print("🔍 Memulai Google Trends Scraper...")
        try:
            pytrends = TrendReq(hl='id-ID', tz=420)
            pytrends.build_payload([self.category], geo='ID')
            related = pytrends.related_queries()
            
            if self.category in related:
                queries = related[self.category]['top']
                if queries is not None:
                    for _, row in queries.iterrows():
                        await self.push_to_db("GoogleTrends", f"Pencarian populer: {row['query']}", row['value'])
        except Exception as e:
            print(f"⚠️ Google Trends limit/error: {e}")

    async def analyze_avatars(self, comments: list) -> list:
        """Pure Python logic (NO LLM) - Turns best comments into Avatar Angles"""
        if not comments:
            return []
            
        print(f"📊 Aggregating {len(comments)} comments into marketing angles...")
        
        # Sort by engagement (likes/votes)
        def get_engagement(x):
            try:
                return int(x.get('engagement_signal', 0))
            except:
                return 0
                
        sorted_comments = sorted(comments, key=get_engagement, reverse=True)
        
        angles = []
        # Take Top 10 comments and format them as angles for the UI
        top_count = min(len(sorted_comments), 10)
        for i in range(top_count):
            c = sorted_comments[i]
            platform = c.get('platform', 'Search')
            text = str(c.get('comment', ''))
            
            # Simple logic to create a 'Persona Name' from the comment
            name = f"User {platform} - {text[:30]}..."
            
            angles.append({
                "name": name,
                "primaryUrgency": text[:100] + ("..." if len(text) > 100 else ""),
                "emotionalTrigger": "High Engagement",
                "willingnessToPay": "Signal from popularity",
                "platform": platform,
                "overlapPercent": 60 + i, # Mock signal
                "urgencyLevel": "urgent" if get_engagement(c) > 50 else "moderate"
            })
            
        return angles

    # // --- RUNNER ---
    async def run(self):
        print(f"🚀 Memulai Riset untuk: {self.category}")
        await self.push_status(f"Mencari data untuk kategori: {self.category}...")
        
        # 1. Scraping Phase
        await self.push_status("🕵️ Memeriksa Reddit...")
        await self.scrape_reddit()
        
        await self.push_status("🕵️ Mengambil komentar YouTube...")
        await self.scrape_youtube()
        
        await self.push_status("🕵️ Memeriksa TikTok...")
        await self.scrape_tiktok()
        
        await self.push_status("🕵️ Mencari di Google Trends...")
        await self.scrape_google_trends()
        
        # 2. Fetch all comments from DB for this session
        try:
            # ALL data is stored in avatar-stream, not in the session record directly
            res = supabase.table("avatar-stream").select("payload").eq("session_id", self.session_id).eq("type", "comment").execute()
            all_comments = [item['payload'] for item in res.data] if res.data else []
            
            if not all_comments:
                print("⚠️ Tidak ada komentar ditemukan di database. Menggunakan data Fallback.")
                # Fallback to general category info if scraping failed
                all_comments = [{"platform": "System", "comment": f"Analisis awal untuk {self.category}", "engagement_signal": 1}]

            # 3. Aggregation Phase (NO LLM)
            await self.push_status("🧠 Meringkas data menjadi segmentasi Avatar...")
            supabase.table("avatar-sessions").update({"status": "analyzing"}).eq("id", self.session_id).execute()
            avatar_angles = await self.analyze_avatars(all_comments)
            
            # 4. Push Angles to Stream & DB
            print(f"👤 Bot generated {len(avatar_angles)} marketing segments. Pushing to stream...")
            for angle in avatar_angles:
                await self.push_to_db_angle(angle)
            
            # Update session final
            supabase.table("avatar-sessions").update({
                "avatar_angles": avatar_angles,
                "status": "done"
            }).eq("id", self.session_id).execute()
            
            print("🏁 Proses Selesai. Cek UI Anda sekarang.")
            await self.push_status("✅ Riset Selesai! Menampilkan hasil...")
            
        except Exception as e:
            print(f"❌ Gagal update status sesi: {e}")

    async def push_to_db_angle(self, angle):
        """Kirim avatar angle ke stream"""
        data = {
            "session_id": self.session_id,
            "type": "avatar",
            "payload": angle
        }
        try:
            supabase.table("avatar-stream").insert(data).execute()
        except:
            pass

    # // --- SERVICE MODE: WATCHER ---
    @classmethod
    async def run_as_service(cls):
        print("🕵️  Avatar Bot Service started. Watching for 'pending' sessions...")
        while True:
            try:
                # Find the oldest pending session
                res = supabase.table("avatar-sessions").select("*").eq("status", "pending").order("created_at").limit(1).execute()
                if res.data:
                    session = res.data[0]
                    session_id = session['id']
                    config = session['config']
                    category = config.get('category', 'General')
                    
                    print(f"🚀 New session detected! ID: {session_id} | Category: {category}")
                    
                    # mark as scraping immediately to avoid double pick
                    supabase.table("avatar-sessions").update({"status": "scraping"}).eq("id", session_id).execute()
                    
                    bot = cls(session_id, category)
                    await bot.run()
                else:
                    # No pending sessions, wait a bit
                    await asyncio.sleep(5)
            except Exception as e:
                print(f"⚠️ Service error: {e}")
                await asyncio.sleep(10)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Avatar Research Bot")
    parser.add_argument("session_id", nargs="?", help="Specific Session ID to run")
    parser.add_argument("category", nargs="?", help="Category for the specific session")
    parser.add_argument("--service", action="store_true", help="Run as a background listener service")
    
    args = parser.parse_args()
    
    if args.service:
        asyncio.run(AvatarBot.run_as_service())
    elif args.session_id and args.category:
        bot = AvatarBot(args.session_id, args.category)
        asyncio.run(bot.run())
    else:
        print("❌ Error: Provide session_id and category OR use --service")
        sys.exit(1)
