import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { id } = await req.json();
    const data = await prisma.classroom.findUnique({
      where: {
        id,
      },
    });
    if (data) {
      return new Response(
        JSON.stringify({
          data: data,
          message: "got the classroom data successfully",
        }),
        { status: 200 },
      );
    } else {
      return new Response(
        JSON.stringify({ message: "classroom data not found" }),
        { status: 404 },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Something went wrong", error: error.message }),
      { status: error.status ? error.status : 500 },
    );
  }
}
