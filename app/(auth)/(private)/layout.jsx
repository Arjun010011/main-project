"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken"; // Optional: For decoding JWT

export default function StudentLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get the JWT token (can be from cookies or localStorage)
    const token = localStorage.getItem("studentToken"); // Or from cookies

    if (token) {
      try {
        // Verify the JWT token
        jwt.verify(token, process.env.JWT_SECRET); // Secret key from .env
        setIsAuthenticated(true);
      } catch (error) {
        console.error("JWT verification failed", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    // Redirect user to login page if not authenticated
    if (isAuthenticated === false) {
      router.push("/"); // Redirect to your login page
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    // Optionally, you can show a loading state while checking authentication
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        children // Render the protected content
      ) : (
        <div>Access Denied! Please log in to view this page.</div>
      )}
    </div>
  );
}
