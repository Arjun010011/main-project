import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { questionPaperId } = await request.json();

    // Get the student token from cookies
    const studentToken = request.cookies.get("studentToken")?.value;

    if (!studentToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!questionPaperId) {
      return NextResponse.json(
        { error: "Question paper ID is required" },
        { status: 400 },
      );
    }

    // Verify the student token
    let studentId;
    try {
      const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
      if (decoded.role !== "student") {
        return NextResponse.json(
          { error: "Access denied. Students only." },
          { status: 403 },
        );
      }
      studentId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    // Get the question paper and its classroom
    const questionPaper = await prisma.questionPaper.findUnique({
      where: { id: questionPaperId },
      include: {
        classroom: {
          include: {
            students: {
              where: { id: studentId },
              select: { id: true },
            },
          },
        },
      },
    });
    if (!questionPaper) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Check if the test is live
    if (questionPaper.status !== "live" || !questionPaper.isActive) {
      return NextResponse.json(
        { error: "Test is not currently live" },
        { status: 403 },
      );
    }

    // Check if student belongs to the classroom
    if (questionPaper.classroom.students.length === 0) {
      return NextResponse.json(
        { error: "Access denied. You are not enrolled in this classroom." },
        { status: 403 },
      );
    }

    // Check if student has already submitted this test
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        studentId: studentId,
        questionPaperId: questionPaperId,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already completed this test." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Access granted",
      testInfo: {
        id: questionPaper.id,
        name: questionPaper.questionPaperName,
        duration: questionPaper.duration,
        totalMarks: questionPaper.totalMarks,
        classroomId: questionPaper.classroomId,
      },
    });
  } catch (error) {
    console.error("Error verifying test access:", error);
    return NextResponse.json(
      { error: "Failed to verify test access" },
      { status: 500 },
    );
  }
}
