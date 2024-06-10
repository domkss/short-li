"use client";
import { LinkListItemType, Role } from "@/lib/common/Types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, useEffect } from "react";

// Combined Item Type (optional fields)
interface ListItem {
  email?: string;
  linkName?: string;
  shortLink?: string;
  targetUrl?: string;
  redirectCount?: string;
}

// Item Component
const ItemComponent: React.FC<ListItem> = (item) => (
  <div className="mb-2 rounded-lg bg-white p-4 shadow">
    {item.email && <div className="font-semibold">User: {item.email}</div>}
    {item.linkName && <div className="font-semibold">Name: {item.linkName}</div>}
    {item.shortLink && <div className="font-semibold">Short Link: {item.shortLink}</div>}
    {item.targetUrl && <div className="font-semibold">Link Target: {item.targetUrl}</div>}
    {item.shortLink && <div className="font-semibold">Click Count: {item.redirectCount ? item.redirectCount : 0}</div>}
  </div>
);

// Main Component
const AdminPage: React.FC = () => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [numberOfUsers, setNumberOfUsers] = useState(0);
  const [numberOfShortenedLinks, setNumberOfShortenedLinks] = useState(0);

  const [filter, setFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

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

  // Handle filter change
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  // Filtered and paginated items
  const filteredItems = items.filter(
    (item) => (item.email && item.email.includes(filter)) || (item.shortLink && item.shortLink.includes(filter)),
  );

  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  async function getPageData() {
    let response = await fetch("/api/admin");
    if (response.ok) {
      let data = await response.json();

      if (data.success) {
        let shortLinks: LinkListItemType[] = data.all_short_links_data;
        let userEmails: string[] = data.user_emails;
        setNumberOfShortenedLinks(shortLinks.length);
        setNumberOfUsers(userEmails.length);

        let listItems: ListItem[] = [];
        listItems.push(...userEmails.map((email) => ({ email: email })));
        listItems.push(
          ...shortLinks.map((link_data) => ({
            linkName: link_data.name,
            shortLink: link_data.shortURL,
            targetUrl: link_data.target_url,
            redirectCount: link_data.redirect_count,
          })),
        );

        setItems(listItems);
      } else {
        //Todo: Display Status Text or error message
        setItems([]);
        setNumberOfShortenedLinks(0);
        setNumberOfUsers(0);
      }
    } else {
      //Todo: Display Status Text or error message
    }
  }

  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container mx-auto p-4">
      {/* Statistics */}
      <div className="mb-8 flex justify-center">
        <div className="grid w-full max-w-2xl grid-cols-1 gap-1 md:grid-cols-2">
          <div className="p-6 text-center">
            <div className="text-5xl font-bold text-blue-700">{numberOfUsers}</div>
            <div className="mt-2 text-lg text-gray-700">Number of Users</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-5xl font-bold text-blue-700">{numberOfShortenedLinks}</div>
            <div className="mt-2 text-lg text-gray-700">Number of Shortened Links</div>
          </div>
        </div>
      </div>
      {/* Filter Input */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter"
          className="min-w-[50%] rounded-lg border border-gray-300 p-3 shadow"
        />
      </div>
      {/* Scrollable List */}
      <div className="mb-4 h-64 overflow-y-scroll">
        {paginatedItems.map((item, index) => (
          <ItemComponent key={index} {...item} />
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white shadow disabled:opacity-50"
        >
          Previous
        </button>
        <div className="text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white shadow disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default AdminPage;
