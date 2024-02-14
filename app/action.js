"use client";

import { Suspense, useState, useEffect } from "react";

export default function Action({
  action,
  fallback = <>loading...</>,
  ...props
}) {
  const [JSX, setJSX] = useState(fallback);

  useEffect(() => {
    setJSX(<Suspense fallback={fallback}>{action(props)}</Suspense>);
  }, []);

  return JSX;
}
