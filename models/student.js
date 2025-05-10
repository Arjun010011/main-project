const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    classrooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classroom",
        required: true,
      },
    ],
  },
  { timestamps: true }
);
export const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
