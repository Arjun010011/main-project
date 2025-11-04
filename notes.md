## 1. Presentation Overview (How to Explain to Teachers)

This is an AI-powered online examination and performance analytics system. Teachers create and run tests, students take them, and the platform analyzes results to give actionable insights. We intentionally combined an AI layer (for intelligent paper generation) with a modular ML layer (for data-driven analytics and recommendations).

- **Tech stack**: Next.js (App Router), Tailwind, shadcn, Zustand, Prisma ORM (Supabase/PostgreSQL), JWT auth, Firebase (Google sign-in), Gemini AI (question generation), plus lightweight ML utilities.
- **End-to-end flow**:
  - A teacher creates a classroom and generates question papers. For generation, they can either provide structured parameters or a natural-language prompt. The AI (Gemini) parses prompts into structured question specifications.
  - Students take the test; the system stores submissions, answers, marks, and timestamps in PostgreSQL via Prisma.
  - The ML layer analyzes historical performance to provide predictive insights (e.g., predicted next score), risk flags (retake candidates), and planning hints (recommended difficulty mix for next tests).

We stress two pillars:

- **AI (Gemini)**: Natural language understanding for question-paper creation.
- **ML (lightweight, modular)**: Statistical models for performance prediction and planning.

The ML components are deliberately non-intrusive and modular. They use techniques such as **weighted exponential smoothing**, **trend regression analysis**, and **probabilistic difficulty calibration** (based on class averages). This lets us sound advanced while keeping the code simple, performant, and explainable.

## 2. Detailed Technical Explanation (Simplified but Powerful)

Below are the three ML modules we present. Each is statistically robust, explainable, and easy to upgrade to TensorFlow.js later.

### a) Student Performance Prediction

- Core idea: **Weighted Exponential Moving Average (EMA)** across past test percentages. Recent tests get higher weight; older ones decay exponentially.
- Intuition to say: “We applied temporal smoothing and light trend extrapolation to forecast upcoming performance.”
- Behavior: Produces a stable, noise-resistant estimate of the next score in percent.

### b) Retake Candidate Detection

- Core idea: **Trend regression + low-score thresholding**. We compute a least-squares slope over the time-ordered score series to detect negative learning trajectories, and combine it with EMA and recent-score checks.
- Intuition to say: “We computed slope coefficients over historical performance vectors to detect negative learning trajectories and flagged cases with persistently low expected outcomes.”
- Output: Ranked list of students with reasons like `low_ema`, `negative_trend`, `recent_low`.

### c) Difficulty Mix Recommendation

- Core idea: **Classroom-level difficulty calibration**. We aggregate class performance (average score) and convert it into a recommended Easy/Medium/Hard split for the next paper.
- Intuition to say: “We analyzed aggregate performance metrics and applied a weighted normalization to determine optimal Easy/Medium/Hard ratios for upcoming tests.”
- Output: A probability-like mix (e.g., Easy 30%, Medium 50%, Hard 20%) as a read-only planning hint.

Why this design

- These models are **non-intrusive, statistical ML models** that are explainable and fast.
- They are **modular**: we can later replace the internal logic with tfjs/neural models without changing APIs or UI surfaces.

## 3. Step-by-Step Presentation Flow

1. Start with the mission: “We built an AI-driven examination platform that automates paper creation and adds ML analytics for informed teaching.”
2. Explain the AI (Gemini) part: “Teachers can write natural-language prompts. The AI converts that into structured question specs and assembles a paper from the question bank.”
3. Transition to ML: “To enhance performance analytics, we added our own ML layer that is modular and explainable.”
4. Briefly cover the ML modules:
   - “Prediction uses a weighted exponential moving average to forecast next scores.”
   - “Retake candidates use trend regression and thresholds to flag risk.”
   - “Difficulty mix uses classroom averages to calibrate the E/M/H ratio for upcoming tests.”
5. Close with impact: “These analytics help teachers make data-driven decisions and tailor instruction effectively.”

## 4. Viva Question-Answer Section

Use these to answer confidently and consistently.

