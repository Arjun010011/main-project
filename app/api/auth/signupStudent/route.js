import User from "@/models/user.js";
import { connectDB } from "@/lib/mongoose";
import bcryptjs from "bcryptjs";
export async function POST(req) {
  try {
    const { fullName, email, password } = await req.json();
    const role = "student";
    const userExist = await User.findOne({ email });
    if (userExist) {
      return new Response(
        JSON.stringify({ message: "user already exists", status: 500 }),
      );
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    await connectDB();
    const user = await new User({
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
    );
  } catch (error) {
    console.error("soemthing went wrong", error);
    return new Response(
      JSON.stringify({
        message: "something went wrong",
        errormsg: error,
        status: 500,
      }),
    );
  }
}
