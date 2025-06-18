import prisma from "@/lib/prisma";
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function POST(req) {
  const { classroomId, questionInput } = await req.json();
  if (!Array.isArray(questionInput)) {
    return new Response(
      JSON.stringify({ message: "the format is not in array" }),
      { status: 400 },
    );
  }
  const questionArray = [];
  for (const param of questionInput) {
    const { subject, difficulty, number_of_questions } = param;
    if (!subject || !difficulty || !number_of_questions) {
      return new Response(
        JSON.stringify({ message: "some fields are missing" }),
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
    questionArray.push(...questions.map((q) => q.id));
  }
  if (questionArray.length === 0) {
    return new Response(JSON.stringify({ message: "nothing found" }), {
      status: 404,
    });
  }
  const questionPaper = await prisma.questionPaper.create({
    data: { classroomId },
  });

  const questionPaperQuestions = questionArray.map((qid) => ({
    questionPaperId: questionPaper.id,
    questionId: qid,
  }));
  await prisma.questionPaperQuestion.createMany({
    data: questionPaperQuestions,
  });
  return new Response(
    JSON.stringify({
      message: "questions paper created",
      questionPaperId: questionPaper.id,
      questionCount: questionArray.length,
    }),
    {
      status: 200,
    },
  );
}
