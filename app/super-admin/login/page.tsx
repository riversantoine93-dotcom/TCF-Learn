"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function SuperAdminLogin(){
  const [email,setEmail]=useState("theconvictionfictionpodcast@gmail.com");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!supabase){setMessage("Authentication is unavailable.");return;}
    setBusy(true); setMessage("");
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error||!data.session){setMessage(error?.message||"Unable to sign in.");setBusy(false);return;}
    const res=await fetch("/api/super-admin/overview",{headers:{Authorization:"Bearer "+data.session.access_token}});
    const body=await res.json().catch(()=>({}));
    if(!res.ok){
      await supabase.auth.signOut();
      setMessage(body.error||"This account does not have TCF Super Admin access.");
      setBusy(false);
      return;
    }
    window.location.href="/super-admin";
  }

  return <main><Header/><section className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <span className="eyebrow">PRIVATE PLATFORM ACCESS</span>
    <h1>TCF Super Admin</h1>
    <p>Manage organization licenses, activations, invoices, account recovery, and access controls.</p>
    {message&&<div className="notice">{message}</div>}
    <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <div style={{textAlign:"right"}}><Link href="/forgot-password">Forgot password?</Link></div>
    <button className="button full" disabled={busy}>{busy?"Verifying access…":"Super Admin Login"}</button>
  </form></section></main>;
}
