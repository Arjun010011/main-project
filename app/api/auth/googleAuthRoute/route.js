import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, role, fullName, image } = await req.json();

    if (!email || !role || !fullName) {
      return new Response(
        JSON.stringify({
          message:
            "Missing required authentication fields (email, role, fullName).",
        }),
        { status: 400 }
      );
    }

    let userExist;
    let model;

    // 1. Determine the Prisma model based on the requested role
    if (role === "teacher") {
      model = prisma.teacher;
    } else if (role === "student") {
      model = prisma.student;
    } else {
      return new Response(
        JSON.stringify({ message: "Invalid user role specified." }),
        { status: 400 }
      );
    }

    // 2. Check if user exists in the determined model
    userExist = await model.findUnique({
      where: { email },
    });

    // 3. Create user if they don't exist
    if (!userExist) {
      // Generate a random password for users created via Google Auth
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = bcryptjs.hashSync(randomPassword, 10);

      userExist = await model.create({
        data: {
          email,
          fullName,
          image,
          password: hashedPassword, // Storing a hashed random password
          role: role,
        },
      });
    }

    // 4. Generate the JWT (Unified Logic)
    // The JWT payload includes the user's role and ID, regardless of model
    const token = jwt.sign(
      { id: userExist.id, email: userExist.email, role: userExist.role },
      process.env.JWT_SECRET,
      { expiresIn: "9d" }
    );

    // 5. Serialize the token into a unified cookie
    const cookie = serialize("authToken", token, {
      // 👈 Unified Cookie Name
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // 6. Remove password before returning user
    const { password: _password, ...passLessUser } = userExist;

    // 7. Return the success response
    return new Response(
      JSON.stringify({
        message: `${userExist.role} authenticated successfully`,
        user: passLessUser,
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("Google Auth API Error:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error during authentication.",
      }),
      { status: 500 }
    );
  }
}
