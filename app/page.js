"use client";

import Client1 from "@/app/components/client-1";
import { useState } from "react";

export default function Home() {
  const [isStart, setIsStart] = useState(false);
  return (
    <>
      <button onClick={() => setIsStart(true)}>start</button>
      {isStart && <Client1 />}
    </>
  );
}
