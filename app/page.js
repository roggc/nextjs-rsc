import RSC from "./rsc";
import { greeting } from "@/app/actions/greeting";

export default function Home() {
  return <RSC action={greeting} />;
}
