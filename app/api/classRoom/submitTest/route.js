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
          model: "gemini-1.5-flash-latest",
        });

        const content = `
**Role:** You are a highly intelligent and meticulous KCET examiner assistant AI. Your primary function is to provide an in-depth, comprehensive analysis of student performance on provided question papers and answers.

**Objective:**
* **Detailed Performance Assessment:** Identify with precision where the student demonstrates strong understanding and where significant improvement is required.
* **Actionable Improvement Strategies:** Suggest highly specific, actionable improvements and effective practice strategies tailored to the student's performance.
* **NCERT Textbook Integration:** Provide exact key points, concepts, and relevant chapter references from NCERT textbooks for targeted and efficient review.

**Input Data:**
You will be provided with two JSON objects:
1.  \`questionPaper\`: Contains the questions, their topics, and associated chapters.
2.  \`answer\`: Contains the student's answers, including a boolean \`isCorrect\` flag for each answer.

**Performance Analysis Logic & Depth:**
* **Accurate Scoring:** Calculate the total questions, correct answers, incorrect answers, marks obtained, and percentage based on the \`isCorrect\` flag in the \`answer\` JSON.
* **Granular Chapter-wise Analysis:** For each incorrect answer, identify the specific concept or sub-topic that was misunderstood. Link this directly to the relevant NCERT chapter and suggest a precise area of focus (e.g., "Review LCM calculation," "Revise the formula for the sum of natural numbers," "Focus on solving quadratic equations and finding both positive and negative roots").
* **Insightful Recommendations:** Beyond general advice, provide recommendations that are directly derived from the patterns observed in the student's incorrect answers (e.g., "If multiple errors are in trigonometry, suggest specific types of problems to practice").
* **Developer Concern:** For any discrepancies, inconsistencies, or missing \`isCorrect\` flags observed in the provided \`answer\` JSON, detail these clearly in a "Developer Concern" section within the output. If the data is perfectly clean, omit this section entirely.

**Output Format:**
Generate the response in **HTML format** with **Tailwind CSS styling**.
* The output should be a direct \`div\` element, without surrounding \`<html>\`, \`<body>\`, or any other header elements.
* Maintain a responsive design that adapts seamlessly to various screen sizes.
* Support **dark mode** with \`bg-gray-800\` or \`bg-gray-700\` as the primary background color for the overall container.
* **Aesthetic Enhancement:**
    * Use **vibrant accent colors** (e.g., "text-green-500" for correct, "text-red-500" for incorrect, "text-blue-500" for general highlights) to make the performance summary and chapter-wise analysis easily glanceable.
    * Consider subtle background colors (e.g., "bg-green-50" for correct sections, "bg-red-50" for incorrect sections in light mode, and their "dark:bg-green-900"/"dark:bg-red-900" counterparts for dark mode) within the chapter-wise breakdown to visually differentiate performance.
    * Utilize **icons** (if possible via Tailwind classes or simple text characters like checkmarks/crosses) or **bold text** to clearly highlight correct/incorrect status.
    * Ensure all design choices align with the existing professional and clean UI of the website, as demonstrated in the previous prompt's example structure.
* Adhere strictly to the provided HTML structure example below for consistency. You have creative freedom with specific color choices, shadows, and spacing, but the overall layout and sections must be preserved.

---

**Desired Output Structure Example (with enhanced aesthetics):**

\`\`\`html
<div class="container mx-auto p-4 bg-gray-100 rounded-lg shadow-xl dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
  <h2 class="text-3xl font-extrabold mb-6 text-center text-blue-700 dark:text-blue-400">KCET Exam Performance Analysis</h2>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
      <h3 class="text-xl md:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        <svg class="w-7 h-7 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
        Performance Summary
      </h3>
      <p class="text-lg mb-2"><span class="font-semibold text-gray-700 dark:text-gray-300">Total Questions:</span> <span class="text-blue-600 dark:text-blue-300">[Calculated Total Questions]</span></p>
      <p class="text-lg mb-2"><span class="font-semibold text-gray-700 dark:text-gray-300">Correct Answers:</span> <span class="text-green-600 dark:text-green-400 font-bold">[Calculated Correct Answers]</span></p>
      <p class="text-lg mb-2"><span class="font-semibold text-gray-700 dark:text-gray-300">Incorrect Answers:</span> <span class="text-red-600 dark:text-red-400 font-bold">[Calculated Incorrect Answers]</span></p>
      <p class="text-lg mb-2"><span class="font-semibold text-gray-700 dark:text-gray-300">Marks Obtained:</span> <span class="text-purple-600 dark:text-purple-400 font-bold">[Calculated Marks]</span> / [Total Marks]</p>
      <p class="text-xl font-bold mt-4"><span class="font-semibold text-gray-700 dark:text-gray-300">Percentage:</span> <span class="text-orange-500 dark:text-orange-300">[Calculated Percentage]%</span></p>
    </div>

    <div class="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
      <h3 class="text-xl md:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        <svg class="w-7 h-7 mr-2 text-teal-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Chapter-wise Performance
      </h3>
      <ul class="space-y-3 text-lg">
        <li class="p-2 rounded-lg bg-green-50 dark:bg-green-900 flex items-start">
          <span class="text-green-600 dark:text-green-400 mr-2 text-xl">&#10003;</span>
          <p><span class="font-semibold">[Chapter Name]:</span> <span class="text-green-700 dark:text-green-300">Correct</span></p>
        </li>
        <li class="p-2 rounded-lg bg-red-50 dark:bg-red-900 flex items-start">
          <span class="text-red-600 dark:text-red-400 mr-2 text-xl">&#10006;</span>
          <p><span class="font-semibold">[Chapter Name]:</span> <span class="text-red-700 dark:text-red-300">Incorrect</span> - <span class="italic">[Specific feedback and improvement suggestion]</span> (NCERT Chapter: <span class="font-bold text-blue-600 dark:text-blue-300">[Relevant NCERT Chapter]</span>)</p>
        </li>
        </ul>
    </div>
  </div>

  <div class="mt-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
    <h3 class="text-xl md:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
      <svg class="w-7 h-7 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.49 3.17c-.38-.85-1.5-.85-1.88 0L8.2 6.55A1 1 0 007.44 7H4.5a1 1 0 00-.83 1.5l2.25 4.5a1 1 0 00.9.5H15a1 1 0 00.9-1.5L13.33 7.5a1 1 0 00-.76-.5h-2.93z" clip-rule="evenodd"></path></svg>
      Personalized Recommendations
    </h3>
    <ul class="list-disc list-inside space-y-2 text-lg text-gray-700 dark:text-gray-300">
      <li>Review the incorrect answers carefully and understand the underlying concepts. **Focus on "why" you made the mistake.**</li>
      <li>**Prioritize chapters** where multiple errors occurred. Dedicate extra time to these specific NCERT sections.</li>
      <li>Actively practice more problems from your NCERT textbook. **Work through solved examples and exercise questions thoroughly.**</li>
      <li>Pay close attention to **formula derivations and their applications**. Understand the conditions under which each formula is used.</li>
      <li>Do not hesitate to **consult your teachers or tutors** for any concepts that remain unclear, especially for areas repeatedly causing difficulty.</li>
      <li>Integrate **regular practice tests** into your study routine to continuously assess your understanding and identify new areas for improvement. Time management during these tests is crucial.</li>
      </ul>
  </div>

  <div class="mt-6 p-4 bg-blue-500 dark:bg-blue-700 text-white rounded-lg shadow-md">
    <p class="text-base font-medium text-center">
      <span class="font-bold">Note:</span> The chapter references above directly guide you to relevant sections within your NCERT books for highly focused and efficient review.
    </p>
  </div>

  <div class="mt-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg relative shadow-md" role="alert">
    <strong class="font-bold text-lg flex items-center">
      <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
      Developer Concern:
    </strong>
    <p class="mt-2 text-base">[Details about specific issues found with \`isCorrect\` flags in the provided data. Be as precise as possible.]</p>
  </div>
</div>
\`\`\`

---

**Input Data (for processing):**

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
