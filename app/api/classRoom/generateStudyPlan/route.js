import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const horizonDays = Number(searchParams.get("days") || 14);
    
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

    // Pull last N submissions - reduced from 10 to 5 for faster processing
    const submissions = await prisma.submission.findMany({
      where: classroomId
        ? { studentId, questionPaper: { classroomId } }
        : { studentId },
      include: {
        questionPaper: { include: { questions: { include: { question: true } } } },
      },
      orderBy: { submittedAt: "desc" },
      take: 5, // Reduced from 10
    });

    // Aggregate performance data more efficiently
    const subjectStats = new Map();
    const chapterWeakness = [];
    
    for (const s of submissions) {
      const answers = Array.isArray(s.answers) ? s.answers : [];
      const qpqById = new Map(s.questionPaper.questions.map((qpq) => [qpq.id, qpq]));
      
      for (const ans of answers) {
        const qpq = qpqById.get(ans.questionPaperQuestionId);
        if (!qpq?.question) continue;
        
        const subject = qpq.question.Subject || "Unknown";
        const chapter = qpq.question.Chapter || "General";
        
        if (!subjectStats.has(subject)) {
          subjectStats.set(subject, { correct: 0, total: 0 });
        }
        const stats = subjectStats.get(subject);
        stats.total++;
        if (ans.isCorrect) stats.correct++;
        
        if (!ans.isCorrect) {
          chapterWeakness.push({ subject, chapter, difficulty: qpq.question.Difficulty });
        }
      }
    }

    // Create concise summary instead of full history
    const performanceSummary = {
      subjectPerformance: Array.from(subjectStats.entries()).map(([subject, stats]) => ({
        subject,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        questionsAttempted: stats.total,
      })),
      weakChapters: chapterWeakness.slice(0, 10), // Top 10 weak areas
      recentTests: submissions.length,
      avgScore: submissions.length > 0 
        ? Math.round(submissions.reduce((sum, s) => sum + (s.totalMarksObtained / Math.max(1, s.totalMarks) * 100), 0) / submissions.length)
        : 0,
    };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp", // Faster model
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048, // Limit output length
      }
    });

    // Optimized, more focused prompt
    const prompt = `Create a concise ${horizonDays}-day KCET study plan based on this student's performance:

Performance Summary:
${JSON.stringify(performanceSummary, null, 2)}

Requirements:
- Focus on weak chapters: ${chapterWeakness.slice(0, 5).map(w => `${w.subject}-${w.chapter}`).join(", ")}
- Include 2-3 hours daily study time
- Mix difficulty levels progressively
- Keep it actionable and brief

IMPORTANT: Output ONLY clean HTML with Tailwind classes. Do NOT wrap in markdown code blocks or backticks.

Structure (use these exact classes):

<div class="mb-8">
  <div class="flex items-center gap-2 mb-4">
    <div class="w-1 h-8 bg-purple-500 rounded"></div>
    <h3 class="text-2xl font-bold text-purple-700 dark:text-purple-300">📊 Performance Overview</h3>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-purple-100 dark:border-purple-900">
    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">Brief analysis of strengths and weaknesses. Mention overall average score and key focus areas.</p>
  </div>
</div>

<div class="mb-8">
  <div class="flex items-center gap-2 mb-4">
    <div class="w-1 h-8 bg-purple-500 rounded"></div>
    <h3 class="text-2xl font-bold text-purple-700 dark:text-purple-300">📅 Your 14-Day Plan</h3>
  </div>
  <div class="space-y-3">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-purple-400 hover:shadow-md transition-shadow">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center font-bold text-purple-700 dark:text-purple-300">1</div>
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">Subject - Chapter Name (Difficulty)</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">Specific topics to cover and study approach. Duration: 2-3 hours</p>
        </div>
      </div>
    </div>
    <!-- Repeat similar structure for all ${horizonDays} days with varying border colors: purple-400, pink-400, blue-400 -->
  </div>
</div>

<div class="mb-8">
  <div class="flex items-center gap-2 mb-4">
    <div class="w-1 h-8 bg-purple-500 rounded"></div>
    <h3 class="text-2xl font-bold text-purple-700 dark:text-purple-300">📚 Essential Resources</h3>
  </div>
  <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900 rounded-lg p-5 shadow-sm">
    <ul class="space-y-3">
      <li class="flex items-start gap-3">
        <span class="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
        <span class="text-gray-700 dark:text-gray-300">Resource recommendation 1</span>
      </li>
      <!-- Add 3-4 more resources -->
    </ul>
  </div>
</div>

<div class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
  <p class="text-sm text-gray-700 dark:text-gray-300 text-center"><strong>💡 Pro Tip:</strong> A motivational tip for success</p>
</div>

Keep total response under 1500 words. Use emojis sparingly. Make each day card visually distinct. Be specific and practical.`;

    // Stream the response
    const result = await model.generateContentStream(prompt);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating study plan:", error);
    return NextResponse.json({ error: "Failed to generate study plan" }, { status: 500 });
  }
}