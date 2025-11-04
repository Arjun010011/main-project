import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { findRetakeCandidates } from "@/lib/ml/retakeCandidates";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const max = Number(searchParams.get("max") || 50);
    if (!classroomId) return NextResponse.json({ error: "classroomId is required" }, { status: 400 });

    const teacherToken = request.cookies.get("teacherToken")?.value;
    if (!teacherToken) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    let decoded;
    try { decoded = jwt.verify(teacherToken, process.env.JWT_SECRET); } catch { return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 }); }
    if (decoded.role !== "teacher") return NextResponse.json({ error: "Teachers only" }, { status: 403 });

    const candidates = await findRetakeCandidates({ classroomId, maxStudents: Math.min(200, Math.max(1, max)) });
    return NextResponse.json({ classroomId, count: candidates.length, candidates });
  } catch (error) {
    console.error("retakeCandidates error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


