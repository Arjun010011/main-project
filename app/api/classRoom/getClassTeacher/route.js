import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { id } = await req.json();

    // Get the student token from cookies
    const teacherToken = req.cookies.get("teacherToken")?.value;
    if (!teacherToken) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 },
      );
    }

    if (!id) {
      return new Response(JSON.stringify({ message: "id is not defined" }), {
        status: 500,
      });
    }

    // Verify the student token
    let teacherId;
    try {
      const decoded = jwt.verify(teacherToken, process.env.JWT_SECRET);
      if (decoded.role !== "teacher") {
        return new Response(
          JSON.stringify({ message: "Access denied. teachers only." }),
          { status: 403 },
        );
      }
      teacherId = decoded.id;
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid authentication token" }),
        { status: 401 },
      );
    }

    // Verify that the student belongs to this classroom
    const classRoomInfo = await prisma.classroom.findUnique({
      where: {
        id,
      },
    });

    if (!classRoomInfo) {
      return new Response(
        JSON.stringify({
          message: "Access denied. You are not enrolled in this classroom.",
        }),
        { status: 403 },
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
