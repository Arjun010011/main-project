import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { studentId, classroomId } = await req.json();
    if (!studentId || !classroomId) {
      return new Response(
        JSON.stringify({ message: "missing studentId or blassroomId" }),
        {
          status: 400,
        },
      );
    }
    const block = await prisma.blockedStudent.create({
      data: {
        classroomId,
        studentId,
      },
    });
    if (block) {
      return new Response(
        JSON.stringify({ message: "succefully added to the block list" }),
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "something went wrong on  the server side",
        error: error.message,
      }),
      {
        status: 500,
      },
    );
  }
}
