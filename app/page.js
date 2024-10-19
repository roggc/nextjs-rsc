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
