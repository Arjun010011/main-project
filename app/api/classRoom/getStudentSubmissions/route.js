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

    // Get student's submissions for this classroom
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: studentId,
        questionPaper: {
          classroomId: classroomId,
        },
      },
      include: {
        questionPaper: {
          select: {
            id: true,
            questionPaperName: true,
            duration: true,
            totalMarks: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      submissions: submissions.map((sub) => ({
        id: sub.id,
        testName: sub.questionPaper.questionPaperName,
        totalMarksObtained: sub.totalMarksObtained,
        totalMarks: sub.totalMarks,
        percentage: Math.round((sub.totalMarksObtained / sub.totalMarks) * 100),
        submittedAt: sub.submittedAt,
        testDuration: sub.questionPaper.duration,
        testStartedAt: sub.questionPaper.startedAt,
        testEndedAt: sub.questionPaper.endedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
