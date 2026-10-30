"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type Visitor = {
 id:string; full_name:string; phone:string; visit_date:string; first_time:boolean;
 follow_up_status:string; assigned_to:string; notes:string; created_at:string;
};
const statuses=["pending","contacted","invited","returned","connected","closed"];
const today=()=>new Date().toISOString().slice(0,10);
const clean=(v:string)=>v.trim();

export default function VisitorFollowUpPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [checking,setChecking]=useState(true),[authorized,setAuthorized]=useState(false);
 const [rows,setRows]=useState<Visitor[]>([]),[search,setSearch]=useState("");
 const [status,setStatus]=useState("all"),[period,setPeriod]=useState("all");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState<any>({});
 const [user,setUser]=useState<any>(null);

 const load=useCallback(async()=>{
  if(!authorized)return;
  setBusy(true);setError("");
  const {data,error}=await supabase.from("pcms_visitors").select("*").order("visit_date",{ascending:false}).order("created_at",{ascending:false}).limit(1000);
  if(error)setError(error.message);else setRows((data??[]) as Visitor[]);
  setBusy(false);
 },[authorized,supabase]);

 useEffect(()=>{
  let alive=true;
  (async()=>{
   const {data:{session}}=await supabase.auth.getSession();
   if(!alive)return;
   if(!session){setChecking(false);return;}
   setUser(session.user);
   const {data,error}=await supabase.from("church_admins").select("user_id").eq("user_id",session.user.id).maybeSingle();
   if(!alive)return;
   setAuthorized(!error&&!!data);
   if(error)setError(error.message);
   setChecking(false);
  })();
  return()=>{alive=false;};
 },[supabase]);
 useEffect(()=>{if(authorized)void load();},[authorized,load]);

 const filtered=useMemo(()=>rows.filter(r=>{
  const q=search.toLowerCase().trim();
  const matches=!q||[r.full_name,r.phone,r.assigned_to,r.notes].some(v=>String(v??"").toLowerCase().includes(q));
  const matchesStatus=status==="all"||r.follow_up_status===status;
  const matchesPeriod=period==="all"||(period==="today"?r.visit_date===today():period==="week"?r.visit_date>=new Date(Date.now()-7*86400000).toISOString().slice(0,10):r.visit_date.slice(0,7)===today().slice(0,7));
  return matches&&matchesStatus&&matchesPeriod;
 }),[rows,search,status,period]);

 const startNew=()=>{setDraft({full_name:"",phone:"",visit_date:today(),first_time:true,follow_up_status:"pending",assigned_to:"",notes:""});setEditing(true);setError("");setNotice("");};
 const edit=(r:Visitor)=>{setDraft({...r});setEditing(true);setError("");setNotice("");};
 const save=async(e:React.FormEvent)=>{
  e.preventDefault();setBusy(true);setError("");setNotice("");
  const payload={full_name:clean(draft.full_name??""),phone:clean(draft.phone??""),visit_date:draft.visit_date||today(),first_time:!!draft.first_time,follow_up_status:draft.follow_up_status||"pending",assigned_to:clean(draft.assigned_to??""),notes:clean(draft.notes??""),created_by:user?.id};
  if(!payload.full_name){setError("Please enter the visitor's name.");setBusy(false);return;}
  const result=draft.id?await supabase.from("pcms_visitors").update({...payload,created_by:undefined}).eq("id",draft.id):await supabase.from("pcms_visitors").insert(payload);
  if(result.error)setError(result.error.message);else{setNotice("Visitor record saved.");setEditing(false);await load();}
  setBusy(false);
 };
 const remove=async(r:Visitor)=>{
  if(!window.confirm("Delete this visitor record permanently?"))return;
  setBusy(true);const {data:deleted,error}=await supabase.from("pcms_visitors").delete().eq("id",r.id).select("id").maybeSingle();
  if(error)setError("Delete failed: "+error.message);else if(!deleted)setError("No visitor record was deleted. Refresh the register and verify administrator permissions.");else{setNotice("Visitor record deleted.");await load();}setBusy(false);
 };
 const convertToMember=async(r:Visitor)=>{
  const parts=r.full_name.trim().split(/\s+/);
  if(parts.length<2){setError("Add the visitor's full name (first and last name) before registering them as a member.");return;}
  if(!window.confirm("Create a new church member record for "+r.full_name+"? The visitor record will remain in the visitor history."))return;
  setBusy(true);setError("");setNotice("");
  const memberNumber="VIS-"+new Date().getFullYear()+"-"+r.id.replace(/-/g,"").slice(0,8).toUpperCase();
  const {error}=await supabase.from("church_members").insert({member_number:memberNumber,first_name:parts[0],middle_name:parts.length>2?parts.slice(1,-1).join(" "):"",last_name:parts[parts.length-1],phone:r.phone,congregation:"PEACE (SUMALISM) CONGREGATION",member_status:"active",group_assignment:"age_based",created_by:user?.id,updated_by:user?.id});
  if(error)setError(error.message);else setNotice(r.full_name+" has been added to the member register. The visitor history has been retained.");
  setBusy(false);
 };
 const exportCsv=()=>{
  const quote=(v:any)=>'"'+String(v??"").replace(/"/g,'""')+'"';
  const data=[["Visitor","Phone","Visit date","First time","Follow-up","Assigned to","Notes"],...filtered.map(r=>[r.full_name,r.phone,r.visit_date,r.first_time?"Yes":"No",r.follow_up_status,r.assigned_to,r.notes])];
  const blob=new Blob(["\uFEFF"+data.map(row=>row.map(quote).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="peace-congregation-visitors.csv";a.click();window.setTimeout(() => URL.revokeObjectURL(url), 1500);
 };

 if(checking)return <main className="admin-shell"><div className="container"><section className="member-panel">Checking administrator access…</section></div></main>;
 if(!authorized)return <main className="admin-shell"><div className="container"><section className="member-panel"><h1>Visitor follow-up</h1><p>Sign in with an approved church administrator account to access confidential visitor details.</p>{error&&<p className="admin-error">{error}</p>}<a className="btn" href="/admin">Go to administrator sign in</a></section></div></main>;

 const pending=rows.filter(r=>["pending","contacted","invited"].includes(r.follow_up_status)).length;
 const firstTime=rows.filter(r=>r.first_time).length;
 const returned=rows.filter(r=>["returned","connected"].includes(r.follow_up_status)).length;
 return <main className="admin-shell"><div className="container admin-container">
  <div className="member-top"><div><span className="eyebrow">CONFIDENTIAL CHURCH RECORDS</span><h1>Visitor welcome & follow-up</h1><p>Record first-time visitors, assign a church contact, track follow-up and welcome returning visitors into the congregation.</p></div><div className="member-top-actions"><a className="btn btn-secondary" href="/admin">← Website admin</a><a className="btn btn-secondary" href="/admin/members">Member register</a><button className="btn" onClick={exportCsv}>Export CSV</button></div></div>
  <div className="member-stats"><div><strong>{rows.length}</strong><span>Total visitor records</span></div><div><strong>{firstTime}</strong><span>First-time visitors</span></div><div><strong>{pending}</strong><span>Follow-ups to complete</span></div><div><strong>{returned}</strong><span>Returned / connected</span></div></div>
  <section className="member-panel">
   <div className="member-toolbar"><div><h2>Visitor register</h2><p>Keep contact details private and record only information needed for a respectful welcome and follow-up.</p></div><button className="btn" onClick={startNew}>+ Register visitor</button></div>
   {notice&&<p className="admin-success" role="status">{notice}</p>}{error&&<p className="admin-error" role="alert">{error}</p>}
   <div className="member-toolbar"><input className="member-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, assigned person…"/><select className="member-input" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All follow-up statuses</option>{statuses.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select><select className="member-input" value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">All dates</option><option value="today">Today</option><option value="week">Last 7 days</option><option value="month">This month</option></select></div>
   {editing&&<form className="member-editor" onSubmit={save}><div className="member-editor-heading"><div><h2>{draft.id?"Update visitor":"Register a visitor"}</h2><p>Record the visitor's details and assign a follow-up contact.</p></div><button type="button" className="admin-close" onClick={()=>setEditing(false)}>Close</button></div><div className="member-form-grid">
    <label>Full name *<input className="member-input" value={draft.full_name??""} onChange={e=>setDraft({...draft,full_name:e.target.value})} required/></label>
    <label>Phone number<input className="member-input" type="tel" value={draft.phone??""} onChange={e=>setDraft({...draft,phone:e.target.value})}/></label>
    <label>Visit date<input className="member-input" type="date" value={draft.visit_date??today()} onChange={e=>setDraft({...draft,visit_date:e.target.value})} required/></label>
    <label>Follow-up status<select className="member-input" value={draft.follow_up_status??"pending"} onChange={e=>setDraft({...draft,follow_up_status:e.target.value})}>{statuses.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select></label>
    <label>Assigned church contact<input className="member-input" value={draft.assigned_to??""} onChange={e=>setDraft({...draft,assigned_to:e.target.value})} placeholder="Name of elder, usher or member"/></label>
    <label className="member-checkbox"><input type="checkbox" checked={!!draft.first_time} onChange={e=>setDraft({...draft,first_time:e.target.checked})}/> First-time visitor</label>
    <label className="member-wide">Follow-up notes<textarea className="member-input" rows={3} value={draft.notes??""} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder="Record brief follow-up details; avoid unnecessary sensitive information."/></label>
   </div><div className="member-editor-actions"><button className="btn" disabled={busy}>{busy?"Saving…":"Save visitor"}</button><button type="button" className="btn btn-secondary" onClick={()=>setEditing(false)}>Cancel</button></div></form>}
   <div className="member-table-wrap"><table className="data-table"><thead><tr><th>Visitor</th><th>Visit date</th><th>Type</th><th>Follow-up</th><th>Assigned to</th><th>Contact</th><th>Actions</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><strong>{r.full_name}</strong><small>{r.notes||"No notes"}</small></td><td>{r.visit_date}</td><td>{r.first_time?"First visit":"Returning"}</td><td><span className={"member-status "+(r.follow_up_status==="closed"||r.follow_up_status==="connected"?"active":"inactive")}>{r.follow_up_status}</span></td><td>{r.assigned_to||"Unassigned"}</td><td>{r.phone||"—"}</td><td><div className="admin-row-actions"><button onClick={()=>edit(r)}>Update</button>{r.phone&&<a href={"https://wa.me/"+r.phone.replace(/\D/g,"")} target="_blank" rel="noreferrer">WhatsApp</a>}<button onClick={()=>void convertToMember(r)}>Add as member</button><button className="danger" onClick={()=>void remove(r)}>Delete</button></div></td></tr>)}{!filtered.length&&<tr><td colSpan={7}>{busy?"Loading visitor records…":"No visitors match these filters."}</td></tr>}</tbody></table></div>
   <p className="member-results">Showing {filtered.length} of {rows.length} visitor records. Only approved administrators can access this information.</p>
  </section>
  <p className="admin-footnote">Use visitor contact information only for church-related follow-up and with appropriate consent. Exported CSV files contain private information and should be stored securely.</p>
 </div></main>;
}
