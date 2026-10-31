"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

const sections = [
 {title:"Members",description:"Member register, age groups and death records.",href:"/admin/members",icon:"01"},
 {title:"Visitors",description:"Register visitors and manage follow-up.",href:"/admin/visitors",icon:"02"},
 {title:"Daily church work",description:"Attendance, finance and record lookup.",href:"/admin/quick-desk",icon:"03"},
 {title:"Church management",description:"Events, pastoral care, prayer requests and church records.",href:"/admin/management",icon:"04"},
 {title:"Data backups",description:"Export a secure copy of church database records.",href:"/admin/backup",icon:"05"}
];

export default function AdminDashboard(){
 const supabase=useMemo(()=>createClient(),[]);
 const [checking,setChecking]=useState(true);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [authorized,setAuthorized]=useState(false);
 useEffect(()=>{
  let active=true;
  (async()=>{
   const {data:{session}}=await supabase.auth.getSession();
   if(!active)return;
   if(!session){setChecking(false);return;}
   setEmail(session.user.email||"");
   const {data,error}=await supabase.from("church_admins").select("user_id").eq("user_id",session.user.id).maybeSingle();
   if(!active)return;
   setAuthorized(!error&&!!data);
   if(error)setError(error.message);
   setChecking(false);
  })();
  return()=>{active=false};
 },[supabase]);
 async function signIn(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");setNotice("");
  const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
  if(error)setError(error.message);
  else {setAuthorized(true);setNotice("Signed in successfully.");}
  setBusy(false);
 }
 async function signOut(){await supabase.auth.signOut();setAuthorized(false);setEmail("");setPassword("");setNotice("Signed out.");}
 if(checking)return <section className="member-panel">Checking administrator access…</section>;
 if(!authorized)return <section className="member-panel" style={{maxWidth:520,margin:"30px auto",padding:28}}>
  <span className="eyebrow">PEACE (SUMALISM) CONGREGATION</span><h1>Administrator sign in</h1>
  <p>Sign in with your Supabase account. Only approved church administrators can access these records.</p>
  <form className="admin-form" onSubmit={signIn}>
   <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label>
   <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>
   <button className="btn" disabled={busy}>{busy?"Please wait…":"Sign in securely"}</button>
  </form>
  {error&&<p className="admin-error" role="alert">{error}</p>}{notice&&<p className="admin-success" role="status">{notice}</p>}
  <p className="admin-muted">If your account has not yet been approved, ask the project owner to grant administrator access.</p>
 </section>;
 return <div className="admin-home">
  <div className="member-top"><div><span className="eyebrow">ADMINISTRATOR HOME</span><h1>Peace Congregation control centre</h1><p>Choose a section below. Each section opens on its own page, with its own tools and add-record actions.</p></div><button className="btn btn-secondary" onClick={signOut}>Sign out</button></div>
  {notice&&<p className="admin-success" role="status">{notice}</p>}
  <div className="admin-summary">
   {sections.map(s=><Link className="admin-summary-card" href={s.href} key={s.href}><strong>{s.icon}</strong><span>{s.title}</span><small>{s.description}</small><b>Open section →</b></Link>)}
  </div>
 </div>;
}
