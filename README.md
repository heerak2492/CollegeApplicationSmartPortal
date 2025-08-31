# College Application Smart Portal — README

> Updated hand-in with setup, component docs, screenshots list, and completed features.  
> Tech: **React + TypeScript**, **MUI** (Material UI + X Date Pickers), **react-hook-form + zod**, **React Query**, **RTL/Jest**, **dayjs**.

---

## 1) Setup instructions

### Prerequisites

- Node 18+ (recommended LTS)
- Yarn 1.x **or** npm 9+
- Git

### Install & run

```bash
# install deps
yarn

# start dev server
yarn dev

# run tests
yarn test     # all tests (Jest + RTL)
yarn test <pattern>  # single file, e.g. yarn test MultiStepForm.test.tsx
```

## 2) Testing configuration (Jest + RTL)

### Jest config (ESM deps + JSDOM)

Create or update **`jest.config.js`**:

```js
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+.(t|j)sx?$": [
      "babel-jest",
      {
        presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
      },
    ],
  },
  transformIgnorePatterns: [
    // Transpile ESM-only deps we import in components
    "node_modules/(?!(react-markdown|remark-.*|rehype-.*)/)",
  ],
  moduleNameMapper: {
    // CSS/assets stubs if needed
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/$1", // if using "@/..." aliases
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
};
```

## 3) Components documentation

### `ApplicationFormComponent`

- **Purpose**: Multi-step student application wizard (Personal → Education → Program → Documents), validation with `zod`, preview, draft save/resume, and submit.
- **Key libs**: `@mui/material`, `@mui/x-date-pickers/DatePicker` (+`dayjs`), `react-hook-form`, `zod`.
- **Local storage**: `studentApplicationDraft.v2` (for resume banner + discard).
- **Submit**: `POST /api/applications` with a normalized payload.
- **A11y**: Labeled inputs, dialog titles/ids, helper text, keyboardable Selects & DatePicker, snackbars with messages.

---

### `ApplicationsTable`

- **Purpose**: Faculty view for applications: filter, sort (stable), paginate, approve/reject per row with pending spinner.
- **Hooks**: `useApplicationsQuery()` (list), `useUpdateApplicationStatus()` (mutation).
- **A11y**: Semantic `<table>`, MUI `<TableSortLabel>`, named buttons.

**Behavior:**

- Filter matches name/program/status.
- Stable sort implemented via `stableSort` helper.
- Pending state shown with a small `<CircularProgress>`; only the acted row is disabled.

**Testing tips:**

- When mocking hooks in tests, mock the **relative path** in this repo:
  ```ts
  jest.mock("./hooks", () => ({
    useApplicationsQuery: jest.fn(),
    useUpdateApplicationStatus: jest.fn(),
  }));
  ```
- Avoid `jest.spyOn` on ESM getters exported from `./hooks` (can throw “Cannot redefine property”).

---

### `ChatAssistant`

- **Purpose**: Local chat with history drawer, import/export JSON, per-message delete, Markdown rendering via `react-markdown`.
- **Storage**: `chatAssistant.sessions.v1` (most recent 50 sessions).
- **Props**: `onAsk?(promptText, history) => Promise<string>`; when omitted, a canned answer is generated.
- **A11y**: Icon buttons have `aria-label`s, messages use `Avatar` + readable bubbles; typing indicator exposed via `aria-label="Assistant is typing"`.

**Testing tips:**

- Polyfill `scrollIntoView` (done in `jest.setup.ts`).
- Because `react-markdown` is ESM, keep the `transformIgnorePatterns` rule above.

---

### Minor components

- **ProfileCompletenessIndicator**: Linear progress + percentage (0–100), `aria-label="profile completeness"`.
- **DocumentUpload**: Emits uploaded URLs to parent via `onUploaded(urls: string[])`.
- **FacultySearchBar**: Controlled input + submit trigger used for table filtering.

---

## 4) API contract (submit)

**Endpoint:** `POST /api/applications`  
**Body (JSON):**

```json
{
  "applicantFullName": "Heerak J",
  "intendedProgram": "Computer Science",
  "emailAddress": "heerak.jhp@gmail.com",
  "phoneNumber": "9988632222",
  "dateOfBirth": "1994-06-15",
  "highSchoolName": "Central High",
  "gpaScore": 9.1,
  "graduationYear": 2020,
  "intakeSeason": "Fall",
  "hasScholarshipInterest": true,
  "uploadedDocumentUrls": []
}
```

**Response (OK):**

```json
{ "ok": true }
```

On errors, respond `{ "ok": false, "error": "message" }` and the UI will show the error snackbar.

