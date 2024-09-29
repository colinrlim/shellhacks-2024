// components/AuthListener.tsx
import { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useAppDispatch } from "../store";
import { setUser, clearUser } from "../store/slices/userSlice";

const AuthListener: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      if (user.sub) {
        dispatch(
          setUser({
            auth0Id: user.sub,
            name: user.name || "",
            email: user.email || "",
            // Add other fields as necessary
          })
        );
      } else {
        dispatch(clearUser());
      }
    } else {
      dispatch(clearUser());
    }
  }, [user, dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Error: {error.message} <br />
        {error.stack}
      </div>
    );

  return null; // This component doesn't render anything
};

export default AuthListener;
