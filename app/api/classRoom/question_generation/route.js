import prisma from "@/lib/prisma";
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function POST(req) {
  const params = await req.json();
  if (!Array.isArray(params)) {
    return new Response(
      JSON.stringify({ message: "the format is not in array" }),
      { status: 400 },
    );
  }
  const questionPaper = [];
  for (const param of params) {
    const { subject, difficulty, number_of_questions } = param;
    if (!subject || !difficulty || !number_of_questions) {
      return new Response(
        JSON.stringify({ message: "some fields are required" }),
        {
          status: 400,
        },
      );
    }
    const query = `SELECT id, "Question", "Option_A", "Option_B", "Option_C", "Option_D", "Correct_Answer", "Explanation","Difficulty","Subject"
    FROM "Questions" 
    WHERE "Subject" = $1 AND "Difficulty" = $2 
    ORDER BY RANDOM()
    LIMIT  $3`;

    const questions = await prisma.$queryRawUnsafe(
      query,
      subject,
      difficulty,
      number_of_questions,
    );
    questionPaper.push(...questions);
  }
  if (questionPaper.length === 0) {
    return new Response(JSON.stringify({ message: "nothing found" }), {
      status: 404,
    });
  }
  return new Response(
    JSON.stringify({
      message: "questions found",
      questionPaper: questionPaper,
    }),
    {
      status: 200,
    },
  );
}
