import React from "react";

export default function AdminPage() {
  return (
    <main>
      {/*Statistics*/}
      <div className="flex flex-row">
        <div className="flex flex-col p-4 text-center">
          <div className="text-5xl font-bold text-blue-500">1500</div>
          <div>Number of Users</div>
        </div>
        <div className="flex flex-col p-4 text-center">
          <div className="text-5xl font-bold text-blue-500">500</div>
          <div>Number of shortened links</div>
        </div>
      </div>
    </main>
  );
}
