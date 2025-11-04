import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { classroomId } = await req.json();
    if (!classroomId) {
      return new Response(
        JSON.stringify({ message: "classroomId is required" }),
        { status: 400 },
      );
    }
    const liveTests = await prisma.questionPaper.findMany({
      where: {
        classroomId,
        isLiveTest: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return new Response(
      JSON.stringify({ message: "Fetched live tests", liveTests }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error fetching live tests",
        error: error.message,
      }),
      { status: 500 },
    );
  }
}
