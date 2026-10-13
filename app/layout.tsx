import type { Metadata } from "next";
import "./globals.css";
import "./page-theme.css";
import "./dashboard-scale.css";
import "./course-layout.css";
import "./course-overview.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "TCF Learn | Skills for Your Next Chapter",
  description: "30 practical courses in trade skills, technology, and reentry from The Conviction Fiction.",
  icons: { icon: "/learn-logo.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
