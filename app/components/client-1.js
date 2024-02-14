"use client";
import Action from "@/app/action";
import { greeting } from "@/app/actions/greeting";

export default function Client1() {
  return <Action action={greeting} userId={1} />;
}
