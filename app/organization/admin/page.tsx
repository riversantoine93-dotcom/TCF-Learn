"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type Member={id:string;user_id:string|null;email:string;full_name:string|null;role:"admin"|"co_admin"|"learner";status:string;invited_at:string;accepted_at:string|null};
type Overview={organization:any;adminRole:"admin"|"co_admin";members:Member[];progress:any[]};

export default function OrganizationAdmin(){
  const [data,setData]=useState<Overview|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [email,setEmail]=useState("");
  const [fullName,setFullName]=useState("");
  const [role,setRole]=useState<"learner"|"co_admin">("learner");
  const [inviteUrl,setInviteUrl]=useState("");

  async function authHeaders(){
    if(!supabase) return null;
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.access_token) return null;
    return {Authorization:`Bearer ${session.access_token}`};
  }
  async function load(){
    setMessage("");
    const headers=await authHeaders();
    if(!headers){setMessage("Sign in to manage your organization.");return;}
    const res=await fetch("/api/organization/overview",{headers});
    const body=await res.json().catch(()=>({}));
    if(!res.ok){setMessage(body.error||"Unable to load organization.");return;}
    setData(body);
  }
  useEffect(()=>{load()},[]);

  async function invite(e:FormEvent){
    e.preventDefault(); if(!data)return;
    setBusy(true); setMessage(""); setInviteUrl("");
    try{
      const headers=await authHeaders(); if(!headers) throw new Error("Sign in again.");
      const res=await fetch("/api/organization/invite",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({organizationId:data.organization.id,email,fullName,role})});
      const body=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(body.error||"Unable to create invitation.");
      setInviteUrl(body.inviteUrl); setEmail(""); setFullName(""); await load();
    }catch(error){setMessage(error instanceof Error?error.message:"Unable to create invitation.");}
    finally{setBusy(false);}
  }

  async function remove(memberId:string){
    if(!data)return;
    const headers=await authHeaders(); if(!headers)return;
    const res=await fetch("/api/organization/remove",{method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({organizationId:data.organization.id,membershipId:memberId})});
    const body=await res.json().catch(()=>({}));
    if(!res.ok){setMessage(body.error||"Unable to remove member.");return;}
    await load();
  }

  const learnerCount=data?.members.filter(m=>m.role==="learner"&&m.status!=="removed").length||0;
  const coAdminCount=data?.members.filter(m=>m.role==="co_admin"&&m.status!=="removed").length||0;
  const progressByUser=useMemo(()=>{
    const map=new Map<string,any[]>();
    for(const row of data?.progress||[]){const rows=map.get(row.user_id)||[];rows.push(row);map.set(row.user_id,rows);}
    return map;
  },[data]);

  return <main><Header/><section style={{maxWidth:1180,margin:"0 auto",padding:"42px 20px"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
      <div><span className="eyebrow">ORGANIZATION ADMIN</span><h1>{data?.organization?.name||"TCF Learn Organization"}</h1><p>Manage learner seats, invitations, co-admins, and learner progress across both included courses.</p></div>
      <Link className="button" href="/dashboard">Learner Dashboard</Link>
    </div>
    {message&&<div className="notice" style={{margin:"18px 0"}}>{message}</div>}
    {data&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,margin:"28px 0"}}>
        <div className="auth-card"><small>LEARNER SEATS</small><h2>{learnerCount} / {data.organization.seat_limit}</h2></div>
        <div className="auth-card"><small>CO-ADMINS</small><h2>{coAdminCount} / {data.organization.co_admin_limit}</h2></div>
        <div className="auth-card"><small>COURSE ACCESS</small><h2>2 courses</h2><p>Turning Forward + Thought to Freedom</p></div>
      </div>
      <form className="auth-card" onSubmit={invite} style={{maxWidth:760,marginBottom:28}}>
        <h2>Assign access</h2>
        <label>Name<input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Learner or co-admin name"/></label>
        <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label>Role<select value={role} onChange={e=>setRole(e.target.value as "learner"|"co_admin")}>
          <option value="learner">Learner</option>
          {data.adminRole==="admin"&&data.organization.co_admin_limit>0&&<option value="co_admin">Co-admin</option>}
        </select></label>
        <button className="button full" disabled={busy}>{busy?"Creating invitation…":"Create invitation"}</button>
        {inviteUrl&&<div className="notice"><strong>Invitation link</strong><br/><a href={inviteUrl}>{inviteUrl}</a></div>}
      </form>

      <div className="auth-card" style={{maxWidth:"none"}}>
        <h2>Organization roster</h2>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th align="left">Name</th><th align="left">Email</th><th align="left">Role</th><th align="left">Status</th><th align="left">Course activity</th><th></th></tr></thead>
            <tbody>{data.members.map(member=>{
              const activity=member.user_id?progressByUser.get(member.user_id)||[]:[];
              return <tr key={member.id} style={{borderTop:"1px solid #555"}}>
                <td style={{padding:"12px 6px"}}>{member.full_name||"—"}</td>
                <td style={{padding:"12px 6px"}}>{member.email}</td>
                <td style={{padding:"12px 6px"}}>{member.role.replace("_"," ")}</td>
                <td style={{padding:"12px 6px"}}>{member.status}</td>
                <td style={{padding:"12px 6px"}}>{member.role==="learner"?`${activity.length} course record${activity.length===1?"":"s"}`:"—"}</td>
                <td style={{padding:"12px 6px"}}>{member.role!=="admin"&&<button type="button" onClick={()=>remove(member.id)}>Remove</button>}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      </div>
    </>}
  </section></main>;
}