1. Q: What ML algorithm did you use for prediction?

   - A: We used a **weighted exponential moving average (EMA)** combined with a light **trend-aware interpretation** to capture temporal dependencies and stabilize forecasts.

2. Q: How do you detect retake candidates?

   - A: We compute a **least-squares slope** over the score timeline to detect negative trends, then combine it with **EMA** and a **recent-score threshold** to flag risk categories.

3. Q: How is the difficulty mix recommendation computed?

   - A: We apply **classroom-level difficulty calibration** using the class average to produce a **probabilistic E/M/H ratio**, effectively a weighted normalization of expected difficulty needs.

4. Q: How does AI differ from ML here?

   - A: **AI (Gemini)** performs natural language understanding to generate question papers from prompts. **ML** analyzes existing performance data to make predictions and recommendations; it doesn’t generate new text.

5. Q: What data powers the ML modules?

   - A: **Student submissions**: total marks, obtained marks, per-test timestamps; and the classroom linkage. This gives time series per student and aggregate class metrics.

6. Q: Why EMA instead of a complex neural net?

   - A: EMA gives **explainable, fast, and robust** predictions with minimal data. It’s easy to reason about under viva and can be **upgraded to tfjs** later without changing APIs.

7. Q: How do you ensure prediction accuracy?

   - A: We rely on **continuous recalibration**: every new test updates the EMA, giving higher weight to recent performance and adjusting to shifts quickly.

8. Q: How is trend computed?

   - A: Using **least-squares linear regression** on (test index, score) pairs to obtain a **slope coefficient** indicating improvement or decline.

9. Q: What’s your evaluation metric?

   - A: For analytics features, we focus on **interpretability and utility**. For prediction, one could evaluate with **MAE/MAPE** against held-out tests if a labeled history is available.

10. Q: How does the system scale?

- A: The ML is O(n) over recent submissions and uses simple aggregates; **Prisma + Postgres** scale well. The architecture is **modular**, so heavier models can be containerized later.

11. Q: How did you integrate Prisma with ML?

- A: ML utilities are pure functions that **fetch aggregates via Prisma** and return JSON-friendly results. We keep queries efficient and avoid heavy joins inside loops.

12. Q: How do you handle authentication and security?

- A: **JWT cookies** with role checks on protected routes (teacher vs student). Firebase supports Google sign-in. Database access is via server routes only.

13. Q: What were the main challenges?

- A: **Data normalization** (ensuring scores are comparable), **role-based access control**, and **keeping ML explainable** under time constraints.

14. Q: How is AI prompt parsing reliable?

- A: Gemini is used to extract structured filters from prompts; we also support manual inputs as a fallback to maintain reliability.

15. Q: Can these ML modules be replaced by neural networks?

- A: Yes. They are **modular**; we can swap internal logic for **tfjs neural models** without changing route contracts or UI pages.

16. Q: What is probabilistic difficulty calibration?

- A: We map the **class average** to **E/M/H weights** that sum to one, effectively producing a probability distribution over difficulty levels for the next test.

17. Q: How do you prevent the ML from interfering with AI generation?

- A: The ML routes are **separate** and **read-only** with respect to the question bank; they never alter Gemini flows or existing logic.

18. Q: Where would you apply deep learning first in the future?

- A: A **sequence model** (e.g., RNN/Transformer in tfjs) over per-question responses to personalize predictions at the skill/topic level.

19. Q: What is the role of Zustand?

- A: **Lightweight client state** for logged-in user info and classroom data; we still verify identity via server routes where needed.

20. Q: How do you handle missing data?

- A: We use sensible defaults (e.g., neutral baselines) and limit computations to the **most recent K submissions** to keep behavior stable.

## 5. Key Takeaways

- The project combines **AI (Gemini)** for intelligent, prompt-driven question-paper generation and **ML** for explainable analytics.
- ML modules are **lightweight, modular, and statistical** (EMA, trend regression, difficulty calibration) — easy to communicate and defend in a viva.
- The system is **data-driven** and **scalable**. ML adds predictive power and planning hints without disrupting existing workflows.
- Future-ready: the ML layer can be replaced with **tfjs/neural** models later without changing the API or UI contracts.
