## Architecture Overview

- **Next.js 14 (App Router)** for routing and server APIs.
- **MUI v5** for UI components, **Tailwind** utility classes for minor layout as required.
- **React Query** for server state (applications list).
- **React Hook Form + Zod** for multi-step form validation.
- **LocalStorage** for drafts, notes, chat history, and video progress.

### Key Design Choices
- Combined student and faculty into a single app with routes `/student` and `/faculty`.
- Mocked APIs in `app/api/*` to keep the app self-contained.
- Asia/Kolkata timezone handled via dayjs config.

### Edge Cases
- File type/size validation for uploads.
- Empty, loading, error states across tables and lists.
- Disabled actions during mutation.
- Preview dialog to verify submission.

### Testing
- Jest unit tests for core components.
- Playwright e2e for smoke flows on student and faculty pages.
