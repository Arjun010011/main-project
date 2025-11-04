import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { className, subjectName, sectionName, id } = await req.json();

    const classRoomInfo = await prisma.classroom.findUnique({ where: { id } });
    if (!classRoomInfo) {
      return new Response(
        JSON.stringify({ message: "classroom with this id is not found" }),
        {
          status: 404,
        },
      );
    }
    const editClassRoom = await prisma.classroom.update({
      where: { id },
      data: {
        className,
        subjectName,
        sectionName,
      },
    });
    if (!editClassRoom) {
      return new Response(
        JSON.stringify({ message: "unable to update the classroom" }),
        { status: 400 },
      );
    }
    return new Response(
      JSON.stringify({ message: "udpated the classroom", data: editClassRoom }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "internal server error",
        error: error.message,
      }),
      { status: 500 },
    );
  }
}
