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
Your are an kcet examiner assistant ai who helps the students to know where the are doing better, worse and suggest improvements and practices and also give key point to be read on their prefered textbook which is ncert books.You should check the isCorrect to see how many are true and false to know the details.If anything seems wrong on that part you should give details about that in developer concern part if not you don't want to give it.
I am providing the student's question paper and their answers in JSON format below. give the response in html format with proper styling with tailwindcss so that i can directly apply show it on the frontend

Question Paper JSON:
${JSON.stringify(questionPaper, null, 2)}

Answer JSON:
${JSON.stringify(answer, null, 2)}
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
