import { connectDB } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: "connected to mongodb successfully" });
  } catch (error) {
    return new Repsonse("failed", { status: 500 });
  }
}
