# Action client component in NextJS 14

In NextJS 14 you can make an `Action` client component like this:

```javascript
"use client";

import { Suspense, useState, useEffect } from "react";

export default function Action({
  action,
  fallback = <>loading...</>,
  softKey,
  ...props
}) {
  const [JSX, setJSX] = useState(fallback);

  useEffect(() => {
    setJSX(<Suspense fallback={fallback}>{action(props)}</Suspense>);
  }, [softKey]);

  return JSX;
}
```

Then you can use it like this in any client component (also server component):

```javascript
"use client";

import Action from "@/app/action";
import { greeting } from "@/app/actions/greeting";
import { useEffect, useState } from "react";

export default function Client1() {
  const [userId, setUserId] = useState(1);
  const [softKey, setSoftKey] = useState(0);

  useEffect(() => {
    setSoftKey((k) => k + 1);
  }, [userId]);

  return (
    <>
      <Action action={greeting} userId={userId} softKey={softKey} />
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

In this case `greeting` action is like this:

```javascript
"use server";

import Greeting from "@/app/action-components/greeting";
import MyError from "@/app/action-components/my-error";

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
      }, 500);
    });

    // throw new Error("crash!");
    return <Greeting username={username} />;
  } catch (error) {
    return <MyError errorMessage={error.message} />;
  }
}
```

and `Greeting` client component is like this:

```javascript
"use client";

export default function Greeting({ username }) {
  return <>hello {username}</>;
}
```

You call your `Client1` component from `Home` server component:

```javascript
import Client1 from "@/app/components/client-1";

export default function Home() {
  return <Client1 />;
}
```

But for this to work you must also import `greeting` action in `Home` server component or in `RootLayout` server component, like this:

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

If you don't do this last step you get following server error:

`⨯ Error: Could not find the module "C:\Users\roggc\dev\nextjs\test1\app\action-components\greeting.js#" in the React Client Manifest. This is probably a bug in the React Server Components bundler. at stringify (<anonymous>)`

The idea is any action returns a client component, and are called through `Action` client component. `Action` client component accepts an action prop plus any number of other props which will passed to the action itself (except functions, which cannot be stringified; for this last case you must use a library like [react-context-slices](https://react-context-slices.github.io/) to store the functions in the global shared state before calling the `Action` component and recovering its value in the `Greeting` client component).

This way of coding comes from [this setup](https://github.com/roggc/rsc-ssr), also explained [here](https://rsc-setup.netlify.app/).

Now, with this shown here, you can also code like this in NextJS 14.

There is also a `MyError` client component we return in case of error in the server action:

```javascript
"use client";

export default function MyError({ errorMessage }) {
  return <>Something went wrong: {errorMessage}</>;
}
```
