import { cookies } from "next/headers";

export async function POST() {
  cookies().set({
    name: "teacherToken",
    value: "",
    maxAge: 0,
    path: "/",
  });

  cookies().set({
    name: "studentToken",
    value: "",
    maxAge: 0,
    path: "/",
  });

  return Response.json({ success: true });
}
