import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
export async function POST(req) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const { studentId } = await req.json();
    const data = await prisma.analytics.findUnique({
      where: {
        student_Id: studentId,
      },
    });
    const { questionPaper, Answer } = data;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const content = `
I am providing the student's question paper and their answers in JSON format below. 
Please analyze their performance, identify strengths and weaknesses, and suggest improvements.

Question Paper JSON:
${JSON.stringify(questionPaper, null, 2)}

Answer JSON:
${JSON.stringify(Answer, null, 2)}
`;
    const result = await model.generateContent(content);
    const response = await result.response;
    const responseText = await response.text();
    const data1 = await prisma.analytics.update({
      where: {
        student_Id: studentId,
      },
      data: {
        Ai_suggestion: responseText,
      },
    });
    if (data1) {
      return new Response(
        JSON.stringify({ message: "ai suggestion registered successfully" }),
        { status: 200 },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "something went wrong", error: error.message }),
      {
        status: 401,
      },
    );
  }
}
