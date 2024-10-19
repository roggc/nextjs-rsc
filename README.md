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

import Greeting from "@/app/components/greeting";
import MyError from "@/app/components/my-error";

const DELAY = 2000;

const users = [
  { id: 1, username: "roggc" },
  { id: 2, username: "roger" },
];

export async function greeting({ userId }) {
  try {
    const usernamePromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find((u) => u.id === userId);
        if (user) {
          resolve(user.username);
        } else {
          reject(new Error("User not found"));
        }
      }, DELAY);
    });

    return <Greeting usernamePromise={usernamePromise} />;
  } catch (error) {
    return <MyError errorMessage={error.message} />;
  }
}
```

`Greeting` and `MyError` are client components that accepts data as props. Like this:

```javascript
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
```

and

```javascript
"use client";

export default function MyError({ errorMessage }) {
  return (
    <div>
      <h2>Error</h2>
      <p>{errorMessage}</p>
    </div>
  );
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

The way I have found is with the `Action` client component:

```javascript
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
```

5. Now when we want to call a server action that returns a client component we do it with the `Action` client component we have just defined:

```javascript
"use client";

import Action from "@/app/action";
import { greeting } from "@/app/actions/greeting";
import { useState } from "react";

export default function Example() {
  const [userId, setUserId] = useState(1);

  return (
    <>
      <Action action={greeting} userId={userId} />
      <button
        onClick={() => {
          setUserId((currentValue) => currentValue + 1);
        }}
      >
        click
      </button>
    </>
  );
}
```

## Do not call `Action` component directly on intial render.

We must do something like this for example:

```javascript
"use client";

import Example from "@/app/components/example";
import { useState } from "react";

export default function Home() {
  const [isStart, setIsStart] = useState(false);

  return (
    <>
      <button onClick={() => setIsStart(true)}>start</button>
      {isStart && <Example />}
    </>
  );
}
```

If you do this instead:

```javascript
"use client";

import Example from "@/app/components/example";

export default function Home() {
  return <Example />;
}
```

you get the following server error:

`⨯ unhandledRejection: Error: Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead.`.

If you need to fetch some data on initial render you can do it like this:

```javascript
import Home from "@/app/components/home";
import { greeting } from "./actions/greeting";

export default function Page() {
  return (
    <>
      {greeting({ userId: 1 })}
      <Home />
    </>
  );
}
```

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
4. Do not call the `Action` component on initial render.
5. You must import the server action in the `RootLayout` server component.
