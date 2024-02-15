"use client";

import Action from "@/app/action";
import { greeting } from "@/app/actions/greeting";
import { useEffect, useState } from "react";

export default function Client1() {
  const [userId, setUserId] = useState(1);
  const [softKey, setSoftKey] = useState(0);

  useEffect(() => {
    setSoftKey((k) => k + 1);
  }, [userId]);

  return (
    <>
      <Action action={greeting} userId={userId} softKey={softKey} />
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
