"use client";

import Action from "@/app/action";
import { greeting } from "@/app/actions/greeting";
import { useState } from "react";

export default function Example() {
  const [userId, setUserId] = useState(1);

  return (
    <>
      <Action action={greeting} userId={userId} />
      <button
        onClick={() => {
          setUserId((currentValue) => currentValue + 1);
        }}
      >
        click
      </button>
    </>
  );
}
