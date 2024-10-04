// @/hoc/withProtected

// Imports
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppDispatch } from "../store";
import { clearUser, setUser } from "@/store/slices/userSlice";

// * With Protected HOC
/**
 * This component is used to protect routes that require authentication.
 */
const withProtected = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ComponentWithProtection = (props: P) => {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Sets user state information if user is authenticated
    useEffect(() => {
      if (!isLoading && !user) {
        router.push("api/auth/login");
      } else {
        if (user && user.sub) {
          dispatch(
            setUser({
              auth0Id: user.sub,
              name: user.name || "",
              email: user.email || "",
            })
          );
        } else {
          dispatch(clearUser());
        }
      }
    }, [user, isLoading, router, dispatch]);

    if (isLoading || !user) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithProtection;
};

export default withProtected;
