import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["teacher"],
      trim: true,
    },
    image: {
      type: String,
      required: true,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg",
    },
    classrooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classroom",
        trim: true,
      },
    ],
  },
  { timestamps: true }
);
export default mongoose.models.teacher || mongoose.model("teacher", userSchema);
