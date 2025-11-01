# Fix "Failed to fetch" on consty-build-flow.vercel.app

## Problem
Environment variables aren't set in your Vercel deployment.

## Fix (2 minutes):

1. Go to: https://vercel.com/dashboard
2. Click: `consty-build-flow` project
3. Go to: Settings → Environment Variables
4. Add these:
   - Name: `VITE_SUPABASE_URL`
     Value: `https://jkzxdvyjhljzvuydnbap.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenhkdnlqaGxqenZ1eWRuYmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NzQ1OTQsImV4cCI6MjA3NjQ1MDU5NH0.p0Z2wjP7t8_NiMfa5tATVyfVSf_VuLfQNMY0LSo-G-4`
5. Save
6. Go to: Deployments tab
7. Click: 3 dots on latest deployment → Redeploy

Done! Your login will work.




