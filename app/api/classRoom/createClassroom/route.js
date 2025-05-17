import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { className, subjectName, sectionName, teacherId } = await req.json();

    if (!className || !teacherId) {
      return new Response(
        JSON.stringify({ message: "Class name or teacher ID is missing" }),
        { status: 400 },
      );
    }

    // Check if classroom exists using individual fields
    const classRoomExist = await prisma.classroom.findFirst({
      where: {
        className,
        teacherId,
      },
    });

    if (classRoomExist) {
      return new Response(
        JSON.stringify({
          message: "Classroom with the same name already exists",
        }),
        { status: 409 },
      );
    }

    const newClass = await prisma.classroom.create({
      data: {
        className,
        subjectName,
        sectionName,
        teacherId,
      },
    });

    console.log("Created classroom:", newClass);

    return new Response(
      JSON.stringify({
        message: "Classroom created successfully!",
        classroomInfo: newClass,
      }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Something went wrong:", error);

    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
      { status: 500 },
    );
  }
}
