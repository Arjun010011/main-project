import { connectDB } from "@/lib/mongoose";
import { Classroom } from "@/models/classroom";

export async function POST(req) {
  try {
    connectDB();
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ message: "no email found" }), {
        status: 400,
      });
    }
    const classRooms = await Classroom.find({ teacherEmail: email }).sort({
      createdAt: -1,
    });
    return new Response(
      JSON.stringify({ message: "classrooms found!!", classRooms: classRooms }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "internal server error" }), {
      status: 500,
    });
  }
}
