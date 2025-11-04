// app/api/auth/verify/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const studentToken = req.cookies.get("studentToken")?.value;
  const teacherToken = req.cookies.get("teacherToken")?.value;

  if (!studentToken) {
    if (!teacherToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  }

  try {
    if (studentToken) {
      const decoded = jwt.verify(studentToken, process.env.JWT_SECRET);
      return NextResponse.json({ authenticated: true, user: decoded });
    }
    if (teacherToken) {
      const decoded = jwt.verify(teacherToken, process.env.JWT_SECRET);
      return NextResponse.json({ authenticated: true, user: decoded });
    }
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
