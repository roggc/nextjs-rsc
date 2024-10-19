"use client";

import { Suspense } from "react";
import ErrorBoundary from "../error-boundary";
import Counter from "./counter";

export default function Greeting({ usernamePromise }) {
  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<>Loading...</>}>Hello {usernamePromise}</Suspense>
      </ErrorBoundary>
      <Counter />
    </>
  );
}
