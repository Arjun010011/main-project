import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
export const GoogleAuthButton = () => {
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
      <div>
        <button type="button" onClick={handleClick}>
          signin with google
        </button>
      </div>
    </div>
  );
};
