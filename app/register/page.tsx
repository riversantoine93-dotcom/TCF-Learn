"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

export default function Register() {
 const router=useRouter(); const params=useSearchParams(); const paid=params.get("paid")==="1";
 const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault(); setBusy(true); setMessage(""); const res=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fullName:name,email,password})}); const data=await res.json(); setBusy(false); if(!res.ok){setMessage(data.error||"Unable to create account.");return;} setMessage("Account created. You can now use User Login."); setTimeout(()=>router.push("/login"),900);}
 if(!paid) return <main><Header/><section className="auth-shell"><div className="auth-card"><span className="eyebrow">PAID ACCESS</span><h1>Purchase required</h1><p>User accounts are available after purchasing Turning Forward. Preview the full course outline before enrolling.</p><Link className="button full" href="/course/turning-forward">Preview course & enroll — $97</Link><small>Already purchased and created your account? <Link href="/login">User Login</Link></small></div></section></main>;
 return <main><Header/><section className="auth-shell"><form className="auth-card" onSubmit={submit}><span className="eyebrow">PAYMENT RECEIVED</span><h1>Create your user account</h1><p>Use the same email address you used for your $97 Turning Forward purchase. Access is granted only after Stripe confirms payment.</p>{message&&<div className="notice">{message}</div>}<label>Full name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Purchase email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button full" disabled={busy}>{busy?"Creating account…":"Create user account"}</button><small>Already registered? <Link href="/login">User Login</Link></small></form></section></main>;
}
