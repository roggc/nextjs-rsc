"use client";

import { Suspense, useMemo } from "react";
import { usePropsChangedKey } from "@/app/hooks";
import useSWR from "swr";

const callActionAsync = (action, props) =>
  new Promise((r) => setTimeout(async () => r(await action(props))));

export default function Action({
  action,
  children = <>loading...</>,
  ...props
}) {
  const propsChangedKey = usePropsChangedKey(...Object.values(props));

  const propsForSWR = useMemo(() => props, [propsChangedKey, softKey]);
  const swrArgs = useMemo(() => [action, propsForSWR], [action, propsForSWR]);
  const fetcher = ([action, props]) => callActionAsync(action, props);
  const { data } = useSWR(swrArgs, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    suspense: true,
  });

  return <Suspense fallback={children}>{data}</Suspense>;
}
