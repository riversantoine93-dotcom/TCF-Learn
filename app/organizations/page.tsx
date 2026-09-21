"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { ORGANIZATION_PLANS, ORGANIZATION_PLAN_KEYS, type OrganizationPlanKey } from "@/lib/organization-plans";

export default function OrganizationsPage(){
  const [organizationName,setOrganizationName]=useState("");
  const [selected,setSelected]=useState<OrganizationPlanKey>("org-10");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function checkout(e:FormEvent){
    e.preventDefault();
    if(!organizationName.trim()){setMessage("Enter your organization or institution name first.");return;}
    setBusy(true); setMessage("");
    try{
      const res=await fetch("/api/organization/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:selected,organizationName})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data.url){setMessage(data.error||"Unable to start checkout.");return;}
      window.location.href=data.url;
    }catch{setMessage("Unable to reach checkout. Please try again.");}
    finally{setBusy(false);}
  }

  return <main><Header/><section className="auth-shell" style={{maxWidth:1180,margin:"0 auto",padding:"48px 20px"}}>
    <div style={{width:"100%"}}>
      <span className="eyebrow">ORGANIZATIONAL LEARNING</span>
      <h1 style={{fontSize:"clamp(2rem,5vw,4.5rem)",maxWidth:900}}>Equip a full cohort with both TCF Learn courses.</h1>
      <p style={{maxWidth:820,fontSize:"1.08rem"}}>Every learner seat includes <strong>Turning Forward</strong> and <strong>Thought to Freedom: Correcting Criminal Thinking Errors</strong>. The purchaser becomes the primary organization administrator and learner progress can be managed from one console.</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18,margin:"32px 0"}}>
        {ORGANIZATION_PLAN_KEYS.map(key=>{const plan=ORGANIZATION_PLANS[key];return <button key={key} type="button" onClick={()=>setSelected(key)} style={{textAlign:"left",padding:24,border:selected===key?"2px solid #d2a84a":"1px solid #555",borderRadius:14,background:selected===key?"rgba(210,168,74,.10)":"transparent",color:"inherit",cursor:"pointer"}}>
          <small>{plan.badge}</small><h2 style={{margin:"8px 0"}}>{plan.displayPrice}</h2><strong>{plan.label}</strong><p>{plan.description}</p><p><b>Both courses included</b><br/>{plan.perSeatLabel}</p>{plan.coAdminLimit>0&&<p><b>Includes up to {plan.coAdminLimit} co-admins</b></p>}
        </button>})}
      </div>

      <form className="auth-card" onSubmit={checkout} style={{maxWidth:680,margin:"0 auto"}}>
        <h2>Enroll your organization</h2>
        <label>Organization / institution name<input required value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="Example: Common Good Atlanta"/></label>
        <div className="notice"><strong>{ORGANIZATION_PLANS[selected].seats} learner seats · {ORGANIZATION_PLANS[selected].displayPrice}</strong><br/>Includes both TCF Learn courses for every learner. Administrator accounts do not consume learner seats.</div>
        {message&&<div className="notice" role="status">{message}</div>}
        <button className="button full" type="submit" disabled={busy}>{busy?"Opening secure checkout…":`Purchase ${ORGANIZATION_PLANS[selected].seats}-seat license`}</button>
        <small>Already part of an organization? <Link href="/login">User Login</Link></small>
      </form>
    </div>
  </section></main>;
}
