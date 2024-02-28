"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Client1 from "@/app/components/client-1";
import { useState } from "react";

const queryClient = new QueryClient();

export default function Home() {
  const [isStart, setIsStart] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <button onClick={() => setIsStart(true)}>start</button>
      {isStart && <Client1 />}
    </QueryClientProvider>
  );
}
