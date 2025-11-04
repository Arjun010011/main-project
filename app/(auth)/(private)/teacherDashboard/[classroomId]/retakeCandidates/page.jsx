"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const { classroomId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/ml/retakeCandidates?classroomId=${classroomId}&max=50`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to fetch");
        setData(json.candidates || []);
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
      <h1 className="text-2xl font-bold mb-4">Retake Candidates</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Tests</th>
              <th className="p-2 text-left">EMA</th>
              <th className="p-2 text-left">Trend (slope)</th>
              <th className="p-2 text-left">Last Score</th>
              <th className="p-2 text-left">Reasons</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.studentId} className="border-t">
                <td className="p-2">{r.studentName}</td>
                <td className="p-2">{r.tests}</td>
                <td className="p-2">{r.ema == null ? "-" : `${r.ema}%`}</td>
                <td className="p-2">{r.slope}</td>
                <td className="p-2">{r.lastScore}%</td>
                <td className="p-2">{r.reasons.join(", ")}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td className="p-2" colSpan={6}>No candidates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}


