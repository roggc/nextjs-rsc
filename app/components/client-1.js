"use client";

import Action from "@/app/action";
import { greeting } from "@/app/actions/greeting";
import { useState } from "react";

export default function Client1() {
  const [userId, setUserId] = useState(1);

  return (
    <>
      <Action action={greeting} userId={userId} isSWR />
      <button
        onClick={() => {
          setUserId(2);
        }}
      >
        click
      </button>
    </>
  );
}
