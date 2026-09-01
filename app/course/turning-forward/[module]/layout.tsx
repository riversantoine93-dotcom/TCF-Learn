"use client";

import { useParams } from "next/navigation";
import PaidCourseGate from "@/components/PaidCourseGate";
import ModuleOpenerGate from "@/components/ModuleOpenerGate";

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  const params=useParams<{module:string}>();
  return <PaidCourseGate moduleSlug={params.module}><ModuleOpenerGate moduleSlug={params.module}>{children}</ModuleOpenerGate></PaidCourseGate>;
}
