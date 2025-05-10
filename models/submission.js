const examSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    questionPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        marksObtained: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalMarksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
mongoose.models.ExamSubmission ||
  mongoose.model("ExamSubmission", examSubmissionSchema);
