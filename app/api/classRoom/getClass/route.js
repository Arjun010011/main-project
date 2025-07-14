import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { id } = await req.json();

    // Get the student token from cookies
    const studentToken = req.cookies.get("studentToken")?.value;

    if (!studentToken) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 }
      );
    }

    if (!id) {
      return new Response(JSON.stringify({ message: "id is not defined" }), {
        status: 500,
      });
    }

    // Verify the student token
    let studentId;
    try {
      const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
      if (decoded.role !== "student") {
        return new Response(
          JSON.stringify({ message: "Access denied. Students only." }),
          { status: 403 }
        );
      }
      studentId = decoded.id;
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid authentication token" }),
        { status: 401 }
      );
    }

    // Verify that the student belongs to this classroom
    const classRoomInfo = await prisma.classroom.findFirst({
      where: {
        id: id,
        students: {
          some: {
            id: studentId,
          },
        },
      },
    });

    if (!classRoomInfo) {
      return new Response(
        JSON.stringify({
          message: "Access denied. You are not enrolled in this classroom.",
        }),
        { status: 403 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "got classroom data successfully!!!",
        classRoomInfo: classRoomInfo,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "internal server error", error: error }),
      { status: 500 }
    );
  }
}
