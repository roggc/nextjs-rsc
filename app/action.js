"use client";

import { Suspense, useState, useEffect } from "react";
import { usePropsChangedKey } from "@/app/hooks";

export default function Action({
  action,
  fallback = <>loading...</>,
  ...props
}) {
  const [JSX, setJSX] = useState(fallback);
  const propsChangedKey = usePropsChangedKey(...Object.values(props));

  useEffect(() => {
    setJSX(<Suspense fallback={fallback}>{action(props)}</Suspense>);
  }, [propsChangedKey, action]);

  return JSX;
}
