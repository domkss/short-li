"use client";
import { DeleteRequestSchema, LinkListItemType, Role } from "@/lib/common/Types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/atomic/SideBar";
import AdminDashboardPaginationView from "@/components/atomic/AdminDashboardPaginationView";
import { FiUsers, FiLink } from "react-icons/fi";

// Main Component
const AdminPage: React.FC = () => {
  const [selectedView, setSelectedView] = useState("Analytics");

  const [shortLinkItems, setShortLinkItems] = useState<ShortLinkItem[]>([]);
  const [userItems, setUserItems] = useState<UserItem[]>([]);

  const [numberOfUsers, setNumberOfUsers] = useState(0);
  const [numberOfShortenedLinks, setNumberOfShortenedLinks] = useState(0);

  //#region Authentication check and redirect
  const reactRouter = useRouter();
  const session = useSession();
  let isServer = typeof window === "undefined" ? true : false;
  if (
    !isServer &&
    (session.status !== "authenticated" ||
      !session.data ||
      !session.data.user ||
      !session.data.user.role.includes(Role.Admin))
  )
    reactRouter.replace("/login");
  //#endregion

  async function getPageData() {
    let response = await fetch("/api/admin");
    if (response.ok) {
      let data = await response.json();

      if (data.success) {
        let shortLinks: LinkListItemType[] = data.all_short_links_data;
        let userEmails: string[] = data.user_emails;
        setNumberOfShortenedLinks(shortLinks.length);
        setNumberOfUsers(userEmails.length);

        setShortLinkItems(
          shortLinks.map((link_data) => ({
            linkName: link_data.name,
            shortLink: link_data.shortURL,
            targetUrl: link_data.target_url,
            redirectCount: link_data.redirect_count,
          })),
        );

        setUserItems(userEmails.map((email) => ({ email: email })));
      } else {
        //Todo: Display Status Text or error message
        setShortLinkItems([]);
        setNumberOfShortenedLinks(0);
        setNumberOfUsers(0);
      }
    } else {
      //Todo: Display Status Text or error message
    }
  }

  async function deleteItem(item: { email?: string; shortLink?: string }) {
    let requestBody: DeleteRequestSchema = { user: item.email, url: item.shortLink };

    const userConfirmed = window.confirm("Are you sure you want to continue?");
    if (!userConfirmed) return;

    let response = await fetch("/api/admin", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      getPageData();
    } else {
      //Todo: Display Status Text or error message
    }
  }

  interface ShortLinkItem {
    linkName: string;
    shortLink: string;
    targetUrl: string;
    redirectCount: string;
  }

  const ShortLinkItemComponent: React.FC<ShortLinkItem> = (item) => (
    <div className="mb-2 rounded-lg bg-white p-4 shadow">
      {item.linkName && <div className=" text-center font-semibold">Name: {item.linkName}</div>}
      {item.shortLink && (
        <div className="mb-2 mt-1 border-b pb-2 text-center font-semibold text-blue-500">{item.shortLink}</div>
      )}

      {item.shortLink && (
        <div className="font-semibold">Click Count: {item.redirectCount ? item.redirectCount : 0}</div>
      )}
      {item.targetUrl && (
        <div className="mt-1">
          <span>Redirect Target:</span>
          <textarea className="w-full" rows={2} readOnly={true} value={item.targetUrl} />
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => deleteItem({ shortLink: item.shortLink })}
          className="mt-2 rounded-lg bg-red-500 p-2 text-white shadow hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );

  interface UserItem {
    email: string;
  }
  const UserItemComponent: React.FC<UserItem> = (item) => (
    <div className="mb-2 rounded-lg bg-white p-4 shadow">
      {item.email && <div className="mb-2 border-b pb-2 text-center font-semibold">Email: {item.email}</div>}
      <div className="text-center">
        <button
          onClick={() => deleteItem({ email: item.email })}
          className="mt-2 rounded-lg bg-red-500 p-2 text-white shadow hover:bg-red-600"
        >
          Delete
        </button>
        <button
          disabled
          onClick={() => deleteItem({ email: item.email })}
          className="ml-2 mt-2 rounded-lg bg-purple-500 p-2 text-white shadow hover:bg-red-600 disabled:bg-slate-500"
        >
          Disable
        </button>
      </div>
    </div>
  );

  interface AnalyticsCardProps {
    title: string;
    value: number;
    icon: JSX.Element;
    onClick?: () => void;
  }
  const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon, onClick }) => {
    return (
      <div
        className="min-w-56 rounded-lg border border-blue-300 bg-white p-7 text-center shadow-lg transition duration-300 hover:bg-blue-50"
        onClick={onClick}
      >
        <div className="mb-2 flex justify-center">{icon}</div>
        <div className="text-5xl font-bold text-blue-700">{value}</div>
        <div className="mt-2 text-lg text-gray-700">{title}</div>
      </div>
    );
  };

  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex flex-grow overflow-x-scroll bg-indigo-50">
      <SideBar selected={selectedView} setSelected={setSelectedView} />

      {/* Analytics View */}
      {selectedView === "Analytics" ? (
        <div className="container mx-auto h-full min-w-fit p-4">
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <AnalyticsCard
              title="Number of Users"
              value={numberOfUsers}
              icon={<FiUsers size={32} color="#1d4ed8" />}
              onClick={() => setSelectedView("Users")}
            />
            <AnalyticsCard
              title="Number of Shortened Links"
              value={numberOfShortenedLinks}
              icon={<FiLink size={32} color="#1d4ed8" />}
              onClick={() => setSelectedView("Links")}
            />
          </div>
        </div>
      ) : null}

      {/* Links View */}
      {selectedView === "Links" ? (
        <AdminDashboardPaginationView items={shortLinkItems} ItemComponent={ShortLinkItemComponent} />
      ) : null}
      {/* Users View */}
      {selectedView === "Users" ? (
        <AdminDashboardPaginationView items={userItems} ItemComponent={UserItemComponent} />
      ) : null}
    </main>
  );
};

export default AdminPage;
