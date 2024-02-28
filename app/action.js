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
    read: (action, props) => {
      if (done) {
        return value;
      }
      if (promise) {
        throw promise;
      }
      promise = new Promise(async (resolve) => {
        try {
          value = await callActionAsync(action, props);
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

const Read = ({ action, props, reader }) => {
  return reader.read(action, props);
};

export default function Action({
  action,
  children = <>loading...</>,
  isSWR = true,
  ...props
}) {
  const propsChangedKey = usePropsChangedKey(...Object.values(props));

  const reader = useMemo(() => getReader(), [propsChangedKey]);

  const propsForSWR = useMemo(() => props, [propsChangedKey]);
  const swrArgs = useMemo(() => [action, propsForSWR], [action, propsForSWR]);
  const fetcher = ([action, props]) => callActionAsync(action, props);
  const { data } = useSWR(swrArgs, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    suspense: true,
  });

  return (
    <Suspense fallback={children}>
      {isSWR ? data : <Read action={action} props={props} reader={reader} />}
      {/* <Read action={action} props={props} reader={reader} /> */}
    </Suspense>
  );
}
