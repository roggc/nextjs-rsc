# Action client component in NextJS 14

What we want:

1. We are on a client component and we want to render another client component with data passed as props, but this data must be fetched from the server. How do we do it?

```javascript
"use client";
import AnotherClientComponent from "./another-client-component";

export default function AClientComponent(){
  // ...
  return <AnotherClientComponent prop1={/*this data must be fetched in the server*/} /*more props*/>;
}
```

The idea:

2. Use server actions to return a client component with data fetched in the server passed as props.

So server action is like this, for example:

```javascript
"use server";

import Greeting from "@/app/action-components/greeting";
import MyError from "@/app/action-components/my-error";

const DELAY = 500;

const users = [
  { id: 1, username: "roggc" },
  { id: 2, username: "roger" },
];

export async function greeting({ userId }) {
  try {
    const username = await new Promise((r) => {
      setTimeout(() => {
        const user = users.find((u) => u.id === userId);
        if (user) {
          r(user.username);
        }
      }, DELAY);
    });

    // throw new Error("crash!");
    return <Greeting username={username} />;
  } catch (error) {
    return <MyError errorMessage={error.message} />;
  }
}
```

`Greeting` and `MyError` are simple client components that accepts data as props. Like this:

```javascript
"use client";

export default function Greeting({ username }) {
  return <>hello {username}</>;
}
```

and

```javascript
"use client";

export default function MyError({ errorMessage }) {
  return <>Something went wrong: {errorMessage}</>;
}
```

3. How do we call these server actions that return client components from within another client component?

```javascript
"use client";
import { greeting } from "@/app/actions";
import { Suspense } from "react";

export default function AClientComponent() {
  return (
    <Suspense fallback={<>loading...</>}>{greeting({ userId: 1 })}</Suspense>
  );
}
```

The above works, but gives the following warning: `Warning: Cannot update a component ('Router') while rendering a different component ('Client1'). To locate the bad setState() call inside 'Client1', follow the stack trace as described in https://reactjs.org/link/setstate-in-render`.

4. How do we get ride off of this warning?

The way I have found is with this:

```javascript
"use client";
import { greeting } from "@/app/actions";
import { Suspense } from "react";

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

export default function AClientComponent() {
  return (
    <Suspense fallback={<>loading...</>}>
      <Read action={greeting} props={{ userId }} reader={getReader()} />
    </Suspense>
  );
}
```

5. So we can make a client component like this:

```javascript
"use client";

import { Suspense, useMemo } from "react";
import { usePropsChangedKey } from "@/app/hooks";

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
```

being the hook `usePropsChangedKey` like this:

```javascript
import { useState, useEffect, useRef } from "react";

export function usePropsChangedKey(...args) {
  const [propsChangedKey, setPropsChangedKey] = useState(0);
  const isFirstRenderRef = useRef(false);

  useEffect(() => {
    isFirstRenderRef.current = true;
  }, []);

  useEffect(() => {
    if (!isFirstRenderRef.current) {
      setPropsChangedKey((k) => k + 1);
    } else {
      isFirstRenderRef.current = false;
    }
  }, [...args]);

  return propsChangedKey;
}
```

6. Now when we want to call a server action that returns a client component we do it with the `Action` client component we have just defined:

```javascript
"use client";

import Action from "@/app/action";
import { greeting } from "@/app/actions/greeting";
import { useState } from "react";

export default function Client1() {
  const [userId, setUserId] = useState(1);

  return (
    <>
      <Action action={greeting} userId={userId} />
      <button
        onClick={() => {
          setUserId(2);
        }}
      >
        click
      </button>
    </>
  );
}
```

7. What if we want to use `useSWR`?

When using `useSWR` the `Action` client component becomes:

```javascript
"use client";

import { Suspense, useMemo } from "react";
import { usePropsChangedKey } from "@/app/hooks";
import useSWR from "swr";

const callActionAsync = (action, props) =>
  new Promise((r) => setTimeout(async () => r(await action(props))));

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

  const propsForSWR = useMemo(() => props, [propsChangedKey]);
  const swrArgs = useMemo(() => [action, propsForSWR], [action, propsForSWR]);
  const fetcher = ([action, props]) => callActionAsync(action, props);

  return (
    <Suspense fallback={children}>
      <ReadSWR swrArgs={swrArgs} fetcher={fetcher} />
    </Suspense>
  );
}
```

8. Now we can combine the two definitions of `Action` client component we have shown (one using `useSWR` and other not) into one:

```javascript
"use client";

import { Suspense, useMemo } from "react";
import { usePropsChangedKey } from "@/app/hooks";
import useSWR from "swr";

const fetcher = (action, props) =>
  new Promise((r) => setTimeout(async () => r(await action(props))));

const fetcherSWR = ([, action, props]) => fetcher(action, props);

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
  isSWR = false,
  ...props
}) {
  const propsChangedKey = usePropsChangedKey(...Object.values(props));

  const reader = useMemo(() => getReader(), [propsChangedKey]);

  const propsForSWR = useMemo(() => props, [propsChangedKey]);
  const swrArgs = useMemo(
    () => [propsChangedKey, action, propsForSWR],
    [action, propsForSWR, propsChangedKey]
  );

  return (
    <Suspense fallback={children}>
      {isSWR ? (
        <ReadSWR swrArgs={swrArgs} fetcher={fetcherSWR} />
      ) : (
        <Read fetcher={() => fetcher(action, props)} reader={reader} />
      )}
    </Suspense>
  );
}
```

## Do not call `Action` component directly on intial render.

We must do something like this for example:

```javascript
"use client";

import Client1 from "@/app/components/client-1";
import { useState } from "react";

export default function Home() {
  const [isStart, setIsStart] = useState(false);
  return (
    <>
      <button onClick={() => setIsStart(true)}>start</button>
      {isStart && <Client1 />}
    </>
  );
}
```

If you do this instead:

```javascript
"use client";

import Client1 from "@/app/components/client-1";

export default function Home() {
  return (
    <>
      <Client />
    </>
  );
}
```

you get the following server error:

`⨯ unhandledRejection: Error: Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead.`.

## Important final note.

You must import the `greeting` action, in this case, in the `RootLayout` server component, like this:

```javascript
import { Inter } from "next/font/google";
import { greeting } from "@/app/actions/greeting"; // <-- this is necessary, if not fails to compile

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

If you don't do this you get the following error:

`⨯ Error: Could not find the module "C:\Users\roggc\dev\nextjs\test1\app\action-components\greeting.js#" in the React Client Manifest. This is probably a bug in the React Server Components bundler`.

This happens in NextJS when a client component is only imported in a server action. In this case we were importing the `Greeting` client component in the `greeting` server action.

As I have said the workaround is to import the server action in the `RootLayout` server component. There is an [open issue](https://github.com/vercel/next.js/issues/58125) about this.

## Summary

1. We want to fetch data from the server and pass it as props to client components.
2. For this, we use server actions that return client components.
3. We call these server actions with the `Action` client component we defined.
4. The `Action` client component we have defined works also when using `useSWR`.
5. Do not call the `Action` component on initial render.
6. You must import the server action in the `RootLayout` server component.
