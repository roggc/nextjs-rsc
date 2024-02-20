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
