import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { code, studentId } = await req.json();

    if (!code || !studentId) {
      return new Response(
        JSON.stringify({
          message: "Classroom code and student ID are required",
        }),
        { status: 400 }
      );
    }

    // Find the classroom by code
    const classroom = await prisma.classroom.findUnique({
      where: { code },
      include: { students: true },
    });

    if (!classroom) {
      return new Response(JSON.stringify({ message: "Classroom not found" }), {
        status: 404,
      });
    }

    // Check if student is already in the classroom
    const isAlreadyJoined = classroom.students.some(
      (student) => student.id === studentId
    );

    if (isAlreadyJoined) {
      return new Response(
        JSON.stringify({ message: "Student is already in this classroom" }),
        { status: 400 }
      );
    }

    // Add student to classroom
    const updatedClassroom = await prisma.classroom.update({
      where: { code },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
      include: {
        students: true,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Successfully joined classroom",
        classroom: updatedClassroom,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining classroom:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
