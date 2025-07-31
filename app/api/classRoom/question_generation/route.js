import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function POST(req) {
  const body = await req.json();
  const { classroomId, questionPaperName, prompt } = body;
  let { questionInput = [] } = body;

  // Validate basic input
  if (!classroomId || !questionPaperName) {
    return new Response(
      JSON.stringify({
        message: "Prompt, classroomId, and questionPaperName are required.",
      }),
      { status: 400 },
    );
  }

  let aiQuesitonInput;
  if (questionInput.length === 0 && prompt) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });

      const content = `
      From the following prompt, extract the required question structure as a JSON array.
      Each item in the array should contain:
      {
        subject: string(Physics,Chemistry or Maths don't sound it as mathmatics instead it is stored as maths in database so use Maths),
        topic: string (optional),
        difficulty: string (Easy | Medium | Hard),
        number_of_questions: number
      }
      give the output as json nothing else is needed, you don't have to mention it as json give the output in "" not in '''
      Prompt: """${prompt}"""
    `;

      const result = await model.generateContent(content);
      const response = await result.response;
      const responseText = await response.text();

      const cleanText = responseText
        .trim()
        .replace(/^```json|```$/g, "")
        .trim();
      try {
        aiQuesitonInput = JSON.parse(cleanText);
      } catch (err) {
        console.error("JSON parsing error:", err, responseText);
        return new Response(
          JSON.stringify({ message: "Failed to extract valid JSON from AI." }),
          {
            status: 400,
          },
        );
      }

      if (!Array.isArray(aiQuesitonInput) || aiQuesitonInput.length === 0) {
        return new Response(
          JSON.stringify({
            message: "Prompt did not yield valid question data.",
          }),
          {
            status: 400,
          },
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Gemini error: " + error.message }),
        {
          status: 500,
        },
      );
    }
  }
  const questionArray = [];
  if (aiQuesitonInput) questionInput = aiQuesitonInput;
  for (const param of questionInput) {
    const { subject, topic, difficulty, number_of_questions } = param;

    if (!subject || !difficulty || !number_of_questions) {
      return new Response(
        JSON.stringify({ message: "Some fields are missing in parsed input." }),
        {
          status: 400,
        },
      );
    }

    let query;
    let questions;

    try {
      if (topic) {
        // Filter by subject, difficulty, AND topic
        query = `
          SELECT id
          FROM "Questions"
          WHERE "Subject" = $1 AND "Difficulty" = $2 AND "Question" ILIKE $4
          ORDER BY RANDOM()
          LIMIT $3
        `;
        questions = await prisma.$queryRawUnsafe(
          query,
          subject,
          difficulty,
          number_of_questions,
          `%${topic}%`,
        );
      } else {
        // Filter by subject and difficulty only
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
        JSON.stringify({
          message: "Database error while fetching questions: " + error.message,
        }),
        { status: 500 },
      );
    }
  }

  if (questionArray.length === 0) {
    return new Response(
      JSON.stringify({ message: "No questions matched the prompt." }),
      {
        status: 404,
      },
    );
  }

  // Create the question paper
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

  // Link questions to question paper
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

  return new Response(
    JSON.stringify({
      message: "Question paper created successfully from prompt!",
      questionPaperId: questionPaper.id,
      questionCount: questionArray.length,
    }),
    { status: 200 },
  );
}
