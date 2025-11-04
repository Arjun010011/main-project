import prisma from "@/lib/prisma";

// Identify students likely needing a retake based on low EMA and negative trend
export async function findRetakeCandidates({ classroomId, maxStudents = 50 }) {
  const students = await prisma.student.findMany({
    where: { classrooms: { some: { id: classroomId } } },
    include: {
      submissions: {
        where: { questionPaper: { classroomId, status: "completed" } },
        include: { questionPaper: true },
        orderBy: { submittedAt: "asc" },
      },
    },
    take: 2000,
  });

  const results = [];
  for (const s of students) {
    const scores = s.submissions.map((sub) =>
      (sub.totalMarksObtained / Math.max(1, sub.totalMarks)) * 100,
    );
    if (scores.length === 0) continue;

    // Exponential moving average
    const alpha = 0.5;
    let ema = null;
    scores.forEach((sc) => {
      ema = ema == null ? sc : alpha * sc + (1 - alpha) * ema;
    });

    // Simple trend via least-squares slope over index
    const n = scores.length;
    const xs = [...Array(n)].map((_, i) => i + 1);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = scores.reduce((a, b) => a + b, 0) / n;
    let num = 0,
      den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (scores[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    const slope = den === 0 ? 0 : num / den; // score change per test

    const reasons = [];
    if ((ema ?? 100) < 60) reasons.push("low_ema");
    if (slope < -2) reasons.push("negative_trend");
    if (scores[scores.length - 1] < 55) reasons.push("recent_low");

    if (reasons.length > 0) {
      results.push({
        studentId: s.id,
        studentName: s.fullName,
        tests: n,
        ema: ema == null ? null : Math.round(ema * 100) / 100,
        slope: Math.round(slope * 100) / 100,
        lastScore: Math.round(scores[scores.length - 1] * 100) / 100,
        reasons,
      });
    }
  }

  // Sort by highest risk: low ema then steep negative slope then recent low
  results.sort((a, b) => {
    const aRisk = (a.ema ?? 100) + a.slope * -5 + (a.lastScore < 55 ? -10 : 0);
    const bRisk = (b.ema ?? 100) + b.slope * -5 + (b.lastScore < 55 ? -10 : 0);
    return aRisk - bRisk;
  });

  return results.slice(0, maxStudents);
}


