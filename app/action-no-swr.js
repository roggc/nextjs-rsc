"use client";

import { Suspense, useMemo } from "react";
import { usePropsChangedKey } from "@/app/hooks";

const callAction = (action, props) =>
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
          value = await callAction(action, props);
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
  ...props
}) {
  const propsChangedKey = usePropsChangedKey(...Object.values(props));
  const reader = useMemo(() => getReader(), [propsChangedKey]);

  return (
    <Suspense fallback={children}>
      <Read action={action} props={props} reader={reader} />
    </Suspense>
  );
}
