"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import "./super-admin.css";

type Organization={
  id:string;name:string;purchaser_email:string;plan_key:string;seat_limit:number;admin_license_limit:number;co_admin_limit:number;
  status:string;amount_paid:number;currency:string;payment_source:string|null;external_payment_reference:string|null;
  stripe_invoice_id:string|null;license_notes:string|null;created_at:string;purchased_at:string;
};
type Membership={id:string;organization_id:string;user_id:string|null;email:string;full_name:string|null;role:string;status:string;invite_token:string|null;invited_at:string;accepted_at:string|null};
type LicenseEvent={id:string;organization_id:string|null;action:string;details:any;created_at:string};
type Overview={organizations:Organization[];memberships:Membership[];events:LicenseEvent[]};

export default function SuperAdminPage(){
  const [data,setData]=useState<Overview|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState("");
  const [activationUrl,setActivationUrl]=useState("");
  const [invoiceUrl,setInvoiceUrl]=useState("");

  const [manual,setManual]=useState({organizationName:"",purchaserEmail:"",planKey:"org-50",amountPaid:"",paymentSource:"ach",paymentReference:"",notes:""});
  const [invoice,setInvoice]=useState({organizationName:"",purchaserEmail:"",planKey:"org-50",amount:"",dueDays:"30",notes:""});

  async function authHeaders(){
    if(!supabase) return null;
    const {data:{session}}=await supabase.auth.getSession();
    return session?.access_token?{Authorization:"Bearer "+session.access_token}:null;
  }

  async function load(){
    const headers=await authHeaders();
    if(!headers){window.location.href="/super-admin/login";return;}
    const res=await fetch("/api/super-admin/overview",{headers});
    const body=await res.json().catch(()=>({}));
    if(!res.ok){window.location.href="/super-admin/login";return;}
    setData(body);
  }

  useEffect(()=>{load()},[]);

  async function post(path:string,payload:any,action:string){
    const headers=await authHeaders();
    if(!headers){window.location.href="/super-admin/login";return null;}
    setBusy(action);setMessage("");setActivationUrl("");setInvoiceUrl("");
    try{
      const res=await fetch(path,{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const body=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(body.error||"Action failed.");
      if(body.adminActivationUrl) setActivationUrl(body.adminActivationUrl);
      if(body.hostedInvoiceUrl) setInvoiceUrl(body.hostedInvoiceUrl);
      setMessage(body.message||"Action completed successfully.");
      await load();
      return body;
    }catch(error){
      setMessage(error instanceof Error?error.message:"Action failed.");
      return null;
    }finally{setBusy("");}
  }

  async function activateManual(e:FormEvent){
    e.preventDefault();
    const result=await post("/api/super-admin/license/activate",manual,"manual");
    if(result) setManual({organizationName:"",purchaserEmail:"",planKey:"org-50",amountPaid:"",paymentSource:"ach",paymentReference:"",notes:""});
  }

  async function createInvoice(e:FormEvent){
    e.preventDefault();
    const result=await post("/api/super-admin/invoice/create",invoice,"invoice");
    if(result) setInvoice({organizationName:"",purchaserEmail:"",planKey:"org-50",amount:"",dueDays:"30",notes:""});
  }

  const membershipsByOrg=useMemo(()=>{
    const map=new Map<string,Membership[]>();
    for(const member of data?.memberships||[]){const rows=map.get(member.organization_id)||[];rows.push(member);map.set(member.organization_id,rows);}
    return map;
  },[data]);

  const eventsByOrg=useMemo(()=>{
    const map=new Map<string,LicenseEvent[]>();
    for(const event of data?.events||[]){if(!event.organization_id)continue;const rows=map.get(event.organization_id)||[];rows.push(event);map.set(event.organization_id,rows);}
    return map;
  },[data]);

  const totals=useMemo(()=>{
    const orgs=data?.organizations||[];
    return {
      active:orgs.filter(o=>o.status==="active").length,
      pending:orgs.filter(o=>o.status==="pending").length,
      paused:orgs.filter(o=>o.status==="paused").length,
      learnerLicenses:orgs.filter(o=>o.status==="active").reduce((sum,o)=>sum+o.seat_limit,0),
    };
  },[data]);

  return <main><Header/><section className="super-admin-page">
    <div className="super-admin-heading">
      <div><span className="eyebrow">PRIVATE PLATFORM CONTROL</span><h1>TCF Super Admin</h1><p>Manage organization licenses, payments, activations, administrators, and account recovery from one dashboard.</p></div>
      <button className="secondary" onClick={()=>supabase?.auth.signOut().then(()=>window.location.href="/super-admin/login")}>Sign Out</button>
    </div>

    {message&&<div className="notice super-message">{message}</div>}
    {activationUrl&&<div className="notice"><strong>Admin activation link</strong><br/><a href={activationUrl}>{activationUrl}</a><button type="button" className="copy-button" onClick={()=>navigator.clipboard.writeText(activationUrl)}>Copy</button></div>}
    {invoiceUrl&&<div className="notice"><strong>Stripe hosted invoice</strong><br/><a href={invoiceUrl} target="_blank" rel="noreferrer">{invoiceUrl}</a><button type="button" className="copy-button" onClick={()=>navigator.clipboard.writeText(invoiceUrl)}>Copy</button></div>}

    <div className="super-summary-grid">
      <article><small>ACTIVE ORGANIZATIONS</small><h2>{totals.active}</h2></article>
      <article><small>PENDING PAYMENT</small><h2>{totals.pending}</h2></article>
      <article><small>PAUSED</small><h2>{totals.paused}</h2></article>
      <article><small>ACTIVE LEARNER LICENSES</small><h2>{totals.learnerLicenses}</h2></article>
    </div>

    <div className="super-action-grid">
      <form className="super-card" onSubmit={createInvoice}>
        <span className="eyebrow">NEGOTIATED STRIPE BILLING</span>
        <h2>Create & Send Invoice</h2>
        <p>Create a pending 50- or 100-seat license. Stripe emails the invoice; payment automatically activates the license.</p>
        <label>Organization<input required value={invoice.organizationName} onChange={e=>setInvoice({...invoice,organizationName:e.target.value})}/></label>
        <label>Purchaser / Admin Email<input type="email" required value={invoice.purchaserEmail} onChange={e=>setInvoice({...invoice,purchaserEmail:e.target.value})}/></label>
        <label>License<select value={invoice.planKey} onChange={e=>setInvoice({...invoice,planKey:e.target.value})}><option value="org-50">50 Learner Licenses</option><option value="org-100">100 Learner Licenses</option></select></label>
        <label>Negotiated Amount ($)<input type="number" min="1" step="0.01" required value={invoice.amount} onChange={e=>setInvoice({...invoice,amount:e.target.value})}/></label>
        <label>Invoice Due (days)<input type="number" min="1" max="90" required value={invoice.dueDays} onChange={e=>setInvoice({...invoice,dueDays:e.target.value})}/></label>
        <label>Notes<textarea value={invoice.notes} onChange={e=>setInvoice({...invoice,notes:e.target.value})}/></label>
        <button className="button full" disabled={!!busy}>{busy==="invoice"?"Creating invoice…":"Create & Send Stripe Invoice"}</button>
      </form>

      <form className="super-card" onSubmit={activateManual}>
        <span className="eyebrow">OFFLINE / EXTERNAL PAYMENT</span>
        <h2>Activate License Manually</h2>
        <p>Use after ACH, check, purchase order settlement, grant payment, or another verified payment method.</p>
        <label>Organization<input required value={manual.organizationName} onChange={e=>setManual({...manual,organizationName:e.target.value})}/></label>
        <label>Purchaser / Admin Email<input type="email" required value={manual.purchaserEmail} onChange={e=>setManual({...manual,purchaserEmail:e.target.value})}/></label>
        <label>License<select value={manual.planKey} onChange={e=>setManual({...manual,planKey:e.target.value})}><option value="org-10">10 Learner Licenses</option><option value="org-50">50 Learner Licenses</option><option value="org-100">100 Learner Licenses</option></select></label>
        <label>Amount Paid ($)<input type="number" min="0" step="0.01" value={manual.amountPaid} onChange={e=>setManual({...manual,amountPaid:e.target.value})}/></label>
        <label>Payment Source<select value={manual.paymentSource} onChange={e=>setManual({...manual,paymentSource:e.target.value})}><option value="ach">ACH</option><option value="check">Check</option><option value="purchase_order">Purchase Order</option><option value="grant">Grant / Sponsored</option><option value="manual">Other</option></select></label>
        <label>Payment Reference<input value={manual.paymentReference} onChange={e=>setManual({...manual,paymentReference:e.target.value})}/></label>
        <label>Notes<textarea value={manual.notes} onChange={e=>setManual({...manual,notes:e.target.value})}/></label>
        <button className="button full" disabled={!!busy}>{busy==="manual"?"Activating…":"Activate Organization License"}</button>
      </form>
    </div>

    <section className="organization-management">
      <div className="section-heading"><span className="eyebrow">LICENSE MANAGEMENT</span><h2>Organizations</h2></div>
      {!data&&<div className="notice">Loading organizations…</div>}
      <div className="organization-admin-list">
        {(data?.organizations||[]).map(org=>{
          const members=membershipsByOrg.get(org.id)||[];
          const learners=members.filter(m=>m.role==="learner"&&m.status!=="removed");
          const primary=members.find(m=>m.role==="admin"&&m.status!=="removed");
          const coAdmins=members.filter(m=>m.role==="co_admin"&&m.status!=="removed");
          const recentEvents=(eventsByOrg.get(org.id)||[]).slice(0,4);
          return <article className="organization-admin-card" key={org.id}>
            <div className="org-card-top">
              <div><span className={"license-status status-"+org.status}>{org.status}</span><h3>{org.name}</h3><p>{org.purchaser_email}</p></div>
              <div className="license-count"><b>{org.seat_limit}</b><span>learner licenses</span></div>
            </div>
            <div className="org-facts">
              <span><b>Plan</b>{org.plan_key}</span>
              <span><b>Learners</b>{learners.length} / {org.seat_limit}</span>
              <span><b>Primary Admin</b>{primary?.status||"missing"} (1 / 1)</span>
              <span><b>Co-admins</b>{coAdmins.length} / {org.co_admin_limit}</span>
              <span><b>Payment</b>{org.payment_source||"stripe checkout"}</span>
              <span><b>Reference</b>{org.external_payment_reference||org.stripe_invoice_id||"—"}</span>
            </div>
            <div className="org-actions">
              {org.status!=="active"&&<button onClick={()=>post("/api/super-admin/license/status",{organizationId:org.id,status:"active"},"status-"+org.id)}>Activate</button>}
              {org.status==="active"&&<button onClick={()=>post("/api/super-admin/license/status",{organizationId:org.id,status:"paused"},"status-"+org.id)}>Pause</button>}
              {org.status!=="cancelled"&&<button className="secondary" onClick={()=>post("/api/super-admin/license/status",{organizationId:org.id,status:"cancelled"},"status-"+org.id)}>Cancel</button>}
              {primary?.status==="invited"&&<button onClick={()=>post("/api/super-admin/admin-invite",{organizationId:org.id},"invite-"+org.id)}>Get Admin Activation Link</button>}
              {primary?.status==="active"&&<button onClick={()=>post("/api/super-admin/password-reset",{email:primary.email,organizationId:org.id},"reset-"+primary.id)}>Reset Admin Password</button>}
            </div>

            <details>
              <summary>Manage users ({members.length})</summary>
              <div className="member-list">
                {members.map(member=><div className="member-row" key={member.id}>
                  <div><b>{member.full_name||member.email}</b><small>{member.email} · {member.role.replace("_"," ")} · {member.status}</small></div>
                  {member.user_id&&<button className="secondary" onClick={()=>post("/api/super-admin/password-reset",{email:member.email,organizationId:org.id},"reset-"+member.id)}>Send Password Reset</button>}
                </div>)}
              </div>
            </details>

            <details>
              <summary>Recent license activity</summary>
              <div className="audit-list">
                {recentEvents.length===0?<p>No activity recorded yet.</p>:recentEvents.map(event=><div key={event.id}><b>{event.action.replaceAll("_"," ")}</b><small>{new Date(event.created_at).toLocaleString()}</small></div>)}
              </div>
            </details>
          </article>
        })}
      </div>
    </section>
  </section></main>;
}
