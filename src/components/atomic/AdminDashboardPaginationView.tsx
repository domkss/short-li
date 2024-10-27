import React, { useState } from "react";

// Define the props for PaginationView
interface AdminDashboardPaginationViewProps<T> {
  items: T[]; // Array of items to paginate
  ItemComponent: React.ComponentType<T>; // The component to render each item
}

function AdminDashboardPaginationView<T>({ items, ItemComponent }: AdminDashboardPaginationViewProps<T>) {
  const [filter, setFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Filtered items based on the filter input
  const filteredItems = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filter.toLowerCase()));

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle filter input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to the first page on filter change
  };

  return (
    <div className="flex h-full flex-grow flex-col p-2">
      {/* Filter Input */}
      <div className="my-6 flex justify-center">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter"
          className="min-w-[50%] rounded-lg border border-gray-300 p-3 shadow"
        />
      </div>
      {/* Scrollable List */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {paginatedItems.map((item, index) => (
          <ItemComponent key={index} {...item} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mb-4 flex flex-col items-center justify-center">
        <div className="mb-2 text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex w-full max-w-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="mx-1 flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white shadow disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="mx-1 flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white shadow disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPaginationView;
