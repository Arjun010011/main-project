import prisma from "@/lib/prisma";

export async function DELETE(req) {
  try {
    const { paperId } = await req.json();
    if (!paperId) {
      return new Response(JSON.stringify({ message: "paperId not found" }));
    }

    await prisma.questionPaperQuestion.deleteMany({
      where: {
        questionPaperId: paperId,
      },
    });

    const deletePaper = await prisma.questionPaper.delete({
      where: {
        id: paperId,
      },
    });
    if (!deletePaper) {
      return new Response(JSON.stringify({ message: "unable to delete" }), {
        status: 404,
      });
    } else {
      return new Response(
        JSON.stringify({ message: "deleted the paper successfully" }),
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "something went wrong", error: error }),
    );
  }
}
