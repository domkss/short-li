"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SocialMediaRefBar from "@/components/atomic/SocialMediaRefBar";
import OrderableListLayout from "@/components/atomic/OrderableListLayout";

export default function CustomBioDashboard() {
  /*
  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (!isServer && (session.status !== "authenticated" || !session.data || !session.data.user))
    reactRouter.replace("/login");
*/
  return (
    <main className="flex min-w-full flex-col">
      <div className="flex flex-col p-4">
        <div className="flex justify-center p-4">Picture</div>
        <div className="my-2 flex justify-center">
          <div className="min-w-xl mb-6 text-gray-800 md:basis-2/3 xl:basis-1/3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum aliquam felis a nisi luctus, eget
            convallis urna volutpat. Sed ullamcorper elit id enim lacinia, at feugiat lorem efficitur.
          </div>
        </div>
        <div className="flex justify-center">
          <OrderableListLayout className="flex basis-full flex-col md:basis-2/3 xl:basis-1/3">
            <div className="mt-2 rounded-md border border-gray-300 bg-cyan-200 px-5 py-3 text-center shadow-sm" id="1">
              Twitter
            </div>

            <div className="mt-2 rounded-md border border-gray-300 bg-blue-200 px-5 py-3 text-center shadow-sm" id="2">
              Facebook
            </div>
          </OrderableListLayout>
        </div>

        <div className="flex justify-center py-2">
          <button className="basis-full rounded-md border border-gray-300 px-5 py-3 shadow-sm md:basis-2/3 xl:basis-1/3">
            + Add
          </button>
        </div>

        <div className="mt-12 flex justify-center">
          <SocialMediaRefBar />
        </div>
      </div>
    </main>
  );
}
