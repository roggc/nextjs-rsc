"use client";

import { Suspense, useMemo } from "react";
import { usePropsChangedKey } from "@/app/hooks";
import useSWR from "swr";

const fetcher = (action, props) =>
  new Promise((r) => setTimeout(async () => r(await action(props))));

const fetcherSWR = ([action, props]) => fetcher(action, props);

const ReadSWR = ({ swrArgs, fetcher }) => {
  return useSWR(swrArgs, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    suspense: true,
  }).data;
};

export default function Action({
  action,
  children = <>loading...</>,
  ...props
}) {
  const propsChangedKey = usePropsChangedKey(...Object.values(props));

  const propsForSWR = useMemo(() => props, [propsChangedKey, softKey]);
  const swrArgs = useMemo(() => [action, propsForSWR], [action, propsForSWR]);

  return (
    <Suspense fallback={children}>
      <ReadSWR swrArgs={swrArgs} fetcher={fetcherSWR} />
    </Suspense>
  );
}
