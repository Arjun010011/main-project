import prisma from "@/lib/prisma";
export async function POST(req) {
  try {
    const { Answer, studentId } = await req.json();
    if (!Answer || !studentId) {
      return new Response(
        JSON.stringify({ message: "All field are required" }, { status: 500 }),
      );
    }
    const data = await prisma.analytics.update({
      where: {
        student_Id: studentId,
      },
      data: {
        Answer,
      },
    });
    if (data) {
      return new Response(
        JSON.stringify({ message: "Answers fed succefully" }),
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "something went wrong", error: error.message }),
      { status: 400 },
    );
  }
}
