"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email,setEmail]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault(); if(!supabase){setMessage("Password recovery is temporarily unavailable.");return;} setBusy(true); setMessage(""); const redirectTo=`${window.location.origin}/reset-password`; await supabase.auth.resetPasswordForEmail(email,{redirectTo}); setBusy(false); setMessage("If an account exists for that email, a password reset link has been sent. Please check your inbox and spam folder.");}
  return <main><Header/><section className="auth-shell"><form className="auth-card" onSubmit={submit}><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Forgot your password?</h1><p>Enter the email address you use for TCF LEARN. We’ll send a secure reset link if an account exists.</p>{message&&<div className="notice">{message}</div>}<label>Email<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="button full" disabled={busy}>{busy?"Sending reset link…":"Send reset link"}</button><small><Link href="/login">Back to User Login</Link></small></form></section></main>;
}
