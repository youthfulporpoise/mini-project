import React from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import Dashboard from "../components/Dashboard";

const Page = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default Page;
