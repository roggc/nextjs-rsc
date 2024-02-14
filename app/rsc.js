"use client";

import { Suspense } from "react";

export default function RSC({ action, fallback = <>loading...</> }) {
  return <Suspense fallback={fallback}>{action()}</Suspense>;
}
