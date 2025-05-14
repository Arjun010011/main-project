import { connectDB } from "@/lib/mongoose";
import { Classroom } from "@/models/classroom";
import mongoose from "mongoose";
export async function DELETE(req) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body._id;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 },
      );
    }
    const deleteClass = await Classroom.findOneAndDelete({
      _id: id,
    });
    if (!deleteClass) {
      return new Response(JSON.stringify({ message: "classroom not found" }), {
        status: 404,
      });
    }
    return new Response(
      JSON.stringify({ message: "classroom deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("something went wrong", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
