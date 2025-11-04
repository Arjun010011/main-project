import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { recommendDifficultyMix } from "@/lib/ml/difficultyMix";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    if (!classroomId) return NextResponse.json({ error: "classroomId is required" }, { status: 400 });

    const teacherToken = request.cookies.get("teacherToken")?.value;
    if (!teacherToken) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    let decoded;
    try { decoded = jwt.verify(teacherToken, process.env.JWT_SECRET); } catch { return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 }); }
    if (decoded.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

    const mix = await recommendDifficultyMix({ classroomId });
    return NextResponse.json({ classroomId, mix });
  } catch (error) {
    console.error("difficultyMix error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


