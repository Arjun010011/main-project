import prisma from "@/lib/prisma";
export async function PUT(req) {
  try {
    const { student_id, classroomId } = await req.json();
    if (!student_id || !classroomId) {
      return new Response(
        JSON.stringify(
          { message: "student id  or classroom id or both  not found" },
          { status: 404 },
        ),
      );
    }
    const data = await prisma.classroom.update({
      where: {
        id: classroomId,
      },
      data: {
        students: {
          disconnect: {
            id: student_id,
          },
        },
      },
    });
    if (data) {
      return new Response(
        JSON.stringify({
          message: "deleted student from the classroom successfully",
        }),
        { status: 200 },
      );
    }
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "something went wrong", error: error.message }),
      {
        status: 500,
      },
    );
  }
}
