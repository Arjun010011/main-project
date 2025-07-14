import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    // Get the teacher token from cookies
    const teacherToken = request.cookies.get("teacherToken")?.value;

    if (!teacherToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the teacher token
    let decoded;
    try {
      decoded = jwt.verify(teacherToken, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "teacher") {
      return NextResponse.json(
        { error: "Only teachers can access analytics" },
        { status: 403 }
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
        { status: 404 }
      );
    }

    // Get all question papers for this classroom
    const questionPapers = await prisma.questionPaper.findMany({
      where: {
        classroomId: classroomId,
        status: "completed",
      },
      include: {
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Calculate analytics
    const analytics = {
      totalTests: questionPapers.length,
      totalStudents: await prisma.student.count({
        where: {
          classrooms: {
            some: {
              id: classroomId,
            },
          },
        },
      }),
      averageScore: 0,
      testPerformance: [],
      scoreDistribution: {
        excellent: 0, // 90-100%
        good: 0, // 80-89%
        average: 0, // 70-79%
        belowAverage: 0, // 60-69%
        poor: 0, // <60%
      },
      participationRate: 0,
    };

    let totalSubmissions = 0;
    let totalScore = 0;

    questionPapers.forEach((paper) => {
      const submissions = paper.submissions;
      totalSubmissions += submissions.length;

      submissions.forEach((submission) => {
        const percentage =
          (submission.totalMarksObtained / submission.totalMarks) * 100;
        totalScore += percentage;

        // Categorize scores
        if (percentage >= 90) analytics.scoreDistribution.excellent++;
        else if (percentage >= 80) analytics.scoreDistribution.good++;
        else if (percentage >= 70) analytics.scoreDistribution.average++;
        else if (percentage >= 60) analytics.scoreDistribution.belowAverage++;
        else analytics.scoreDistribution.poor++;
      });

      // Test performance data
      const avgScore =
        submissions.length > 0
          ? submissions.reduce(
              (sum, sub) =>
                sum + (sub.totalMarksObtained / sub.totalMarks) * 100,
              0
            ) / submissions.length
          : 0;

      analytics.testPerformance.push({
        testName: paper.questionPaperName,
        testId: paper.id,
        totalStudents: submissions.length,
        averageScore: Math.round(avgScore * 100) / 100,
        totalMarks: paper.totalMarks,
        completedAt: paper.endedAt,
      });
    });

    // Calculate overall averages
    if (totalSubmissions > 0) {
      analytics.averageScore =
        Math.round((totalScore / totalSubmissions) * 100) / 100;
    }

    // Calculate participation rate
    const totalPossibleSubmissions =
      analytics.totalTests * analytics.totalStudents;
    if (totalPossibleSubmissions > 0) {
      analytics.participationRate = Math.round(
        (totalSubmissions / totalPossibleSubmissions) * 100
      );
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching class analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
