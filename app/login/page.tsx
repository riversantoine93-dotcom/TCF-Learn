"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function Login() {
 const router = useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault(); if(!supabase){setMessage("Supabase environment variables are missing.");return;} setBusy(true); const {error}=await supabase.auth.signInWithPassword({email,password}); setBusy(false); if(error)setMessage(error.message); else router.push("/dashboard");}
 return <main><Header/><section className="auth-shell"><form className="auth-card" onSubmit={submit}><span className="eyebrow">WELCOME BACK</span><h1>Student sign in</h1><p>Continue your work and sync progress across devices.</p>{!isSupabaseConfigured&&<div className="notice error">Supabase is not configured.</div>}{message&&<div className="notice">{message}</div>}<label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button full" disabled={busy}>{busy?"Signing in…":"Sign in"}</button><small>New student? <Link href="/register">Create an account</Link></small></form></section></main>;
}
