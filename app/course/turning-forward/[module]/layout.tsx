import PaidCourseGate from "@/components/PaidCourseGate";

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return <PaidCourseGate>{children}</PaidCourseGate>;
}
