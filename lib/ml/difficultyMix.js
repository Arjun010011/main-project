import prisma from "@/lib/prisma";

// Recommend an E/M/H mix for next paper based on class average
export async function recommendDifficultyMix({ classroomId }) {
  const submissions = await prisma.submission.findMany({
    where: { questionPaper: { classroomId, status: "completed" } },
    select: { totalMarks: true, totalMarksObtained: true },
  });
  if (submissions.length === 0) {
    return baseline();
  }
  const pcts = submissions.map((s) => (s.totalMarksObtained / Math.max(1, s.totalMarks)) * 100);
  const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
  if (avg < 60) return { Easy: 0.6, Medium: 0.3, Hard: 0.1, average: round2(avg) };
  if (avg > 85) return { Easy: 0.2, Medium: 0.5, Hard: 0.3, average: round2(avg) };
  return { Easy: 0.3, Medium: 0.5, Hard: 0.2, average: round2(avg) };
}

function baseline() {
  return { Easy: 0.3, Medium: 0.5, Hard: 0.2, average: null };
}

function round2(n) { return Math.round(n * 100) / 100; }


