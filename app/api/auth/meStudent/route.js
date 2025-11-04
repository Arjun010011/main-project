import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const token = request.cookies.get("studentToken")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (decoded.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const student = await prisma.student.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, fullName: true, image: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json({ student });
  } catch (error) {
    console.error("meStudent error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


