import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      trim: true,
    },
    sectionName: {
      type: String,
      trim: true,
    },
    teacherEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    questionPapers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionPaper",
      },
    ],
  },
  { timestamps: true }
);

export const Classroom =
  mongoose.models.Classroom || mongoose.model("Classroom", classroomSchema);
