"use client";

import { Suspense, useState, useEffect } from "react";

export default function Action({ action, fallback = <>loading...</> }) {
  const [JSX, setJSX] = useState(fallback);
  useEffect(() => {
    setJSX(<Suspense fallback={fallback}>{action()}</Suspense>);
  }, []);
  return JSX;
}
