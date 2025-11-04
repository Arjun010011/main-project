import prisma from "@/lib/prisma";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    const deleteClass = await prisma.classroom.delete({
      where: {
        id,
      },
    });
    if (!deleteClass) {
      return new Response(JSON.stringify({ message: "classroom not found" }), {
        status: 404,
      });
    }
    return new Response(
      JSON.stringify({ message: "classroom deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("something went wrong", error);
    return new Response(
      JSON.stringify({ message: "Internal server error", error: error }),
      {
        status: 500,
      },
    );
  }
}
