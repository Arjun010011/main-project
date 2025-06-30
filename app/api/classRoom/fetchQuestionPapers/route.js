import prisma from "@/lib/prisma";
BigInt.prototype.toJSON = function () {
  return this.toString();
};
export async function POST(req) {
  const { classroomId } = await req.json();
  const questionPaperDetails = await prisma.questionPaper.findMany({
    where: { classroomId: classroomId },
  });
  const totalPaper = questionPaperDetails.length;
  return new Response(
    JSON.stringify({
      message: "fetched the question paper succefully",
      questionPaperDetails,
      totalPaper,
    }),
  );
}
