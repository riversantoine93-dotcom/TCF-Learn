"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, signOut } = useAuth();
  return <header className="site-header"><div className="shell nav-wrap">
    <Link href="/" className="brand"><Image src="/learn-logo.png" alt="Learn — The Conviction Fiction Podcast" width={172} height={72} priority /></Link>
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/course/turning-forward">Course</Link>
      {user ? <><Link href="/profile">Profile</Link><button className="nav-button" onClick={() => signOut()}>Sign out</button></> : <Link className="button small" href="/login">Student sign in</Link>}
    </nav>
  </div></header>;
}
