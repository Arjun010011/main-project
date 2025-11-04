import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const studentId = searchParams.get("studentId");

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 },
      );
    }

    // Get the teacher token from cookies
    const teacherToken = request.cookies.get("teacherToken")?.value;

    if (!teacherToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the teacher token
    let decoded;
    try {
      decoded = jwt.verify(teacherToken, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    if (decoded.role !== "teacher") {
      return NextResponse.json(
        { error: "Only teachers can access analytics" },
        { status: 403 },
      );
    }

    // Verify teacher owns this classroom
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: decoded.id,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or access denied" },
        { status: 404 },
      );
    }

    // Get all students in the classroom
    const students = await prisma.student.findMany({
      where: {
        classrooms: {
          some: {
            id: classroomId,
          },
        },
      },
      include: {
        submissions: {
          where: {
            questionPaper: {
              classroomId: classroomId,
              status: "completed",
            },
          },
          include: {
            questionPaper: {
              select: {
                id: true,
                questionPaperName: true,
                totalMarks: true,
                endedAt: true,
              },
            },
            Analytics: true,
          },
          orderBy: {
            submittedAt: "asc",
          },
        },
      },
    });

    // If specific student requested, filter to that student
    const targetStudents = studentId
      ? students.filter((student) => student.id === studentId)
      : students;

    const studentAnalytics = targetStudents.map((student) => {
      const submissions = student.submissions;
      const totalTests = submissions.length;

      let totalScore = 0;
      let highestScore = 0;
      let lowestScore = 100;
      const testScores = [];
      const performanceTrend = [];
      const detailedSubmissionAnalytics = [];
      submissions.forEach((submission, index) => {
        const percentage =
          (submission.totalMarksObtained / submission.totalMarks) * 100;
        totalScore += percentage;
        testScores.push(percentage);

        if (percentage > highestScore) highestScore = percentage;
        if (percentage < lowestScore) lowestScore = percentage;

        performanceTrend.push({
          testName: submission.questionPaper.questionPaperName,
          score: Math.round(percentage * 100) / 100,
          date: submission.submittedAt,
          testId: submission.questionPaper.id,
        });
        if (submission.Analytics) {
          detailedSubmissionAnalytics.push({
            submissionId: submission.id,
            questionPaperName: submission.questionPaper.questionPaperName,
            aiSuggestion: submission.Analytics.Ai_suggestion,
          });
        }
      });

      const averageScore =
        totalTests > 0 ? Math.round((totalScore / totalTests) * 100) / 100 : 0;
      const improvement =
        performanceTrend.length >= 2
          ? Math.round(
              (performanceTrend[performanceTrend.length - 1].score -
                performanceTrend[0].score) *
                100,
            ) / 100
          : 0;

      // Calculate score distribution for this student
      const scoreDistribution = {
        excellent: testScores.filter((score) => score >= 90).length,
        good: testScores.filter((score) => score >= 80 && score < 90).length,
        average: testScores.filter((score) => score >= 70 && score < 80).length,
        belowAverage: testScores.filter((score) => score >= 60 && score < 70)
          .length,
        poor: testScores.filter((score) => score < 60).length,
      };

      return {
        studentId: student.id,
        studentName: student.fullName,
        studentEmail: student.email,
        totalTests,
        averageScore,
        highestScore: Math.round(highestScore * 100) / 100,
        lowestScore: Math.round(lowestScore * 100) / 100,
        improvement,
        scoreDistribution,
        performanceTrend,
        participationRate: totalTests > 0 ? 100 : 0, // If they have submissions, they participated
        detailedSubmissionAnalytics,
      };
    });

    return NextResponse.json({
      students: studentAnalytics,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch student analytics" },
      { status: 500 },
    );
  }
}
