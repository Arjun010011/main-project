import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, role, fullName, image } = await req.json();
    let user;

    if (role === "teacher") {
      // Check if teacher exists
      let userExist = await prisma.teacher.findUnique({
        where: { email },
      });

      if (!userExist) {
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = bcryptjs.hashSync(randomPassword, 10);

        user = await prisma.teacher.create({
          data: {
            email,
            fullName,
            image,
            password: hashedPassword,
            role: "teacher",
            // no authProvider field in schema; add if needed
          },
        });
        userExist = user;
      }

      const token = jwt.sign(
        { id: userExist.id, email: userExist.email, role: "teacher" },
        process.env.JWT_SECRET,
        { expiresIn: "9d" },
      );

      const cookie = serialize("teacherToken", token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      // Remove password before returning user
      const { password, ...passLessUser } = userExist;

      return new Response(
        JSON.stringify({
          message: "user authenticated successfully",
          user: passLessUser,
        }),
        {
          status: 200,
          headers: {
            "Set-Cookie": cookie,
          },
        },
      );
    }

    if (role === "student") {
      // Check if student exists
      let userExist = await prisma.student.findUnique({
        where: { email },
      });

      if (!userExist) {
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = bcryptjs.hashSync(randomPassword, 10);

        user = await prisma.student.create({
          data: {
            email,
            fullName,
            password: hashedPassword,
            image,
            role: "student",
          },
        });
        userExist = user;
      }

      const token = jwt.sign(
        { id: userExist.id, email: userExist.email, role: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "9d" },
      );

      const cookie = serialize("studentToken", token, {
        httpOnly: true,
        path: "/",
        maxAge: 64 * 60 * 24 * 7, // 7 days in seconds
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      const { password, ...passLessUser } = userExist;

      return new Response(
        JSON.stringify({
          message: "user authenticated successfully",
          user: passLessUser,
        }),
        {
          status: 200,
          headers: {
            "Set-Cookie": cookie,
          },
        },
      );
    }
  } catch (error) {
    console.error("something went wrong", error);
    return new Response(
      JSON.stringify({
        message: "something went wrong",
        errormsg: error.message || error,
        status: 500,
      }),
      { status: 500 },
    );
  }
}
