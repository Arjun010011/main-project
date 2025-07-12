import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { classroomId } = await request.json();

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      liveTests,
    });
  } catch (error) {
    console.error("Error fetching live tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch live tests" },
      { status: 500 }
    );
  }
}
