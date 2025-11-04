## AI-Powered Online Examination and Performance Analytics System

Next.js App Router + Prisma (Supabase/PostgreSQL) + Tailwind + shadcn + Zustand.

This README documents the core features and the newly added ML features, their APIs, and where the UI surfaces live. Existing Gemini-based features remain untouched.

### Tech Stack

- Frontend: Next.js (App Router), Tailwind, shadcn UI, Zustand
- Backend: Next.js route handlers (app/api)
- DB: Supabase (PostgreSQL) via Prisma ORM
- Auth: JWT cookies (student/teacher); Google via Firebase
- AI: Gemini API (existing routes)
- ML: Lightweight statistical/EMA methods; extensible to TensorFlow.js

---

## Environment

Required environment variables (examples):

- DATABASE_URL, DIRECT_URL (PostgreSQL)
- JWT_SECRET
- GEMINI_KEY (existing Gemini integrations)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_ANON_KEY

Run locally:

```bash
npm i
npx prisma generate
npm run dev
```

---

## Database Schema (Prisma)

Core models: `Teacher`, `Student`, `Classroom`, `Questions`, `QuestionPaper`, `QuestionPaperQuestion`, `Submission`, `Analytics`.

Optional ML column:

```startLine:endLine:prisma/schema.prisma
model Questions {
  id                    BigInt                  @id @default(autoincrement())
  created_at            DateTime                @default(now()) @db.Timestamptz(6)
  Subject               String?
  Difficulty            String?
  difficultyML          String?
  Question              String?
  Option_A              String?
  Option_B              String?
  Option_C              String?
  Option_D              String?
  Correct_Answer        String?
  Explanation           String?
  Chapter               String?
  QuestionPaperQuestion QuestionPaperQuestion[]
}
```

Note: `difficultyML` is optional and only used by ML labeling when enabled.

---

## Existing Key Features (unchanged)

### Authentication

- Email/password JWT cookies for students and teachers
- Google via Firebase (config at `lib/firebase.js`)

### Classrooms, Papers, Live Tests

- Create, fetch, and manage question papers
- Move papers to live tests

Important handlers (examples):

```startLine:endLine:app/api/classRoom/question_generation/route.js
export async function POST(req) {
  // Uses Gemini to parse prompt → topic/difficulty/subject JSON, then samples
  // matching questions from the Questions table and creates a QuestionPaper.
}
```

```startLine:endLine:app/(auth)/(private)/teacherDashboard/[classroomId]/createQuesitonPaper/page.jsx
// UI to configure subjects/difficulty/count and submit to question_generation
```

---

## Newly Added ML Features

All ML features are modular and additive under `app/api/ml/*` and `lib/ml/*`. They avoid existing Gemini logic.

### 1) Student Performance Prediction

- Predicts a student’s next test score (EMA over past percentages).
- API: GET `/api/ml/predictPerformance?studentId=...&classroomId=...`
- Util: `lib/ml/predictPerformance.js`
- UI: Teacher page `teacherDashboard/[classroomId]/predictions`

Code:

```startLine:endLine:lib/ml/predictPerformance.js
export async function predictNextScore({ studentId, classroomId }) {
  const submissions = await prisma.submission.findMany({ /* ... */ });
  const alpha = 0.5; // EMA smoothing
  let ema = null;
  for (const sub of submissions) {
    const pct = (sub.totalMarksObtained / Math.max(1, sub.totalMarks)) * 100;
    ema = ema == null ? pct : alpha * pct + (1 - alpha) * ema;
  }
  return Math.round(Math.max(0, Math.min(100, ema ?? 70)) * 100) / 100;
}
```

```startLine:endLine:app/api/ml/predictPerformance/route.js
export async function GET(request) {
  // Validates query, calls predictNextScore, returns JSON { predictedScore }
}
```

```startLine:endLine:app/(auth)/(private)/teacherDashboard/[classroomId]/predictions/page.jsx
// Fetches class students then calls /api/ml/predictPerformance per student
// Renders a table with predicted next score per student
```

### 2) Retake Candidates (Risk Identification)

- Flags students likely needing a retake based on low EMA, negative trend, and recent score.
- API: GET `/api/ml/retakeCandidates?classroomId=...&max=50` (teacher-auth required)
- Util: `lib/ml/retakeCandidates.js`
- UI: Teacher page `teacherDashboard/[classroomId]/retakeCandidates` with sidebar link

Code:

```startLine:endLine:lib/ml/retakeCandidates.js
export async function findRetakeCandidates({ classroomId, maxStudents = 50 }) {
  // Computes EMA and least-squares slope per student; returns sorted risk list
}
```

```startLine:endLine:app/api/ml/retakeCandidates/route.js
export async function GET(request) {
  // Teacher cookie auth → call findRetakeCandidates → JSON list with reasons
}
```

```startLine:endLine:app/(auth)/(private)/teacherDashboard/[classroomId]/retakeCandidates/page.jsx
// Renders table of candidates with EMA, trend slope, last score, and reasons
```

### 3) Difficulty Mix Recommendation (Paper Design Hint)

- Recommends Easy/Medium/Hard distribution for the next paper based on class average.
- API: GET `/api/ml/difficultyMix?classroomId=...` (teacher-auth required)
- Util: `lib/ml/difficultyMix.js`
- UI: Hint card on `teacherDashboard/[classroomId]/createQuesitonPaper`

Code:

```startLine:endLine:lib/ml/difficultyMix.js
export async function recommendDifficultyMix({ classroomId }) {
  // Returns { Easy, Medium, Hard, average } proportions from class avg score
}
```

```startLine:endLine:app/api/ml/difficultyMix/route.js
export async function GET(request) {
  // Teacher cookie auth → call recommendDifficultyMix → return JSON
}
```

```startLine:endLine:app/(auth)/(private)/teacherDashboard/[classroomId]/createQuesitonPaper/page.jsx
// Displays read-only hint card with the recommended mix above the form
```

---

## Supporting Auth Helper

Student identity endpoint for client fallback:

```startLine:endLine:app/api/auth/meStudent/route.js
export async function GET(request) {
  // Verifies studentToken and returns { id, email, fullName, image }
}
```

---

## Testing the ML APIs

Performance Prediction:

```bash
curl "http://localhost:3000/api/ml/predictPerformance?studentId=STUDENT_ID&classroomId=CLASS_ID"
```

Retake Candidates:

```bash
curl "http://localhost:3000/api/ml/retakeCandidates?classroomId=CLASS_ID&max=25" \
  --cookie "teacherToken=..."
```

Difficulty Mix:

```bash
curl "http://localhost:3000/api/ml/difficultyMix?classroomId=CLASS_ID" \
  --cookie "teacherToken=..."
```

---

## Notes

- The ML features are designed to be lightweight and non-invasive.
- No existing Gemini-based routes or logic were modified.
- You can later replace the internal heuristics with TensorFlow.js models inside `lib/ml/*` without changing the API contracts or UI surfaces.