---

## 5) Screenshots of key interfaces

Place these images both light and dark mode under **`/docs`**.

| Screen                                | File (suggested)                                            |
| ------------------------------------- | ----------------------------------------------------------- |
| Application wizard – Personal step    | `docs/lightModeScreenshots/form-personal.png`               |
| Education step                        | `docs/lightModeScreenshots/form-education.png`              |
| Program step                          | `docs/lightModeScreenshots/form-program.png`                |
| Documents step + chips                | `docs/lightModeScreenshots/form-documents.png`              |
| Draft found banner                    | `docs/lightModeScreenshots/form-draft-banner.png`           |
| Preview dialog                        | `docs/lightModeScreenshots/form-preview.png`                |
| Submit success dialog                 | `docs/lightModeScreenshots/form-success.png`                |
| Applications table(Faculty, filtered) | `docs/lightModeScreenshots/faculty-review-table-main.png`   |
| Row status for review                 | `docs/lightModeScreenshots/faculty-review-table-status.png` |
| Chat assistant with history           | `docs/lightModeScreenshots/chat-main.png`                   |
| Chat import/export icons              | `docs/lightModeScreenshots/chat-history.png`                |

| Screen                                | File (suggested)                                           |
| ------------------------------------- | ---------------------------------------------------------- |
| Application wizard – Personal step    | `docs/darkModeScreenshots/form-personal.png`               |
| Education step                        | `docs/darkModeScreenshots/form-education.png`              |
| Program step                          | `docs/darkModeScreenshots/form-program.png`                |
| Documents step + chips                | `docs/darkModeScreenshots/form-documents.png`              |
| Draft found banner                    | `docs/darkModeScreenshots/form-draft-banner.png`           |
| Preview dialog                        | `docs/darkModeScreenshots/form-preview.png`                |
| Submit success dialog                 | `docs/darkModeScreenshots/form-success.png`                |
| Applications table(Faculty, filtered) | `docs/darkModeScreenshots/faculty-review-table-main.png`   |
| Row status for review                 | `docs/darkModeScreenshots/faculty-review-table-status.png` |
| Chat assistant with history           | `docs/darkModeScreenshots/chat-main.png`                   |
| Chat import/export icons              | `docs/darkModeScreenshots/chat-history.png`                |

---

## 6) List of completed features

### Application form

- ✅ 4-step wizard with **zod** validation per step.
- ✅ **DatePicker** with manual typing (`YYYY-MM-DD`) and future dates disabled.
- ✅ **Profile completeness** progress that updates live.
- ✅ **Save draft / Resume draft / Discard** (localStorage).
- ✅ **Preview dialog** of structured values before submission.
- ✅ Client-side **POST** on submit and success dialog + reset.

### Applications table (faculty)

- ✅ Server-backed list via query hook (mockable).
- ✅ **Filter**, **stable sort**, **pagination**.
- ✅ Row-level approve/reject with **pending spinner** and per-row disabling.

### Chat assistant

- ✅ Compose, send, receive (mocked `onAsk` or canned demo).
- ✅ **History drawer** with search, rename, delete, new session.
- ✅ **Import/Export JSON** of sessions.
- ✅ Per-message delete; **Markdown** rendering.

### Testing & DX

- ✅ RTL tests using **fireEvent** and provider wrapper.
- ✅ Jest config for ESM deps (`react-markdown`) and MUI X **LocalizationProvider**.
- ✅ Polyfills for JSDOM quirks (`scrollIntoView`).

---

## 7) Accessibility (A11y) & UX highlights

- **A11y**

  - Semantic MUI components with proper labels & helper text.
  - Keyboard: steppers, selects, dialogs, drawer all keyboard accessible.
  - Visible focus via MUI defaults; color contrast respected.
  - Snackbars announce state changes; buttons have `aria-label`s.

- **UX**
  - Clear step labels and validation right where it’s needed.
  - Progress indicator and draft safety nets.
  - Predictable table interactions (sort indicators, stable rows).
  - Chat affordances (history, import/export, per-message actions).

---

## 8) Project structure (guide)

```
features/
  student/
    ApplicationFormComponent.tsx
    DocumentUpload.tsx
    ProfileCompletenessIndicator.tsx
    schemas.ts
  faculty/
    ApplicationsTable.tsx
    hooks.ts
  chat/
    ChatAssistant.tsx
tests/
  jest.setup.ts
  test-utils.tsx
  MultiStepForm.test.tsx
  ApplicationsTable.test.tsx
  ChatAssistant.test.tsx
docs/
  darkModeScreenshots
  lightModeScreenshots
```
