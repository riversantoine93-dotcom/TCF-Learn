"use client";

import { useParams } from "next/navigation";
import PaidCourseGate from "@/components/PaidCourseGate";

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  const params=useParams<{module:string}>();
  return <PaidCourseGate moduleSlug={params.module}>{children}</PaidCourseGate>;
}
