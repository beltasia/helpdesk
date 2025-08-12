# Node.js Help Desk

---

##  Overview

This repository stays in lock-step with your deployed chats on **v0.dev**—any updates you make there get pushed here, and then **Vercel** deploys the latest automatically.

---

##  Live Version

**Project is live at:** [Vercel – Node.js Help Desk](https://vercel.com/mellisas-projects-b938dd2d/v0-node-js-help-desk)  
**Build & edit your app at:** [v0.dev – Node.js Help Desk Project](https://v0.dev/chat/projects/O3yr17if8GV)  
:contentReference[oaicite:0]{index=0}

---

##  How It Works

1. Build or tweak your app in **v0.dev**.  
2. Deploy your chats from the v0 interface.  
3. Changes auto-sync into this GitHub repo.  
4. **Vercel** picks up the latest and updates your live site.  
:contentReference[oaicite:1]{index=1}

---

##  Tech Stack & Structure

- **TypeScript**, **JavaScript**, and **CSS** power the codebase—mostly TypeScript (88%), with CSS (11.5%) and a dash of JavaScript (0.5%)  
:contentReference[oaicite:2]{index=2}
- Typical Next.js project layout:
  - `app/`, `components/`, `lib/`, `styles/`, `public/`
  - Config files like `next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`
  - `package.json` and `pnpm-lock.yaml` for dependency management

---

##  Getting Started

Want to run it locally or contribute? Here’s your game plan:

```bash
git clone https://github.com/beltasia/helpdesk.git
cd helpdesk
pnpm install
pnpm run dev
