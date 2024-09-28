import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import React from "react";

// Define a generic type for the higher-order component
const withProtected = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ComponentWithProtection = (props: P) => {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push("/api/auth/login");
      }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
      return <div>Loading...</div>;
    }

    // Spread the props correctly with the right type
    return <WrappedComponent {...props} />;
  };

  return ComponentWithProtection;
};

export default withProtected;
