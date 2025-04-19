import teacher from "@/models/teacher.js";
import { connectDB } from "@/lib/mongoose";
import bcryptjs from "bcryptjs";
export async function POST(req) {
  try {
    await connectDB();
    const { fullName, email, password } = await req.json();
    const role = "teacher";
    const userExist = await teacher.findOne({ email });
    if (userExist) {
      return new Response(
        JSON.stringify({ message: "user already exists", status: 500 }),
        { status: 500 },
      );
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const user = await new teacher({
      fullName,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();
    return new Response(
      JSON.stringify({
        message: "User created successfully",
        status: 201,
        user: user,
      }),
      {
        status: 201,
      },
    );
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
