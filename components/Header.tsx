"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { HEADER_THEME_STORAGE_KEY, HeaderTheme, nextHeaderTheme, normalizeHeaderTheme } from "@/lib/header-theme";

export default function Header() {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<HeaderTheme>("dark");

  useEffect(() => {
    setTheme(normalizeHeaderTheme(localStorage.getItem(HEADER_THEME_STORAGE_KEY)));
  }, []);

  const toggleTheme = () => setTheme(current => {
    const next = nextHeaderTheme(current);
    localStorage.setItem(HEADER_THEME_STORAGE_KEY, next);
    return next;
  });

  return <>
    <header className={`site-header header-theme-${theme}`}>
      <div className="shell nav-wrap">
        <Link href="/" className="brand header-brand" aria-label="TCF Learn home">
          <Image src="/learn-logo.png" alt="Learn — The Conviction Fiction Podcast" width={172} height={72} priority />
        </Link>
        <nav className="header-nav" aria-label="Primary navigation">
          <Link href="/">Dashboard</Link>
          <Link href="/courses">Courses</Link>
          {user ? <><Link href="/profile">Profile</Link><button className="nav-button" onClick={() => signOut()}>Sign out</button></> : <Link className="button small" href="/login">User Login</Link>}
          <button type="button" className="header-theme-toggle" onClick={toggleTheme} aria-label={`Switch header to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            <b>{theme === "dark" ? "Light" : "Dark"}</b>
          </button>
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
      .header-theme-toggle{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:transparent;color:var(--cream);padding:8px 10px;font:inherit;font-size:.68rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      .header-theme-toggle span{font-size:.9rem;line-height:1}.header-theme-toggle:hover{border-color:var(--gold);color:var(--gold-light)}
      .header-theme-light{background:#f6f0e4!important;color:#151515!important;border-bottom-color:#d8cdb8!important}
      .header-theme-light .header-nav :global(a),.header-theme-light .header-nav :global(.nav-button){color:#151515!important}
      .header-theme-light .header-nav :global(a:hover),.header-theme-light .header-nav :global(.nav-button:hover){color:#8a6910!important}
      .header-theme-light .header-nav :global(.button.small){background:#151515!important;color:#f7f1e5!important}
      .header-theme-light .header-theme-toggle{color:#151515;border-color:#bcae95;background:#fffaf0}
      @media(max-width:720px){.nav-wrap{gap:18px;width:min(94vw,1180px)}.header-brand :global(img){width:118px;max-height:48px}.header-nav{gap:10px 14px;flex-wrap:wrap;row-gap:8px}.header-theme-toggle b{display:none}}
      @media(max-width:520px){.nav-wrap{align-items:center;gap:14px}.header-brand :global(img){width:102px;max-height:42px}.header-nav{gap:7px 10px}.header-nav :global(a),.header-nav :global(.nav-button){font-size:.6rem;letter-spacing:.07em}.header-nav :global(.button.small){padding:8px 10px}.header-theme-toggle{padding:7px 8px}}
    `}</style>
  </>;
}
