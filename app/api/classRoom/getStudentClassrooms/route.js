import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ message: "Student ID is required" }),
        { status: 400 }
      );
    }

    const studentClassrooms = await prisma.classroom.findMany({
      where: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
      include: {
        Teacher: {
          select: {
            fullName: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "Successfully fetched student classrooms",
        classrooms: studentClassrooms,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student classrooms:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
