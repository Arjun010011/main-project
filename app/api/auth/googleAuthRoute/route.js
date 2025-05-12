import { connectDB } from "@/lib/mongoose";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import student from "@/models/student.js";
import teacher from "@/models/teacher.js";
export async function POST(req) {
  try {
    await connectDB();
    const { email, role, fullName, image } = await req.json();
    let user;
    if (role === "teacher") {
      let userExist = await teacher.findOne({ email });
      if (!userExist) {
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = bcryptjs.hashSync(randomPassword, 10);

        user = new teacher({
          email,
          fullName,
          image,
          password: hashedPassword,
          role, //student or teacher based on frontend
          authProvider: "google",
        });
        await user.save();
        userExist = user;
      }
      const token = jwt.sign(
        { id: userExist._id, email: userExist.email, role: "teacher" },
        process.env.JWT_SECRET,
        { expiresIn: "9d" }
      );
      const cookie = serialize("teacherToken", token, {
        httpOnly: true,
        path: "/",
        maxAge: 64 * 60 * 24 * 7, // 7 days in seconds
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      const { password, ...passLessUser } = userExist.toObject();
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
        }
      );
    }
    if (role === "student") {
      let userExist = await student.findOne({ email });
      if (!userExist) {
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = bcryptjs.hashSync(randomPassword, 10);

        user = new student({
          email,
          name: fullName,
          image,
          password: hashedPassword,
          role, //student or teacher based on frontend
          authProvider: "google",
        });
        await user.save();
        userExist = user;
      }
      const token = jwt.sign(
        { id: userExist._id, email: userExist.email, role: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "9d" }
      );
      const cookie = serialize("studentToken", token, {
        httpOnly: true,
        path: "/",
        maxAge: 64 * 60 * 24 * 7, // 7 days in seconds
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      const { password, ...passLessUser } = userExist.toObject();
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
        }
      );
    }
  } catch (error) {
    console.error("soemthing went wrong", error);
    return new Response(
      JSON.stringify({
        message: "something went wrong",
        errormsg: error,
        status: 500,
      }),
      { status: 500 }
    );
  }
}
