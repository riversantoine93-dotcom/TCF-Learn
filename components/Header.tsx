"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, signOut } = useAuth();

  return <>
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand header-brand" aria-label="TCF Learn home">
          <Image src="/learn-logo.png" alt="Learn — The Conviction Fiction Podcast" width={172} height={72} priority />
        </Link>
        <nav className="header-nav" aria-label="Primary navigation">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/course/turning-forward">Course</Link>
          {user ? <><Link href="/profile">Profile</Link><button className="nav-button" onClick={() => signOut()}>Sign out</button></> : <Link className="button small" href="/login">User Login</Link>}
        </nav>
      </div>
    </header>
    <style jsx>{`
      .nav-wrap{display:flex;align-items:center;justify-content:space-between;gap:36px;width:min(1180px,92vw)}
      .header-brand{flex:0 0 auto;display:flex;align-items:center;min-width:0}
      .header-brand :global(img){display:block;width:clamp(132px,14vw,168px);height:auto;max-height:58px;object-fit:contain}
      .header-nav{display:flex;align-items:center;justify-content:flex-end;gap:clamp(18px,2.4vw,32px);margin-left:auto;min-width:0}
      .header-nav :global(a),.header-nav :global(.nav-button){white-space:nowrap}
      .header-nav :global(.nav-button){padding:0;border:0;background:transparent;color:var(--cream);font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;line-height:1.2}
      .header-nav :global(.nav-button:hover){color:var(--gold-light);transform:none}
      @media(max-width:720px){.nav-wrap{gap:18px;width:min(94vw,1180px)}.header-brand :global(img){width:118px;max-height:48px}.header-nav{gap:10px 14px;flex-wrap:wrap;row-gap:8px}}
      @media(max-width:520px){.nav-wrap{align-items:center;gap:14px}.header-brand :global(img){width:102px;max-height:42px}.header-nav{gap:7px 10px}.header-nav :global(a),.header-nav :global(.nav-button){font-size:.6rem;letter-spacing:.07em}.header-nav :global(.button.small){padding:8px 10px}}
    `}</style>
  </>;
}
