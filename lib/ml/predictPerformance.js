import prisma from "@/lib/prisma";

// Lightweight regression-style predictor using an exponential moving average of past scores.
// Optionally factors test difficulty mix if available. Returns a percentage.
export async function predictNextScore({ studentId, classroomId }) {
  const submissions = await prisma.submission.findMany({
    where: classroomId
      ? { studentId, questionPaper: { classroomId, status: "completed" } }
      : { studentId },
    include: {
      questionPaper: true,
    },
    orderBy: { submittedAt: "asc" },
    take: 25,
  });

  if (submissions.length === 0) {
    return 70; // neutral baseline
  }

  const alpha = 0.5; // smoothing factor
  let ema = null;
  for (const sub of submissions) {
    const pct = (sub.totalMarksObtained / Math.max(1, sub.totalMarks)) * 100;
    ema = ema == null ? pct : alpha * pct + (1 - alpha) * ema;
  }

  // Clamp to 0..100 and round
  const predicted = Math.max(0, Math.min(100, ema == null ? 70 : ema));
  return Math.round(predicted * 100) / 100;
}


