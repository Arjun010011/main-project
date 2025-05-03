import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
export const GoogleAuthButton = ({ text = "signup with google " }) => {
  const router = useRouter();
  const handleClick = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const sendUser = await axios.post("/api/auth/googleAuthRoute", user);
      if (sendUser.status === 200) {
        setTimeout(() => {
          router.push("/studentDashboard");
        }, 1000);
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
    }
  };
  return (
    <div>
      <div className="w-full">
        <Button className="w-[300px]" variant="outline" onClick={handleClick}>
          {text}
        </Button>
      </div>
    </div>
  );
};
