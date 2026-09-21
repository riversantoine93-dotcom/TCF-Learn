"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { ORGANIZATION_PLANS, ORGANIZATION_PLAN_KEYS, type OrganizationPlanKey } from "@/lib/organization-plans";
import "./organizations.css";

const SALES_EMAIL = "theconvictionfictionpodcast@gmail.com";

export default function OrganizationsPage(){
  const [organizationName,setOrganizationName]=useState("");
  const [selected,setSelected]=useState<OrganizationPlanKey>("org-10");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const selectedPlan = ORGANIZATION_PLANS[selected];

  function contactForPricing(){
    const subject = encodeURIComponent("TCF Learn " + selectedPlan.seats + "-Seat Organization Pricing");
    const body = encodeURIComponent(
      "Hello TCF Learn,\n\nI would like pricing information for the " + selectedPlan.seats + "-seat organization package.\nOrganization: " + (organizationName.trim() || "Not provided") + "\n\nThank you."
    );
    window.location.href = "mailto:" + SALES_EMAIL + "?subject=" + subject + "&body=" + body;
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!organizationName.trim()){setMessage("Enter your organization or institution name first.");return;}

    if(selectedPlan.salesMode==="contact"){
      setMessage("");
      contactForPricing();
      return;
    }

    setBusy(true); setMessage("");
    try{
      const res=await fetch("/api/organization/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:selected,organizationName})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok||!data.url){setMessage(data.error||"Unable to start checkout.");return;}
      window.location.href=data.url;
    }catch{setMessage("Unable to reach checkout. Please try again.");}
    finally{setBusy(false);}
  }

  return <main><Header/><section className="organization-page">
    <div className="organization-shell">
      <span className="eyebrow">ORGANIZATIONAL LEARNING</span>
      <h1>Equip a full cohort with both TCF Learn courses.</h1>
      <p className="organization-lead">Every learner seat includes <strong>Turning Forward</strong> and <strong>Thought to Freedom: Correcting Criminal Thinking Errors</strong>. The purchaser becomes the primary organization administrator and learner progress can be managed from one console.</p>

      <div className="organization-plan-grid">
        {ORGANIZATION_PLAN_KEYS.map(key=>{const plan=ORGANIZATION_PLANS[key];return <button key={key} type="button" className={"organization-plan-card "+(selected===key?"selected":"")} onClick={()=>setSelected(key)}>
          <small>{plan.badge}</small>
          <h2 className={plan.salesMode==="contact"?"contact-price":""}>{plan.displayPrice}</h2>
          <strong>{plan.label}</strong>
          <p>{plan.description}</p>
          <div className="plan-detail"><b>Both courses included</b><span>{plan.perSeatLabel}</span></div>
          {plan.coAdminLimit>0&&<div className="plan-detail"><b>Co-admin access</b><span>Up to {plan.coAdminLimit} co-admins</span></div>}
        </button>})}
      </div>

      <form className="auth-card organization-enroll-card" onSubmit={submit}>
        <h2>{selectedPlan.salesMode==="contact"?"Contact for pricing":"Enroll your organization"}</h2>
        <label>Organization / institution name<input required value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="Example: Common Good Atlanta"/></label>
        <div className="notice"><strong>{selectedPlan.seats} learner seats · {selectedPlan.displayPrice}</strong><br/>Includes both TCF Learn courses for every learner. Administrator accounts do not consume learner seats.</div>
        {message&&<div className="notice" role="status">{message}</div>}
        <button className="button full" type="submit" disabled={busy}>{busy?"Opening secure checkout…":selectedPlan.salesMode==="contact"?"Contact for "+selectedPlan.seats+"-seat pricing":"Purchase "+selectedPlan.seats+"-seat license"}</button>
        <small>Already part of an organization? <Link href="/login?mode=user">User Login</Link> or <Link href="/login?mode=admin">Admin Login</Link>.</small>
      </form>
    </div>
  </section></main>;
}
