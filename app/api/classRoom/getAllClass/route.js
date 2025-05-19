import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ message: "No email found" }), {
        status: 400,
      });
    }

    const classRooms = await prisma.classroom.findMany({
      where: {
        Teacher: {
          email: email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(
      JSON.stringify({ message: "Classrooms found!", classRooms }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
