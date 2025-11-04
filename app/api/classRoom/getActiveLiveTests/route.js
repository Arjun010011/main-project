import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { classroomId } = await request.json();

    // Get the student token from cookies
    const studentToken = request.cookies.get("studentToken")?.value;

    if (!studentToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    // Verify the student token
    let studentId;
    try {
      const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
      if (decoded.role !== "student") {
        return NextResponse.json(
          { error: "Access denied. Students only." },
          { status: 403 }
        );
      }
      studentId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Verify that the student belongs to this classroom
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        students: {
          some: {
            id: studentId,
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Access denied. You are not enrolled in this classroom." },
        { status: 403 }
      );
    }

    // Find all live tests in the classroom using status field
    const liveTests = await prisma.questionPaper.findMany({
      where: {
        classroomId: classroomId,
        status: "live",
        isActive: true,
      },
      select: {
        id: true,
        questionPaperName: true,
        duration: true,
        totalMarks: true,
        startedAt: true,
        createdAt: true,
        status: true,
        isLiveTest: true,
      },
    });

    // Filter out tests that the student has already completed
    const completedTestIds = await prisma.submission.findMany({
      where: {
        studentId: studentId,
        questionPaperId: {
          in: liveTests.map((test) => test.id),
        },
      },
      select: {
        questionPaperId: true,
      },
    });

    const completedIds = completedTestIds.map((sub) => sub.questionPaperId);
    const availableTests = liveTests.filter(
      (test) => !completedIds.includes(test.id)
    );

    return NextResponse.json({
      success: true,
      liveTests: availableTests,
    });
  } catch (error) {
    console.error("Error fetching live tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch live tests" },
      { status: 500 }
    );
  }
}
