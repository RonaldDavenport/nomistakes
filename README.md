# No Mistakes

AI builds and runs your entire business.

## Quick Start (Local)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|---|---|
| `/` | Landing page with pricing, waitlist |
| `/wizard` | 4-question business generation wizard |
| `/dashboard` | Business overview with charts |
| `/dashboard/content` | AI-generated blog posts |
| `/dashboard/ads` | Ad campaigns (Meta, TikTok) |
| `/dashboard/analytics` | Traffic, SEO, keywords |
| `/dashboard/chat` | AI business manager chat |
| `/api/waitlist` | POST — email waitlist signup |
| `/api/generate` | POST — business concept generation |

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Vercel auto-detects Next.js — click Deploy
5. Done. You get a live `.vercel.app` URL

### Environment Variables (for production)

When you're ready to connect Claude API for real concept generation:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **TypeScript**
- **Vercel** (deployment target)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + theme
│   ├── wizard/page.tsx       # Wizard flow
│   ├── dashboard/
│   │   ├── layout.tsx        # Sidebar layout
│   │   ├── page.tsx          # Dashboard home
│   │   ├── content/page.tsx  # Content manager
│   │   ├── ads/page.tsx      # Ad campaigns
│   │   ├── analytics/page.tsx# Analytics
│   │   └── chat/page.tsx     # AI chat
│   └── api/
│       ├── waitlist/route.ts # Waitlist endpoint
│       └── generate/route.ts # Concept generator
├── components/
│   ├── Navbar.tsx            # Main navigation
│   └── WaitlistForm.tsx      # Email signup form
└── lib/
    └── wizard-data.ts        # Business concepts + scoring
```
