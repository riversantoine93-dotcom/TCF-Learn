"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { SECURITY_QUESTIONS } from "@/lib/security-questions";

export default function AcceptOrganizationInvite(){
  const router=useRouter();
  const [inviteToken,setInviteToken]=useState("");
  const [fullName,setFullName]=useState(""); const [password,setPassword]=useState("");
  const [q1,setQ1]=useState(""); const [a1,setA1]=useState("");
  const [q2,setQ2]=useState(""); const [a2,setA2]=useState("");
  const [q3,setQ3]=useState(""); const [a3,setA3]=useState("");
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>setInviteToken(new URLSearchParams(window.location.search).get("token")||""),[]);
  const options=(selected:string)=><><option value="">Select a security question</option>{SECURITY_QUESTIONS.map(q=><option key={q.id} value={q.id} disabled={[q1,q2,q3].includes(q.id)&&selected!==q.id}>{q.label}</option>)}</>;

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage("");
    try{
      const res=await fetch("/api/organization/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({inviteToken,fullName,password,securityAnswers:[{question:q1,answer:a1},{question:q2,answer:a2},{question:q3,answer:a3}]})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok){setMessage(data.error||"Unable to accept invitation.");return;}
      setMessage("Your TCF Learn account is ready. Both courses have been added to your organization access.");
      setTimeout(()=>router.push("/login"),900);
    }catch{setMessage("Unable to reach account services.");}
    finally{setBusy(false);}
  }

  if(!inviteToken) return <main><Header/><section className="auth-shell"><div className="auth-card"><h1>Invitation required</h1><p>Open the invitation link supplied by your organization administrator.</p><Link href="/login">User Login</Link></div></section></main>;
  return <main><Header/><section className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <span className="eyebrow">ORGANIZATION ENROLLMENT</span><h1>Activate your learner account</h1><p>Your organization is providing access to both Turning Forward and Thought to Freedom.</p>
    {message&&<div className="notice" role="status">{message}</div>}
    <label>Full name<input required value={fullName} onChange={e=>setFullName(e.target.value)}/></label>
    <label>Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <label>Security question 1<select required value={q1} onChange={e=>setQ1(e.target.value)}>{options(q1)}</select></label><label>Answer 1<input type="password" required minLength={2} value={a1} onChange={e=>setA1(e.target.value)}/></label>
    <label>Security question 2<select required value={q2} onChange={e=>setQ2(e.target.value)}>{options(q2)}</select></label><label>Answer 2<input type="password" required minLength={2} value={a2} onChange={e=>setA2(e.target.value)}/></label>
    <label>Security question 3<select required value={q3} onChange={e=>setQ3(e.target.value)}>{options(q3)}</select></label><label>Answer 3<input type="password" required minLength={2} value={a3} onChange={e=>setA3(e.target.value)}/></label>
    <button className="button full" disabled={busy}>{busy?"Activating account…":"Activate account"}</button>
  </form></section></main>;
}
