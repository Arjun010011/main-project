import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
export const GoogleAuthButton = ({ text = "signup with google " }) => {
  const handleClick = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user.email, user.displayName);
    } catch (error) {
      console.error(error);
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
