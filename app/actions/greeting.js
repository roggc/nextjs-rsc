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
