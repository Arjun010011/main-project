const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create a teacher
  const teacher = await prisma.teacher.create({
    data: {
      fullName: "Demo Teacher",
      email: "teacher@example.com",
      password: "hashedpassword", // Use a real hash in production
      role: "teacher",
    },
  });

  // Create a student
  const student = await prisma.student.create({
    data: {
      fullName: "Demo Student",
      email: "student@example.com",
      password: "hashedpassword", // Use a real hash in production
      role: "student",
    },
  });

  // Create a classroom
  const classroom = await prisma.classroom.create({
    data: {
      className: "Physics 101",
      subjectName: "Physics",
      sectionName: "A",
      teacherId: teacher.id,
      students: { connect: { id: student.id } },
    },
  });

  // Create a question
  const question = await prisma.questions.create({
    data: {
      Subject: "Physics",
      Difficulty: "Easy",
      Question: "What is the speed of light?",
      Option_A: "3 x 10^8 m/s",
      Option_B: "3 x 10^6 m/s",
      Option_C: "3 x 10^5 km/s",
      Option_D: "3 x 10^7 km/s",
      Correct_Answer: "A",
      Explanation: "The speed of light in vacuum is 3 x 10^8 m/s.",
    },
  });

  // Create a question paper
  const questionPaper = await prisma.questionPaper.create({
    data: {
      classroomId: classroom.id,
      questionPaperName: "Sample KCET Paper",
      isLiveTest: false,
      questions: {
        create: [
          {
            questionId: question.id,
          },
        ],
      },
    },
    include: { questions: true },
  });

  console.log("Seeded demo data:", {
    teacher,
    student,
    classroom,
    question,
    questionPaper,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
