import prisma from "@/lib/prisma";
BigInt.prototype.toJSON = function () {
  return this.toString();
};
export async function POST(req) {
  const { questionPaperId } = await req.json();
  const questionPaperWithQuestions = await prisma.questionPaper.findUnique({
    where: { id: questionPaperId },
    include: {
      questions: {},
    },
  });
  return new Response(
    JSON.stringify({
      message: "fetched the question paper succefully",
      questionPaper: questionPaperWithQuestions,
    }),
  );
}
