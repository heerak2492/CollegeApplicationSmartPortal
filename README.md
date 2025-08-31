# College Application Smart Portal

Student and faculty portals built with Next.js 14, TypeScript, MUI v5, React Query, React Hook Form + Zod, Tailwind, Jest, and Playwright.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm start` – start production server
- `npm run lint` – ESLint
- `npm run type-check` – TypeScript
- `npm test` – unit tests (Jest + RTL)
- `npm run e2e` – end-to-end tests (Playwright)

## Environment
Copy `.env.example` to `.env.local` and adjust as needed.

## Features
- Student: multi-step form, PDF upload, profile completeness, AI chat with typing indicator, markdown, history + search, video tutorial with progress, transcript, notes, preview dialog, draft autosave.
- Faculty: sortable/filterable/paginated table, approve/reject actions.
- Global: dark/light theme, accessibility labels, responsive layout.
