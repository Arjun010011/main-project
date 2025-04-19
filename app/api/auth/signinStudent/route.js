import student from "@/models/student.js";
import { connectDB } from "@/lib/mongoose";
import bcryptjs from "bcryptjs";
export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    const userExist = await student.findOne({ email });
    if (userExist) {
      const check = await bcryptjs.compare(password, userExist.password);
      if (check) {
        return new Response(
          JSON.stringify({ message: "user authenticated successfully" }),
          { status: 200 },
        );
      } else {
        return new Response(
          JSON.stringify({ message: "password did'nt match" }),
          { status: 500 },
        );
      }
    }
  } catch (error) {
    console.error("soemthing went wrong", error);
    return new Response(
      JSON.stringify({
        message: "something went wrong",
        errormsg: error,
        status: 500,
      }),
      { status: 500 },
    );
  }
}
