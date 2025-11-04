"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const { classroomId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Fetch classroom students with analytics to list students
        const res = await fetch(`/api/classRoom/getStudentAnalytics?classroomId=${classroomId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to fetch students");

        const students = json.students || [];
        // For each student, fetch predicted score
        const preds = await Promise.all(
          students.map(async (s) => {
            try {
              const r = await fetch(`/api/ml/predictPerformance?studentId=${s.studentId}&classroomId=${classroomId}`);
              const j = await r.json();
              if (!r.ok) throw new Error();
              return { studentId: s.studentId, studentName: s.studentName, predictedScore: j.predictedScore };
            } catch {
              return { studentId: s.studentId, studentName: s.studentName, predictedScore: null };
            }
          })
        );
        setRows(preds);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (classroomId) load();
  }, [classroomId]);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen pt-[100px] px-5 min-lg:pl-[270px]">
      <h1 className="text-2xl font-bold mb-4">Predicted Performance</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Predicted Next Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.studentId} className="border-t">
                <td className="p-2">{r.studentName}</td>
                <td className="p-2">{r.predictedScore == null ? "-" : `${r.predictedScore}%`}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-2" colSpan={2}>No data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}


