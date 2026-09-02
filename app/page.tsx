import { redirect } from "next/navigation";
import { PRIMARY_HOME_PATH } from "@/lib/home-route";

export default function Home() {
  redirect(PRIMARY_HOME_PATH);
}
