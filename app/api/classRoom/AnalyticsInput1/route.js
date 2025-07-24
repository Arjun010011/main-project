import prisma from "@/lib/prisma";

export async function POST(req) {
  console.log(Object.keys(prisma));
  try {
    const { questionPaper, studentId, classroomId, testId } = await req.json();
    console.log(classroomId);
    if (!questionPaper || !studentId || !classroomId) {
      return new Response(
        JSON.stringify({ message: "all field are required" }),
        { status: 500 },
      );
    }
    const data = await prisma.analytics.create({
      data: {
        questionPaper,
        student_Id: studentId,
        classroomId,
        test_Id: testId,
      },
    });
    console.log(data);
    if (data) {
      return new Response(
        JSON.stringify({
          message: "succefully got the questionPaper and studentId",
        }),
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "something went wrong", error: error.message }),
      {
        status: 400,
      },
    );
  }
}
