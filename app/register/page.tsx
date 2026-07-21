"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function Register() {
 const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault(); if(!supabase){setMessage("Supabase environment variables are missing.");return;} setBusy(true); const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:`${window.location.origin}/dashboard`}}); setBusy(false); setMessage(error?error.message:"Account created. Check your email to confirm your address, then sign in.");}
 return <main><Header/><section className="auth-shell"><form className="auth-card" onSubmit={submit}><span className="eyebrow">BEGIN THE WORK</span><h1>Create your account</h1><p>Your answers and course progress remain private to your account.</p>{message&&<div className="notice">{message}</div>}<label>Full name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button full" disabled={busy}>{busy?"Creating account…":"Create student account"}</button><small>Already registered? <Link href="/login">Sign in</Link></small></form></section></main>;
}
