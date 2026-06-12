# Project Handover: Crowdsourced FAQ Platform

Welcome to your Crowdsourced FAQ Platform! This document summarizes everything that has been built, the architecture of the monorepo, and the next steps for future development.

## 🏗️ Architecture Overview

The project is built as a **Turborepo** monorepo containing three main applications/packages:

1. **`apps/web` (Next.js 14 App Router)**
   - The primary frontend user interface.
   - Beautiful, modern glassmorphism design with a fully custom design system (`globals.css`).
   - Runs on `http://localhost:3000`.
   - All pages are completely built out (14+ pages) using Client Components.
   - Robust `src/lib/` infrastructure including a centralized `api.ts` client, `AuthContext`, and `ThemeContext`.

2. **`packages/api` (Fastify + Prisma)**
   - The robust backend REST API.
   - Connected to **Supabase PostgreSQL** via Prisma.
   - Runs on `http://127.0.0.1:3001`.
   - Uses `tsx watch` for instant hot-reloading during development.
   - Full suite of API routes (`auth`, `questions`, `answers`, `vote`, `tags`, `search`, `moderation`, `users`, `analytics`, `ai`).

3. **`apps/widget` (Vite + React)**
   - Scaffolding started for the embeddable JS widget framework.
   - Designed to compile down to a single lightweight JavaScript file that customers can embed on their external websites to access your FAQ platform anywhere.

## 🚀 Completed Features (Massive UI Overhaul)

We have successfully built the complete UI and foundation for the platform:

- **Design System**: A massive, fully responsive custom CSS architecture with variables for colors, shadows, gradients, responsive breakpoints, and animations.
- **Centralized Layout**: A responsive Navbar with user menus, notification bells, mobile hamburger drawers, and a bottom tab bar for mobile users.
- **Discovery Feed (`/`)**: Dynamic homepage with search, AI-suggested trending tags, animated question cards, phase badges, and an intuitive "Ask Question" modal.
- **Question Details Page (`/question/[id]`)**: Dynamic routing, isolated "Best Answer" highlighting, Markdown support, upvote/downvote buttons, and content flagging modals.
- **Admin Moderation Dashboard (`/admin`)**: A centralized control panel with tabs for Overview metrics, Flagged Content review, AI Suggestions approval, User management, and Webhook configuration.
- **User Dashboard (`/dashboard`)**: Personalized view with reputation stats, activity streak, phase progression bars, and recent activity timelines.
- **Leaderboard (`/leaderboard`)**: Ranking tables highlighting top community contributors.
- **Topics & Experts (`/topics`, `/experts`)**: Directories to browse the tag cloud and find verified subject matter experts.
- **User Profiles (`/user/[id]`)**: Public profile pages showing user reputation, badges, and their history of questions/answers.
- **Settings & Notifications (`/settings`, `/notifications`)**: Full preferences management and a dedicated notification center for tracking engagements.
- **Auth & Legal Pages**: Sign in, sign up, Privacy Policy, and Terms of Service pages fully structured.

## 🏃‍♂️ How to Run the App

Running the app is incredibly simple thanks to Turborepo.

1. Open your terminal in the root folder (`faq-crowdsource`).
2. Ensure you have the `.env` file correctly configured in `packages/api` (with `DATABASE_URL` and `DIRECT_URL` pointing to your Supabase instance).
3. Run the command:
   ```bash
   npm run dev
   ```
4. Turborepo will start both the Next.js frontend and the Fastify backend simultaneously.
5. Open your browser to `http://localhost:3000`.

## ⏭️ Next Steps & Roadmap

Here are the logical next steps for whoever takes over or continues the project:

1. **Connect the Backend Auth Flow**
   - The UI pages for Sign In/Up exist, and the `AuthContext` uses `api.ts`, but you need to wire up real Supabase Auth or NextAuth on the backend instead of the current mock implementations.
2. **Implement Real-time WebSockets**
   - The Notification UI is built, but currently relies on mock data. Implement Socket.io or Supabase Realtime to push live notifications to the client.
3. **Build the Widget UI (`apps/widget`)**
   - Build a floating chat-bubble style UI in Vite.
   - Point the widget's API fetch requests to `http://127.0.0.1:3001` to pull questions remotely.
4. **AI Auto-Responder Integration**
   - Connect the backend `POST /questions` endpoint to an LLM (like OpenAI or Gemini).
   - Have the AI automatically generate a high-quality answer immediately after a question is asked.
5. **Rich Text Editing**
   - Upgrade the standard `<textarea>` elements to a Markdown WYSIWYG editor like `react-quill` or `tiptap`.
