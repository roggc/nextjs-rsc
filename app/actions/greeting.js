"use server";
import Greeting from "@/app/action-components/greeting";

const users = [{ id: 1, username: "roggc" }];

export async function greeting({ userId }) {
  const username = await new Promise((r) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        r(user.username);
      }
    }, 500);
  });

  return <Greeting username={username} />;
}
