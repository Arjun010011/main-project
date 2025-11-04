"use client";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import storeUser from "@/lib/store/userStore";
import { useState } from "react";

export const GoogleAuthButton = ({
  text = "signup with google ",
  role = "student",
}) => {
  const { setTeacherInfo, setStudentInfo } = storeUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true); // Start loading

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const sendUser = await axios.post("/api/auth/googleAuthRoute", {
        email: user.email,
        fullName: user.displayName,
        role: role,
        image: user.photoURL,
      });

      if (sendUser.status === 200) {
        if (role === "student") {
          setStudentInfo(sendUser.data.user);
          setTimeout(() => {
            router.push("/studentDashboard");
          }, 1000);
        } else if (role === "teacher") {
          setTeacherInfo(sendUser.data.user);
          setTimeout(() => {
            router.push("/teacherDashboard");
          }, 1000);
        }
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        let errorMsg = error.response.data?.message || "Something went wrong";
        console.log(errorMsg);
      } else {
        let errorMsg = "something went wrong";
        console.log(errorMsg);
      }
    } finally {
      setLoading(false); // Stop loading, regardless of success or failure
    }
  };

  return (
    <div>
      <div className="w-full">
        <Button
          className={`w-[300px] flex items-center justify-center gap-2 ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
          variant="outline"
          onClick={handleClick}
          disabled={loading} // Disable the button while loading
        >
          {loading ? (
            <>
              {/* Spinner SVG from previous response */}
              <svg
                className="animate-spin h-5 w-5 text-gray-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <span>{text}</span>
          )}
        </Button>
      </div>
    </div>
  );
};
