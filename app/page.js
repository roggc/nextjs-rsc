"use client";

import Example from "@/app/components/example";
import { useState } from "react";

export default function Home() {
  const [isStart, setIsStart] = useState(false);
  return (
    <>
      <button onClick={() => setIsStart(true)}>start</button>
      {isStart && <Example />}
    </>
  );
}
