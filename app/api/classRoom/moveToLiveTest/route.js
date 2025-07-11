import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { questionPaperId } = await req.json();
    if (!questionPaperId) {
      return new Response(
        JSON.stringify({ message: "questionPaperId is required" }),
        { status: 400 }
      );
    }
    const updated = await prisma.questionPaper.update({
      where: { id: questionPaperId },
      data: { isLiveTest: true },
    });
    return new Response(
      JSON.stringify({ message: "Moved to live test", questionPaper: updated }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error moving to live test",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
