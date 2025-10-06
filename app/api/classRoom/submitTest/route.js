import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
export async function POST(request) {
  try {
    const { questionPaperId, answers } = await request.json();

    // Get the student token from cookies
    const studentToken = request.cookies.get("studentToken")?.value;

    if (!studentToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!questionPaperId || !answers) {
      return NextResponse.json(
        { error: "Question paper ID and answers are required" },
        { status: 400 },
      );
    }

    // Verify the student token
    let studentId;
    try {
      const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
      if (decoded.role !== "student") {
        return NextResponse.json(
          { error: "Access denied. Students only." },
          { status: 403 },
        );
      }
      studentId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    // Verify test access and get test data
    const questionPaper = await prisma.questionPaper.findUnique({
      where: { id: questionPaperId },
      include: {
        classroom: {
          include: {
            students: {
              where: { id: studentId },
              select: { id: true },
            },
          },
        },
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!questionPaper) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Check if the test is live
    if (questionPaper.status !== "live" || !questionPaper.isActive) {
      return NextResponse.json(
        { error: "Test is not currently live" },
        { status: 403 },
      );
    }

    // Check if student belongs to the classroom
    if (questionPaper.classroom.students.length === 0) {
      return NextResponse.json(
        { error: "Access denied. You are not enrolled in this classroom." },
        { status: 403 },
      );
    }

    // Check if student has already submitted this test
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        studentId: studentId,
        questionPaperId: questionPaperId,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this test" },
        { status: 400 },
      );
    }

    // Calculate scores
    let totalMarksObtained = 0;
    const answerDetails = [];

    for (const questionPaperQuestion of questionPaper.questions) {
      // The answers object uses QuestionPaperQuestion.id as keys, not questionId
      const questionPaperQuestionId = questionPaperQuestion.id;
      const studentAnswer = answers[questionPaperQuestionId];
      const correctAnswer = questionPaperQuestion.question.Correct_Answer;

      const isCorrect = studentAnswer === correctAnswer;
      const marksObtained = isCorrect ? 1 : 0; // Assuming 1 mark per question

      totalMarksObtained += marksObtained;

      answerDetails.push({
        questionPaperQuestionId: questionPaperQuestionId,
        questionId: questionPaperQuestion.questionId.toString(),
        selectedAnswer: studentAnswer || null,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        marksObtained: marksObtained,
      });
    }
    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        studentId: studentId,
        questionPaperId: questionPaperId,
        answers: answerDetails,
        totalMarksObtained: totalMarksObtained,
        totalMarks: questionPaper.questions.length, // Assuming 1 mark per question
        submittedAt: new Date(),
      },
    });
    if (submission) {
      const createAnalytics = await prisma.analytics.create({
        data: {
          questionPaper: questionPaper.questions,
          submission: {
            connect: {
              id: submission.id,
            },
          },
          answer: answerDetails,
        },
      });
      if (createAnalytics) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const data = await prisma.analytics.findUnique({
          where: {
            id: createAnalytics.id,
          },
        });
        const { questionPaper, answer } = data;

        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const content = `
**Role:** You are a highly intelligent and meticulous KCET examiner assistant AI. Your primary function is to provide an in-depth, comprehensive analysis of student performance on provided question papers and answers.

**Critical Requirements - YOU MUST FOLLOW THESE:**
* **Never give generic advice like "check NCERT book"** - Always provide specific, detailed explanations
* **For EVERY question, you must provide:**
  1. The correct answer with full explanation
  2. The student's chosen answer 
  3. Whether the student's answer is correct or incorrect
  4. WHY the correct answer is right (with reasoning/logic/formula)
  5. If incorrect, WHY the student's answer is wrong
  6. Exact NCERT reference: "Class X, Chapter Y: [Chapter Name], Section Z: [Section Name]"

**Detailed Analysis Requirements:**

**For Each Question, Provide:**
* **Question Analysis:** "[Question number] - [Brief description of what the question tests]"
* **Correct Answer:** "[Correct option] - [Full explanation of why this is correct]"
* **Student's Answer:** "[Student's chosen option] - [Correct/Incorrect status]"
* **Explanation:** 
  - If CORRECT: "Well done! You correctly identified that [detailed reasoning]"
  - If INCORRECT: "You chose [wrong option], but the correct answer is [right option] because [detailed explanation of the concept]"
* **NCERT Reference:** "Study: Class [X], Chapter [Y]: [Chapter Name], Section [Z]: [Section Name], Pages [XX-XX]"
* **Key Concept:** "[The specific concept/formula/principle being tested]"

**Performance Metrics (Calculate Precisely):**
* Total Questions: [Count from JSON]
* Correct Answers: [Count where isCorrect = true]
* Incorrect Answers: [Count where isCorrect = false]
* Score: [Correct answers] / [Total questions]
* Percentage: [Percentage with 2 decimal places]

**Chapter-wise Performance:**
For each chapter that appears in the questions:
* "[Chapter Name]: [X correct out of Y total] - [Performance level: Excellent/Good/Needs Improvement/Poor]"
* List specific topics within that chapter that need focus

**Improvement Strategy:**
* **Priority 1 (Critical):** [Chapters with 0% or very low scores]
* **Priority 2 (Important):** [Chapters with 25-50% scores] 
* **Priority 3 (Review):** [Chapters with 50-75% scores]
* **Strengths:** [Chapters with 75%+ scores]

**Study Plan:**
For each weak area, provide:
* Specific NCERT chapter and page references
* Key formulas/concepts to memorize
* Types of practice problems to solve
* Common mistakes to avoid

**Input Data:**
You will be provided with:
1. \`questionPaper\`: Contains questions, correct answers, topics, and chapters
2. \`answer\`: Contains student's responses with \`isCorrect\` flags

**Output Format:**
Generate the response in **HTML format** with **Tailwind CSS styling**.

**Enhanced Output Structure:**
\`\`\`html
<div class="container mx-auto p-4 bg-gray-100 rounded-lg shadow-xl dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
  <h2 class="text-3xl font-extrabold mb-6 text-center text-blue-700 dark:text-blue-400">KCET Exam Performance Analysis</h2>
  
  <!-- Performance Summary -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Performance Summary</h3>
      <div class="space-y-2">
        <p><span class="font-semibold">Total Questions:</span> <span class="text-blue-600">[X]</span></p>
        <p><span class="font-semibold">Correct:</span> <span class="text-green-600 font-bold">[X]</span></p>
        <p><span class="font-semibold">Incorrect:</span> <span class="text-red-600 font-bold">[X]</span></p>
        <p><span class="font-semibold">Score:</span> <span class="text-purple-600 font-bold">[X]/[Y]</span></p>
        <p class="text-xl"><span class="font-semibold">Percentage:</span> <span class="text-orange-500 font-bold">[XX.XX]%</span></p>
      </div>
    </div>
    <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Chapter Performance</h3>
      [Chapter-wise breakdown with specific scores]
    </div>
  </div>

  <!-- Detailed Question Analysis -->
  <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-600">
    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Question-by-Question Analysis</h3>
    <div class="space-y-4">
      <!-- For each question -->
      <div class="border-l-4 border-green-500 pl-4 bg-green-50 dark:bg-green-900 p-3 rounded">
        <h4 class="font-bold text-green-700 dark:text-green-300">Question [N]: [Topic] ✓</h4>
        <p><strong>Your Answer:</strong> [Student's choice] - <span class="text-green-600">CORRECT</span></p>
        <p><strong>Explanation:</strong> [Detailed explanation of why this is correct]</p>
        <p><strong>NCERT Reference:</strong> Class [X], Chapter [Y]: [Name], Section [Z], Pages [XX-XX]</p>
      </div>
      
      <div class="border-l-4 border-red-500 pl-4 bg-red-50 dark:bg-red-900 p-3 rounded">
        <h4 class="font-bold text-red-700 dark:text-red-300">Question [N]: [Topic] ✗</h4>
        <p><strong>Your Answer:</strong> [Student's choice] - <span class="text-red-600">INCORRECT</span></p>
        <p><strong>Correct Answer:</strong> [Right choice] - [Full explanation]</p>
        <p><strong>Why you were wrong:</strong> [Specific reason for the mistake]</p>
        <p><strong>NCERT Reference:</strong> Class [X], Chapter [Y]: [Name], Section [Z], Pages [XX-XX]</p>
      </div>
    </div>
  </div>

  <!-- Study Recommendations -->
  <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-600">
    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Targeted Study Plan</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
        <h4 class="font-bold text-red-700 dark:text-red-300">Priority 1 - Critical</h4>
        [Specific chapters and topics to focus on immediately]
      </div>
      <div class="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
        <h4 class="font-bold text-yellow-700 dark:text-yellow-300">Priority 2 - Important</h4>
        [Chapters needing improvement]
      </div>
      <div class="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
        <h4 class="font-bold text-green-700 dark:text-green-300">Strengths</h4>
        [Areas where student is performing well]
      </div>
    </div>
  </div>
</div>
\`\`\`

**Remember:** Be specific, detailed, and educational. Never give generic advice - always provide concrete explanations and exact references.

**Input Data:**
\`\`\`json
Question Paper JSON:
${JSON.stringify(questionPaper, null, 2)}

Answer JSON:
${JSON.stringify(answer, null, 2)}
\`\`\`
`;
        const result = await model.generateContent(content);
        const response = await result.response;
        const responseText = await response.text();
        const data1 = await prisma.analytics.update({
          where: {
            id: createAnalytics.id,
          },
          data: {
            Ai_suggestion: responseText,
          },
        });
        if (data1) {
          return NextResponse.json({
            success: true,
            message: "Test submitted successfully",
            submission: {
              id: submission.id,
              totalMarksObtained: submission.totalMarksObtained,
              totalMarks: submission.totalMarks,
              percentage: Math.round(
                (submission.totalMarksObtained / submission.totalMarks) * 100,
              ),
              submittedAt: submission.submittedAt,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 },
    );
  }
}
