import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ message: "id is not defined" }), {
        status: 500,
      });
    }
    const classRoomInfo = await prisma.classroom.findUnique({ where: { id } });
    if (!classRoomInfo) {
      return new Response(
        JSON.stringify({ message: "info about the classroom is not found" }),
        { status: 404 },
      );
    }
    return new Response(
      JSON.stringify({
        message: "got classroom data successfully!!!",
        classRoomInfo: classRoomInfo,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "internal server error", error: error }),
      { status: 500 },
    );
  }
}
