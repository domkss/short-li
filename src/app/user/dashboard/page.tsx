import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (session && session.user) {
    return <div> Welcome: {session.user?.email}</div>;
  } else return <div>Unauthorized</div>;
}
