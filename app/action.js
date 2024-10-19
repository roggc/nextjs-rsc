"use client";

import { Suspense, useMemo } from "react";

const Caller = ({ action, props, call }) => {
  return call(action, props);
};

export default function Action({
  action,
  children = <>Loading...</>,
  ...props
}) {
  const call = useMemo(() => {
    let result;
    let promise;
    return (action, props) => {
      if (result !== undefined) {
        return result;
      }
      if (!promise) {
        promise = Promise.resolve()
          .then(() => action(props))
          .then((res) => {
            result = res;
          });
      }
      throw promise;
    };
  }, [...Object.values(props)]);

  return (
    <Suspense fallback={children}>
      <Caller action={action} props={props} call={call} />
    </Suspense>
  );
}
