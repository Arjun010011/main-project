import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    questionPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
    lowestScore: {
      type: Number,
      default: 0,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
    questionWisePerformance: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        correctAttempts: {
          type: Number,
          default: 0,
        },
        totalAttempts: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);
export const Analytics =
  mongoose.models.Analytics || mongoose.model("Analytics", analyticsSchema);
