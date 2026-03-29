import React from "react";
import Dashboard from "../components/Dashboard";

const Page = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
   
      <div className="flex-1 flex flex-col overflow-hidden">
    
        <main className="flex-1 overflow-y-auto p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default Page;
