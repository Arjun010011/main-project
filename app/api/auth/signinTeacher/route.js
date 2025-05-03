import teacher from "@/models/teacher.js";
import { connectDB } from "@/lib/mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    const userExist = await teacher.findOne({ email });
    if (userExist) {
      const check = await bcryptjs.compare(password, userExist.password);
      if (check) {
        const token = jwt.sign(
          { id: userExist._id, email: userExist.email, role: "student" },
          process.env.JWT_SECRET, // use a strong secret in .env
          { expiresIn: "9d" },
        );
        const cookie = serialize("teacherToken", token, {
          httpOnly: true,
          path: "/",
          maxAge: 63 * 60 * 24 * 7, // 7 days in seconds
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        return new Response(
          JSON.stringify({ message: "user authenticated successfully" }),
          {
            status: 200,
            headers: {
              "Set-Cookie": cookie,
            },
          },
        );
      } else {
        return new Response(
          JSON.stringify({ message: "password did'nt match" }),
          { status: 402 },
        );
      }
    }
  } catch (error) {
    console.error("soemthing went wrong", error);
    return new Response(
      JSON.stringify({
        message: "something went wrong",
        errormsg: error,
        status: 400,
      }),
      { status: 400 },
    );
  }
}
