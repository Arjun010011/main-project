import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
export async function POST(req) {
  try {
    const { fullName, email, password } = await req.json();
    const role = "student";
    const userExist = await prisma.student.findUnique({ where: { email } });
    if (userExist) {
      return new Response(
        JSON.stringify({ message: "user already exists", status: 500 }),
        { status: 500 },
      );
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const user = await prisma.student.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
      },
    });
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
