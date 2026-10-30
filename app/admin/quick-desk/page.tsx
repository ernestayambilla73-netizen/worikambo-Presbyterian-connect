"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type Member = { id:string; member_number:string; first_name:string; middle_name:string; last_name:string; phone:string; member_status:string };
type AttendanceRow = { id:string; attendee_name:string; attendance_date:string; attendance_type:string; member_id:string|null };
type FinanceRow = { id:string; entry_date:string; entry_type:string; category:string; description:string; amount:number; reference_code:string };

const today = () => new Date().toLocaleDateString("en-CA");
const csvDownload = (name:string, rows:any[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const quote = (v:any) => '"' + String(v ?? "").replace(/"/g,'""') + '"';
  const body = [headers.map(quote).join(","), ...rows.map(r=>headers.map(h=>quote(r[h])).join(","))].join("\r\n");
  const blob = new Blob(["\\uFEFF"+body],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href=url; a.download=name; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export default function QuickDeskPage() {
  const supabase = useMemo(()=>createClient(),[]);
  const [checking,setChecking]=useState(true),[authorized,setAuthorized]=useState(false),[admin,setAdmin]=useState(false);
  const [tab,setTab]=useState<"attendance"|"finance"|"search">("attendance");
  const [members,setMembers]=useState<Member[]>([]),[attendance,setAttendance]=useState<AttendanceRow[]>([]),[finance,setFinance]=useState<FinanceRow[]>([]);
  const [date,setDate]=useState(today()),[service,setService]=useState("Sunday service"),[selected,setSelected]=useState<string[]>([]);
  const [query,setQuery]=useState(""),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const [financeDraft,setFinanceDraft]=useState({entry_date:today(),entry_type:"income",category:"Sunday offering",description:"",amount:"",reference_code:""});
  const [financeMonth,setFinanceMonth]=useState(today().slice(0,7));

  const load = useCallback(async()=>{
    if(!authorized)return;
    setLoading(true);setError("");
    const [m,a,f] = await Promise.all([
      supabase.from("church_members").select("id,member_number,first_name,middle_name,last_name,phone,member_status").eq("member_status","active").order("last_name").limit(5000),
      supabase.from("pcms_attendance").select("id,attendee_name,attendance_date,attendance_type,member_id").order("attendance_date",{ascending:false}).limit(1000),
      admin ? supabase.from("pcms_finance").select("id,entry_date,entry_type,category,description,amount,reference_code").order("entry_date",{ascending:false}).limit(2000) : Promise.resolve({data:[],error:null})
    ]);
    if(m.error)setError(m.error.message); else setMembers(m.data??[]);
    if(a.error)setError(a.error.message); else setAttendance(a.data??[]);
    if(f.error)setError(f.error.message); else setFinance((f.data??[]) as FinanceRow[]);
    setLoading(false);
  },[authorized,admin,supabase]);

  useEffect(()=>{let alive=true;(async()=>{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){if(alive)setChecking(false);return;}
    const {data,error}=await supabase.from("church_admins").select("role").eq("user_id",session.user.id).maybeSingle();
    if(alive){setAuthorized(!error&&!!data);setAdmin(data?.role==="admin");setChecking(false);if(error)setError(error.message);}
  })();return()=>{alive=false};},[supabase]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    if(!authorized)return;
    const existing=attendance.filter(a=>a.attendance_date===date&&a.attendance_type===service&&a.member_id).map(a=>a.member_id as string);
    setSelected(existing);
  },[attendance,date,service,authorized]);

  const presentCount=attendance.filter(a=>a.attendance_date===date&&a.attendance_type===service).length;
  const monthRows=finance.filter(r=>r.entry_date?.slice(0,7)===financeMonth);
  const income=monthRows.filter(r=>r.entry_type.toLowerCase()==="income").reduce((s,r)=>s+Number(r.amount||0),0);
  const expenses=monthRows.filter(r=>r.entry_type.toLowerCase()!=="income").reduce((s,r)=>s+Number(r.amount||0),0);
  const filteredMembers=members.filter(m=>!query||`${m.first_name} ${m.middle_name} ${m.last_name} ${m.member_number} ${m.phone}`.toLowerCase().includes(query.toLowerCase()));
  const filteredVisitors=attendance.filter(a=>!query||a.attendee_name.toLowerCase().includes(query.toLowerCase()));

  const saveAttendance=async()=>{
    setSaving(true);setError("");setNotice("");
    const rows=selected.map(id=>{const m=members.find(x=>x.id===id)!;return {member_id:id,attendee_name:[m.first_name,m.middle_name,m.last_name].filter(Boolean).join(" "),attendance_date:date,attendance_type:service};});
    if(rows.length){
      const {error:e}=await supabase.from("pcms_attendance").upsert(rows,{onConflict:"member_id,attendance_date,attendance_type"});
      if(e){setError(e.message);setSaving(false);return;}
    }
    setNotice(`Attendance saved. ${rows.length} members marked present for ${service} on ${date}.`);
    await load();setSaving(false);
  };

  const saveFinance=async(e:React.FormEvent)=>{
    e.preventDefault();setSaving(true);setError("");setNotice("");
    const amount=Number(financeDraft.amount);
    if(!Number.isFinite(amount)||amount<=0){setError("Enter an amount greater than zero.");setSaving(false);return;}
    const {data:{user}}=await supabase.auth.getUser();
    const {error:e2}=await supabase.from("pcms_finance").insert({...financeDraft,amount,created_by:user?.id});
    if(e2)setError(e2.message);else{setNotice("Financial entry saved.");setFinanceDraft({...financeDraft,description:"",amount:"",reference_code:""});await load();}
    setSaving(false);
  };

  if(checking)return <main className="admin-shell"><div className="container"><section className="member-panel">Checking administrator access…</section></div></main>;
  if(!authorized)return <main className="admin-shell"><div className="container"><section className="member-panel"><h1>Quick church desk</h1><p>Sign in with an approved church administrator account.</p><a className="btn" href="/admin">Go to administrator sign in</a></section></div></main>;

  return <main className="admin-shell"><div className="container admin-container">
    <div className="member-top"><div><span className="eyebrow">PEACE (SUMALISM) CONGREGATION</span><h1>Quick church desk</h1><p>Fast attendance, finance entry and record lookup.</p></div><div className="member-top-actions"><a className="btn btn-secondary" href="/admin/management">All records</a><a className="btn btn-secondary" href="/admin">Admin home</a></div></div>
    <div className="member-stats"><div><strong>{members.length}</strong><span>Active members</span></div><div><strong>{presentCount}</strong><span>Present in selected service</span></div><div><strong>{attendance.length}</strong><span>Attendance entries loaded</span></div>{admin&&<div><strong>GH₵ {income.toFixed(2)}</strong><span>Income this month</span></div>}</div>
    <section className="member-panel">
      <div className="member-tabs">
        <button className={tab==="attendance"?"active":""} onClick={()=>setTab("attendance")}>Fast attendance</button>
        {admin&&<button className={tab==="finance"?"active":""} onClick={()=>setTab("finance")}>Finance desk</button>}
        <button className={tab==="search"?"active":""} onClick={()=>setTab("search")}>Search records</button>
      </div>
      {notice&&<p className="admin-success" role="status">{notice}</p>}{error&&<p className="admin-error" role="alert">{error}</p>}
      {tab==="attendance"&&<div>
        <div className="member-toolbar"><div><h2>Take the service register</h2><p>Choose the service, tick the members present and save once. Previously saved members are already checked.</p></div></div>
        <div className="member-form-grid">
          <label>Service date<input className="member-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
          <label>Service / meeting<select className="member-input" value={service} onChange={e=>setService(e.target.value)}><option>Sunday service</option><option>Wednesday service</option><option>Youth service</option><option>Prayer meeting</option><option>Choir practice</option><option>Other programme</option></select></label>
          <label className="member-wide">Find a member<input className="member-input" placeholder="Search name, member number or phone" value={query} onChange={e=>setQuery(e.target.value)}/></label>
        </div>
        <div className="member-toolbar"><div><strong>{selected.length} selected</strong><p>{presentCount} existing attendance entries for this service</p></div><div className="member-top-actions"><button type="button" className="btn btn-secondary" onClick={()=>setSelected(filteredMembers.map(m=>m.id))}>Select visible</button><button type="button" className="btn btn-secondary" onClick={()=>setSelected([])}>Clear</button></div></div>
        <div className="member-table-wrap"><table className="data-table"><thead><tr><th>Present</th><th>Member</th><th>Member ID</th><th>Phone</th></tr></thead><tbody>{filteredMembers.map(m=><tr key={m.id}><td><input aria-label={`Mark ${m.first_name} ${m.last_name} present`} type="checkbox" checked={selected.includes(m.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,m.id]:old.filter(id=>id!==m.id))}/></td><td>{m.first_name} {m.middle_name} {m.last_name}</td><td>{m.member_number}</td><td>{m.phone||"—"}</td></tr>)}{!filteredMembers.length&&<tr><td colSpan={4}>No active members match this search.</td></tr>}</tbody></table></div>
        <div className="member-editor-actions"><button className="btn" disabled={saving||loading} onClick={()=>void saveAttendance()}>{saving?"Saving…":"Save attendance"}</button><button className="btn btn-secondary" onClick={()=>csvDownload("service-attendance.csv",selected.map(id=>{const m=members.find(x=>x.id===id)!;return {member_number:m.member_number,name:[m.first_name,m.middle_name,m.last_name].filter(Boolean).join(" "),service,date};}))}>Export selected</button></div>
      </div>}
      {tab==="finance"&&admin&&<div>
        <div className="member-toolbar"><div><h2>Quick financial entry</h2><p>Record each transaction once. Reports below recalculate automatically.</p></div></div>
        <form className="member-editor" onSubmit={saveFinance}><div className="member-form-grid">
          <label>Date<input className="member-input" type="date" required value={financeDraft.entry_date} onChange={e=>setFinanceDraft({...financeDraft,entry_date:e.target.value})}/></label>
          <label>Type<select className="member-input" value={financeDraft.entry_type} onChange={e=>setFinanceDraft({...financeDraft,entry_type:e.target.value})}><option value="income">Income</option><option value="expense">Expenditure</option></select></label>
          <label>Category<select className="member-input" value={financeDraft.category} onChange={e=>setFinanceDraft({...financeDraft,category:e.target.value})}>{(financeDraft.entry_type==="income"?["Sunday offering","Tithe","Thanksgiving","Donation","Fundraising","Welfare contribution","Other income"]:["Utilities","Transport","Maintenance","Welfare","Supplies","Events","Other expense"]).map(c=><option key={c}>{c}</option>)}</select></label>
          <label>Amount (GHS)<input className="member-input" type="number" min="0.01" step="0.01" required value={financeDraft.amount} onChange={e=>setFinanceDraft({...financeDraft,amount:e.target.value})}/></label>
          <label className="member-wide">Description<input className="member-input" value={financeDraft.description} onChange={e=>setFinanceDraft({...financeDraft,description:e.target.value})} placeholder="Short explanation"/></label>
          <label>Reference / receipt number<input className="member-input" value={financeDraft.reference_code} onChange={e=>setFinanceDraft({...financeDraft,reference_code:e.target.value})}/></label>
        </div><div className="member-editor-actions"><button className="btn" disabled={saving}>{saving?"Saving…":"Save transaction"}</button></div></form>
        <div className="member-toolbar"><div><h2>Monthly financial summary</h2><p>Income minus expenditure for the selected month.</p></div><input className="member-input" type="month" value={financeMonth} onChange={e=>setFinanceMonth(e.target.value)}/></div>
        <div className="member-stats"><div><strong>GH₵ {income.toFixed(2)}</strong><span>Total income</span></div><div><strong>GH₵ {expenses.toFixed(2)}</strong><span>Total expenditure</span></div><div><strong>GH₵ {(income-expenses).toFixed(2)}</strong><span>Net balance</span></div><div><strong>{monthRows.length}</strong><span>Transactions</span></div></div>
        <div className="member-table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount (GHS)</th><th>Reference</th></tr></thead><tbody>{monthRows.map(r=><tr key={r.id}><td>{r.entry_date}</td><td>{r.entry_type}</td><td>{r.category}</td><td>{r.description}</td><td>{Number(r.amount).toFixed(2)}</td><td>{r.reference_code||"—"}</td></tr>)}{!monthRows.length&&<tr><td colSpan={6}>No transactions for this month.</td></tr>}</tbody></table></div>
        <button className="btn btn-secondary" onClick={()=>csvDownload(`church-finance-${financeMonth}.csv`,monthRows)}>Export monthly finance CSV</button>
      </div>}
      {tab==="search"&&<div>
        <div className="member-toolbar"><div><h2>Find a record quickly</h2><p>Search registered members and attendance records loaded from the church database.</p></div></div>
        <input className="member-input" placeholder="Enter a name, member ID or phone number" value={query} onChange={e=>setQuery(e.target.value)}/>
        <h3>Members ({filteredMembers.length})</h3><div className="member-table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Member ID</th><th>Phone</th><th>Status</th></tr></thead><tbody>{filteredMembers.slice(0,100).map(m=><tr key={m.id}><td>{m.first_name} {m.middle_name} {m.last_name}</td><td>{m.member_number}</td><td>{m.phone||"—"}</td><td>{m.member_status}</td></tr>)}{!filteredMembers.length&&<tr><td colSpan={4}>No matching members.</td></tr>}</tbody></table></div>
        <h3>Attendance matches ({filteredVisitors.length})</h3><div className="member-table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Date</th><th>Service</th></tr></thead><tbody>{filteredVisitors.slice(0,100).map(a=><tr key={a.id}><td>{a.attendee_name}</td><td>{a.attendance_date}</td><td>{a.attendance_type}</td></tr>)}{!filteredVisitors.length&&<tr><td colSpan={3}>No matching attendance records.</td></tr>}</tbody></table></div>
        <button className="btn btn-secondary" onClick={()=>csvDownload("church-member-search.csv",filteredMembers.map(m=>({member_number:m.member_number,name:[m.first_name,m.middle_name,m.last_name].filter(Boolean).join(" "),phone:m.phone,status:m.member_status})))}>Export member results</button>
      </div>}
      {loading&&<p className="admin-muted">Refreshing records…</p>}
    </section>
    <p className="admin-footnote">Access is checked against the church administrator list. Finance is available only to admin-role users. Attendance is saved against each member and service date to prevent duplicate entries for the same member in the same service.</p>
  </div></main>;
}
