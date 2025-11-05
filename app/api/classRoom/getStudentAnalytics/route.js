import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const requestedStudentId = searchParams.get("studentId"); // Renamed for clarity

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    // 2. Get the token from cookies (support both teacher and student tokens)
    const teacherToken = request.cookies.get("teacherToken")?.value;
    const studentToken = request.cookies.get("studentToken")?.value;
    const authToken = teacherToken || studentToken;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 3. Verify the token
    let decoded;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { id: userId, role: userRole } = decoded;

    // --- 4. Access Control Logic ---
    let accessGranted = false;
    let finalStudentIdFilter = requestedStudentId;

    if (userRole === "teacher") {
      // Teacher Access: Must own the classroom being requested.
      const classroom = await prisma.classroom.findFirst({
        where: {
          id: classroomId,
          teacherId: userId, // Check if teacherId matches the user ID
        },
      });

      if (classroom) {
        accessGranted = true;
      }
    } else if (userRole === "student") {
      // Student Access: Must be requesting ONLY their own data and be in the classroom.
      if (requestedStudentId && requestedStudentId === userId) {
        // Verify the student is actually in this classroom
        const student = await prisma.student.findFirst({
          where: {
            id: userId,
            classrooms: {
              some: {
                id: classroomId,
              },
            },
          },
        });

        if (student) {
          // Set the student ID filter to ensure only their data is fetched
          finalStudentIdFilter = userId;
          accessGranted = true;
        }
      }
    }

    if (!accessGranted) {
      return NextResponse.json(
        { error: "Access denied or resource not found." },
        { status: 403 }
      );
    }
    // --- End Access Control Logic ---

    // 5. Data Fetching (Unified for both roles)
    // The query now runs if access is granted, and the logic is the same.
    let studentWhereClause = {
      classrooms: {
        some: {
          id: classroomId,
        },
      },
    };

    // If a specific student ID filter is set (by teacher or by student for self-access)
    if (finalStudentIdFilter) {
      studentWhereClause.id = finalStudentIdFilter;
    }

    // Get the required students based on the filter
    const students = await prisma.student.findMany({
      where: studentWhereClause,
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
    // NOTE: This filter is largely redundant now due to the `finalStudentIdFilter` applied above,
    // but kept for safety/legacy if the Prisma query was complex.
    const targetStudents = finalStudentIdFilter
      ? students.filter((student) => student.id === finalStudentIdFilter)
      : students;

    // --- 6. Data Processing (Unchanged) ---
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
                100
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
        participationRate: totalTests > 0 ? 100 : 0,
        detailedSubmissionAnalytics,
      };
    });
    // --- End Data Processing ---

    return NextResponse.json({
      students: studentAnalytics,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch student analytics" },
      { status: 500 }
    );
  }
}
