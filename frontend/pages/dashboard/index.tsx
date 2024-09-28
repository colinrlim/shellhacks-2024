// app/dashboard/page.tsx (or pages/dashboard.tsx if you're in Next.js 12)

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useUser } from "@auth0/nextjs-auth0/client";
import { withProtected } from "@/hoc";

function Dashboard() {
  const { user } = useUser();

  return (
    <div>
      <h1>Hello, {user?.name}</h1>
      <p>This is the dashboard.</p>
      <a href="/api/auth/logout">Logout</a>
    </div>
  );
}

export default withProtected(Dashboard);

export const getServerSideProps = withPageAuthRequired();
