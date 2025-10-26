import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Ensure BigInt serializes for JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Recommend practice questions focused on student's weak areas
// GET /api/classRoom/recommendPractice?classroomId=...&limit=20
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const limitParam = Number(searchParams.get("limit") || 20);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;

    // Auth: students only
    const studentToken = request.cookies.get("studentToken")?.value;
    if (!studentToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let studentId;
    try {
      const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
      if (decoded.role !== "student") {
        return NextResponse.json({ error: "Access denied. Students only." }, { status: 403 });
      }
      studentId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    // Fetch student's past submissions (optionally scoped by classroom)
    const submissions = await prisma.submission.findMany({
      where: classroomId
        ? { studentId, questionPaper: { classroomId } }
        : { studentId },
      include: {
        questionPaper: {
          include: {
            questions: { include: { question: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 25,
    });

    // Aggregate weaknesses by subject/chapter/difficulty based on incorrect answers
    const weaknessKeyToCount = new Map();
    const seenQuestionIds = new Set();

    for (const submission of submissions) {
      const answers = Array.isArray(submission.answers) ? submission.answers : [];
      // Map by QuestionPaperQuestion to find metadata
      const qpqById = new Map(
        submission.questionPaper.questions.map((qpq) => [qpq.id, qpq])
      );

      for (const ans of answers) {
        const qpq = qpqById.get(ans.questionPaperQuestionId);
        if (!qpq) continue;
        const q = qpq.question;
        // Track answered questions to avoid recommending repeats
        if (q?.id != null) seenQuestionIds.add(String(q.id));
        if (ans.isCorrect) continue;

        const subject = q?.Subject || "Unknown";
        const chapter = q?.Chapter || "General";
        const difficulty = q?.Difficulty || "Medium";
        const key = `${subject}||${chapter}||${difficulty}`;
        weaknessKeyToCount.set(key, (weaknessKeyToCount.get(key) || 0) + 1);
      }
    }

    // Rank weakest buckets
    const ranked = [...weaknessKeyToCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key]) => key.split("||"));

    // Fallback: if no prior data, recommend a balanced starter set
    const recommendations = [];
    if (ranked.length === 0) {
      const fallbackSubjects = ["Physics", "Chemistry", "Maths"];
      const fallbackDifficulties = ["Easy", "Medium", "Hard"];
      const perBucket = Math.max(1, Math.floor(limit / (fallbackSubjects.length * fallbackDifficulties.length)));

      for (const subject of fallbackSubjects) {
        for (const difficulty of fallbackDifficulties) {
          const rows = await prisma.$queryRawUnsafe(
            `SELECT * FROM "Questions" WHERE "Subject" = $1 AND "Difficulty" = $2 ORDER BY RANDOM() LIMIT $3`,
            subject,
            difficulty,
            perBucket,
          );
          for (const row of rows) {
            if (!seenQuestionIds.has(String(row.id))) recommendations.push(row);
            if (recommendations.length >= limit) break;
          }
          if (recommendations.length >= limit) break;
        }
        if (recommendations.length >= limit) break;
      }
    } else {
      const perBucket = Math.max(1, Math.floor(limit / ranked.length));
      for (const [subject, chapter, difficulty] of ranked) {
        // Prefer chapter-specific, then general
        let rows = [];
        if (chapter && chapter !== "General") {
          rows = await prisma.$queryRawUnsafe(
            `SELECT * FROM "Questions" WHERE "Subject" = $1 AND "Difficulty" = $2 AND "Chapter" ILIKE $3 ORDER BY RANDOM() LIMIT $4`,
            subject,
            difficulty,
            `%${chapter}%`,
            perBucket,
          );
        }
        if (rows.length < perBucket) {
          const remaining = perBucket - rows.length;
          const more = await prisma.$queryRawUnsafe(
            `SELECT * FROM "Questions" WHERE "Subject" = $1 AND "Difficulty" = $2 ORDER BY RANDOM() LIMIT $3`,
            subject,
            difficulty,
            remaining,
          );
          rows = rows.concat(more);
        }

        for (const row of rows) {
          if (!seenQuestionIds.has(String(row.id))) recommendations.push(row);
          if (recommendations.length >= limit) break;
        }
        if (recommendations.length >= limit) break;
      }
    }

    return NextResponse.json({
      count: recommendations.length,
      questions: recommendations,
    });
  } catch (error) {
    console.error("Error recommending practice:", error);
    return NextResponse.json({ error: "Failed to recommend practice" }, { status: 500 });
  }
}





