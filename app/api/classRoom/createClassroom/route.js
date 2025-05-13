import { connectDB } from "@/lib/mongoose";
import { Classroom } from "@/models/classroom";
export async function POST(req) {
  try {
    await connectDB();
    const { className, subjectName, sectionName, teacherEmail } =
      await req.json();
    if (!className || !teacherEmail) {
      return new Response(
        JSON.stringify({ message: "ClassName or teacherEmail is not present" }),
        {
          status: 400,
        }
      );
    }
    let classRoomExist = await Classroom.findOne({ className });
    if (classRoomExist) {
      return new Response(
        JSON.stringify({
          message: "classroom with the same name already exist",
        }),
        {
          status: 409,
        }
      );
    }
    const newClass = await new Classroom({
      className,
      subjectName,
      sectionName,
      teacherEmail,
    }).save();
    console.log(newClass);
    return new Response(
      JSON.stringify({
        message: "classroom created successfully !!",
        classroomInfo: newClass,
      }),
      {
        status: 201,
      }
    );
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
