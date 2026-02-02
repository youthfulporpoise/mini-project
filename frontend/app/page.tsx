"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    redirect("/Overview");
  }, []);

  return <div></div>;
}
