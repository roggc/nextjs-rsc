"use client";

import { Suspense, useMemo } from "react";
import { usePropsChangedKey } from "@/app/hooks";
import useSWR from "swr";

const callActionAsync = (action, props) =>
  new Promise((r) => setTimeout(async () => r(await action(props))));

const Error = ({ errorMessage }) => <>Something went wrong: {errorMessage}</>;

const getReader = () => {
  let done = false;
  let promise = null;
  let value;
  return {
    read: (fetcher) => {
      if (done) {
        return value;
      }
      if (promise) {
        throw promise;
      }
      promise = new Promise(async (resolve) => {
        try {
          value = await fetcher();
        } catch (error) {
          value = <Error errorMessage={error.message} />;
        } finally {
          done = true;
          promise = null;
          resolve();
        }
      });

      throw promise;
    },
  };
};

const Read = ({ fetcher, reader }) => {
  return reader.read(fetcher);
};

export default function Action({
  action,
  children = <>loading...</>,
  isSWR = false,
  ...props
}) {
  const propsChangedKey = usePropsChangedKey(...Object.values(props));

  const fetcher = () => callActionAsync(action, props);
  const reader = useMemo(() => getReader(), [propsChangedKey]);

  const propsForSWR = useMemo(() => props, [propsChangedKey]);
  const swrArgs = useMemo(() => [action, propsForSWR], [action, propsForSWR]);
  const fetcherSWR = ([action, props]) => fetcher(action, props);
  const { data } = useSWR(swrArgs, fetcherSWR, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    suspense: true,
  });

  return (
    <Suspense fallback={children}>
      {isSWR ? data : <Read fetcher={fetcher} reader={reader} />}
    </Suspense>
  );
}
