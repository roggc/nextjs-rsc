"use server";
import Greeting from "@/app/action-components/greeting";

export async function greeting() {
  const greeting = await new Promise((r) => {
    setTimeout(() => r("bye!!"), 500);
  });
  return <Greeting greeting={greeting} />;
}
