import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function POST(req) {
  const { classroomId, questionInput, questionPaperName, prompt } =
    await req.json();

  if (!Array.isArray(questionInput)) {
    return new Response(
      JSON.stringify({
        message: "The format of questionInput is not an array.",
      }),
      { status: 400 },
    );
  }

  let keywordArray = [];
  const questionArray = [];

  //If prompt is provided, extract keywords using Gemini AI
  if (prompt) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });

      const result = await model.generateContent(
        `From the following prompt, give a comma-separated list of keywords to filter a question database: ${prompt}`,
      );

      const response = await result.response;
      const keywordText = await response.text();
      console.log(keywordText);
      keywordArray = keywordText
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      if (keywordArray.length === 0) {
        return new Response(
          JSON.stringify({
            message: "The AI returned no keywords from the prompt.",
          }),
          { status: 400 },
        );
      }
    } catch (error) {
      if (error.message?.includes("503")) {
        return new Response(
          JSON.stringify({
            message:
              "Gemini service is currently unavailable. Try again later or omit the prompt.",
          }),
          { status: 503 },
        );
      } else {
        return new Response(
          JSON.stringify({ message: "Gemini error: " + error.message }),
          { status: 500 },
        );
      }
    }
  }

  //Fetch questions from Prisma
  for (const param of questionInput) {
    const { subject, difficulty, number_of_questions } = param;

    if (!subject || !difficulty || !number_of_questions) {
      return new Response(
        JSON.stringify({ message: "Some fields are missing." }),
        { status: 400 },
      );
    }

    // Keyword filter-based dynamic query
    let query;
    let questions;

    try {
      if (keywordArray.length > 0) {
        // Dynamic OR clauses for each keyword
        const keywordConditions = keywordArray
          .map((_, i) => `"Question" ILIKE $${i + 4}`)
          .join(" OR ");

        query = `
          SELECT id
          FROM "Questions"
          WHERE "Subject" = $1 AND "Difficulty" = $2 AND (${keywordConditions})
          ORDER BY RANDOM()
          LIMIT $3
        `;

        const params = [
          subject,
          difficulty,
          number_of_questions,
          ...keywordArray.map((k) => `%${k}%`),
        ];

        questions = await prisma.$queryRawUnsafe(query, ...params);
      } else {
        // Normal subject + difficulty filter
        query = `
          SELECT id
          FROM "Questions"
          WHERE "Subject" = $1 AND "Difficulty" = $2
          ORDER BY RANDOM()
          LIMIT $3
        `;
        questions = await prisma.$queryRawUnsafe(
          query,
          subject,
          difficulty,
          number_of_questions,
        );
      }

      questionArray.push(...questions.map((q) => q.id));
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Database error: " + error.message }),
        { status: 500 },
      );
    }
  }

  //Check if any questions were fetched
  if (questionArray.length === 0) {
    return new Response(
      JSON.stringify({ message: "The questions array is empty." }),
      { status: 404 },
    );
  }

  //Create Question Paper
  let questionPaper;
  try {
    questionPaper = await prisma.questionPaper.create({
      data: {
        classroomId,
        questionPaperName,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Failed to create QuestionPaper: " + error.message,
      }),
      { status: 500 },
    );
  }

  //Link Questions to Paper
  const questionPaperQuestions = questionArray.map((qid) => ({
    questionPaperId: questionPaper.id,
    questionId: qid,
  }));

  try {
    await prisma.questionPaperQuestion.createMany({
      data: questionPaperQuestions,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Failed to insert related questions: " + error.message,
      }),
      { status: 500 },
    );
  }

  //Success
  return new Response(
    JSON.stringify({
      message: "Question paper created successfully!",
      questionPaperId: questionPaper.id,
      questionCount: questionArray.length,
    }),
    { status: 200 },
  );
}
