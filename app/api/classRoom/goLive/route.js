import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { questionPaperId } = await request.json();

    if (!questionPaperId) {
      return NextResponse.json(
        { error: "Question paper ID is required" },
        { status: 400 }
      );
    }

    // Update the question paper to go live
    const updatedPaper = await prisma.questionPaper.update({
      where: {
        id: questionPaperId,
      },
      data: {
        isLiveTest: true,
        status: "live",
        isActive: true,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test is now live!",
      questionPaper: updatedPaper,
    });
  } catch (error) {
    console.error("Error going live:", error);
    return NextResponse.json(
      { error: "Failed to start live test" },
      { status: 500 }
    );
  }
}
