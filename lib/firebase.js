// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCusK-svfZNT6MenThQDIPlzOCVT3SRLxs",
  authDomain: "auth-a30db.firebaseapp.com",
  projectId: "auth-a30db",
  storageBucket: "auth-a30db.firebasestorage.app",
  messagingSenderId: "818713193898",
  appId: "1:818713193898:web:0566a09c349b19a4b74fd3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
