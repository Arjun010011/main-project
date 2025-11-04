import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { questionPaperId } = await request.json();

    if (!questionPaperId) {
      return NextResponse.json(
        { error: "Question paper ID is required" },
        { status: 400 },
      );
    }

    // End the live test by setting isLiveTest to false
    const updatedPaper = await prisma.questionPaper.update({
      where: {
        id: questionPaperId,
      },
      data: {
        isLiveTest: false,
        status: "completed",
        isActive: false,
        endedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test has been ended!",
      questionPaper: updatedPaper,
    });
  } catch (error) {
    console.error("Error ending live test:", error);
    return NextResponse.json(
      { error: "Failed to end live test" },
      { status: 500 },
    );
  }
}
