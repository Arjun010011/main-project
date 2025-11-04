import { NextResponse } from "next/server";
import { predictNextScore } from "@/lib/ml/predictPerformance";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classroomId = searchParams.get("classroomId");
    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }
    const predicted = await predictNextScore({
      studentId,
      classroomId: classroomId || undefined,
    });
    return NextResponse.json({
      studentId,
      classroomId,
      predictedScore: predicted,
    });
  } catch (error) {
    console.error("predictPerformance error", error);
    return NextResponse.json(
      { error: "Failed to predict performance" },
      { status: 500 }
    );
  }
}
