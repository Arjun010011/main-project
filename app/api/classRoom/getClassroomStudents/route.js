import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { classroomId } = await req.json();

    if (!classroomId) {
      return new Response(
        JSON.stringify({ message: "Classroom ID is required" }),
        { status: 400 },
      );
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: {
          select: {
            id: true,
            fullName: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    if (!classroom) {
      return new Response(JSON.stringify({ message: "Classroom not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Successfully fetched classroom students",
        students: classroom.students,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching classroom students:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 },
    );
  }
}
