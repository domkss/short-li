"use client";
import React, { useState, ChangeEvent } from "react";

// Define Types for Users and Short Links
interface User {
  email: string;
}

interface ShortLink {
  link: string;
  user?: string;
}

// Combined Item Type (optional fields)
interface Item {
  email?: string;
  link?: string;
  user?: string;
}

// Dummy Data for Users and Short Links
const users: User[] = [{ email: "user1@example.com" }, { email: "user2@example.com" }, { email: "user3@example.com" }];

const shortLinks: ShortLink[] = [
  { link: "http://sli.ink/abcd", user: "user1@example.com" },
  { link: "http://sli.ink/efgh" },
  { link: "http://sli.ink/ijkl", user: "user2@example.com" },
];

// Combine Users and Short Links into a Single List
const items: Item[] = [
  ...users.map((user) => ({ email: user.email })),
  ...shortLinks.map((link) => ({ link: link.link, user: link.user })),
];

// Item Component
const ItemComponent: React.FC<Item> = ({ email, link, user }) => (
  <div className="mb-2 rounded-lg bg-white p-4 shadow">
    {email && <div className="font-semibold">Email: {email}</div>}
    {link && <div className="font-semibold">Link: {link}</div>}
    {user && <div className="text-sm text-gray-500">Created by: {user}</div>}
  </div>
);

// Main Component
const AdminPage: React.FC = () => {
  const [filter, setFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Handle filter change
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filtered and paginated items
  const filteredItems = items.filter(
    (item) => (item.email && item.email.includes(filter)) || (item.link && item.link.includes(filter)),
  );

  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <main className="container mx-auto p-4">
      {/* Statistics */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-100 p-6 text-center shadow">
          <div className="text-5xl font-bold text-blue-500">1500</div>
          <div className="mt-2 text-gray-600">Number of Users</div>
        </div>
        <div className="rounded-lg bg-blue-100 p-6 text-center shadow">
          <div className="text-5xl font-bold text-blue-500">500</div>
          <div className="mt-2 text-gray-600">Number of Shortened Links</div>
        </div>
      </div>
      {/* Filter Input */}
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter"
          className="w-full rounded-lg border border-gray-300 p-3 shadow"
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
