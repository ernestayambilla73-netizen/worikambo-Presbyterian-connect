"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type Group = { id: string; name: string; description: string; min_age: number | null; max_age: number | null; active: boolean; sort_order: number };
type Member = {
 id: string; member_number: string; first_name: string; middle_name: string; last_name: string; date_of_birth: string | null;
 gender: string; phone: string; email: string; address: string; congregation: string; occupation: string; marital_status: string;
 baptism_status: string; confirmation_status: string; emergency_contact_name: string; emergency_contact_phone: string;
 member_group_id: string | null; group_assignment: "age_based" | "manual"; member_status: "active" | "inactive" | "transferred" | "deceased"; death_date: string | null; death_place: string; death_reported_by: string; death_notes: string; notes: string;
};
const emptyMember = (): Omit<Member,"id"> => ({
 member_number:"",first_name:"",middle_name:"",last_name:"",date_of_birth:"",gender:"",phone:"",email:"",address:"",
 congregation:"",occupation:"",marital_status:"",baptism_status:"",confirmation_status:"",emergency_contact_name:"",
 emergency_contact_phone:"",member_group_id:null,group_assignment:"age_based",member_status:"active",death_date:"",death_place:"",death_reported_by:"",death_notes:"",notes:""
});
const ageOf = (dob?: string | null) => {
 if (!dob) return null;
 const birth = new Date(dob + "T00:00:00");
 if (Number.isNaN(birth.getTime())) return null;
 const now = new Date();
 let age = now.getFullYear() - birth.getFullYear();
 if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
 return age < 0 ? null : age;
};
const ageLabel = (g: Group) => g.min_age == null && g.max_age == null ? "No age rule" : `${g.min_age ?? "0"}–${g.max_age == null ? "and above" : g.max_age} years`;
const inputClass = "member-input";

export default function MemberRegisterPage() {
 const supabase = useMemo(() => createClient(), []);
 const [checking,setChecking] = useState(true);
 const [authorized,setAuthorized] = useState(false);
 const [user,setUser] = useState<any>(null);
 const [tab,setTab] = useState<"members"|"groups">("members");
 const [members,setMembers] = useState<Member[]>([]);
 const [groups,setGroups] = useState<Group[]>([]);
 const [draft,setDraft] = useState<any>(emptyMember());
 const [groupDraft,setGroupDraft] = useState<any>({name:"",description:"",min_age:"",max_age:"",active:true,sort_order:100});
 const [editingMember,setEditingMember] = useState(false);
 const [editingGroup,setEditingGroup] = useState(false);
 const [editingGroupId,setEditingGroupId] = useState<string|null>(null);
 const [search,setSearch] = useState("");
 const [groupFilter,setGroupFilter] = useState("all");
 const [statusFilter,setStatusFilter] = useState("active");
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState("");
 const [notice,setNotice] = useState("");

 const load = useCallback(async () => {
  if (!authorized) return;
  setBusy(true); setError("");
  const [g,m] = await Promise.all([
   supabase.from("church_member_groups").select("*").order("sort_order").order("name"),
   supabase.from("church_members").select("*").order("last_name").order("first_name").limit(3000)
  ]);
  if (g.error) setError(g.error.message);
  else setGroups((g.data ?? []) as Group[]);
  if (m.error) setError(m.error.message);
  else setMembers((m.data ?? []) as Member[]);
  setBusy(false);
 },[authorized,supabase]);

 useEffect(() => {
  let alive = true;
  supabase.auth.getSession().then(async ({data}) => {
   const u = data.session?.user;
   if (!alive) return;
   if (!u) { setChecking(false); return; }
   setUser(u);
   const {data:role,error:roleError} = await supabase.from("church_admins").select("user_id,role").eq("user_id",u.id).maybeSingle();
   if (!alive) return;
   setAuthorized(!roleError && !!role);
   if (roleError) setError("Could not verify admin access: " + roleError.message);
   else if (!role) setError("This account does not have administrator permission.");
   setChecking(false);
  });
  const {data:{subscription}} = supabase.auth.onAuthStateChange(() => {});
  return () => { alive = false; subscription.unsubscribe(); };
 },[supabase]);
 useEffect(()=>{ if (authorized) void load(); },[authorized,load]);

 const filtered = useMemo(() => members.filter(m => {
  const q = search.trim().toLowerCase();
  const full = `${m.first_name} ${m.middle_name} ${m.last_name} ${m.member_number} ${m.phone} ${m.email}`.toLowerCase();
  return (!q || full.includes(q)) && (groupFilter==="all" || m.member_group_id===groupFilter) && (statusFilter==="all" || m.member_status===statusFilter);
 }),[members,search,groupFilter,statusFilter]);
 const groupName = (id:string|null) => groups.find(g=>g.id===id)?.name ?? "Unassigned";
 const assignedByAge = (dob:string|null|undefined) => {
  const age = ageOf(dob);
  if (age == null) return null;
  const match = groups.filter(g=>g.active && (g.min_age != null || g.max_age != null) && (g.min_age == null || age>=g.min_age) && (g.max_age == null || age<=g.max_age)).sort((a,b)=>a.sort_order-b.sort_order)[0];
  return match?.id ?? null;
 };
 const newMember = () => {
  const next = emptyMember();
  next.member_number = `WPC-${new Date().getFullYear()}-${String(members.length+1).padStart(4,"0")}`;
  setDraft(next); setEditingMember(true); setNotice(""); setError("");
 };
 const editMember = (m:Member) => { setDraft({...m,date_of_birth:m.date_of_birth ?? ""}); setEditingMember(true); setNotice(""); setError(""); };
 const updateMemberField = (key:string,value:any) => {
  setDraft((prev:any) => {
   const next = {...prev,[key]:value};
   if (key==="date_of_birth" && next.group_assignment==="age_based") next.member_group_id = assignedByAge(value);
   if (key==="group_assignment" && value==="age_based") next.member_group_id = assignedByAge(next.date_of_birth);
   return next;
  });
 };
 const saveMember = async (e:React.FormEvent) => {
  e.preventDefault(); setBusy(true); setError(""); setNotice("");
  const payload:any = {...draft,created_by:draft.id ? undefined : user?.id,updated_by:user?.id};
  delete payload.id;
  if (payload.date_of_birth==="") payload.date_of_birth=null;
  if (!payload.member_number?.trim()) { setError("Member number is required."); setBusy(false); return; }
  const {error:saveError} = draft.id
   ? await supabase.from("church_members").update(payload).eq("id",draft.id)
   : await supabase.from("church_members").insert(payload);
  if (saveError) setError(saveError.message);
  else { setNotice("Member record saved successfully."); setEditingMember(false); await load(); }
  setBusy(false);
 };
 const deleteMember = async (m:Member) => {
  if (!window.confirm(`Delete the record for ${m.first_name} ${m.last_name}? This cannot be undone.`)) return;
  setBusy(true); const {error:e} = await supabase.from("church_members").delete().eq("id",m.id);
  if (e) setError(e.message); else {setNotice("Member record deleted."); await load();}
  setBusy(false);
 };
 const startGroup = (g?:Group) => {
  setEditingGroupId(g?.id ?? null);
  setGroupDraft(g ? {...g,min_age:g.min_age ?? "",max_age:g.max_age ?? ""} : {name:"",description:"",min_age:"",max_age:"",active:true,sort_order:100});
  setEditingGroup(true);setNotice("");setError("");
 };
 const saveGroup = async (e:React.FormEvent) => {
  e.preventDefault(); setBusy(true);setError("");setNotice("");
  const payload:any = {...groupDraft,min_age:groupDraft.min_age===""?null:Number(groupDraft.min_age),max_age:groupDraft.max_age===""?null:Number(groupDraft.max_age),sort_order:Number(groupDraft.sort_order||100)};
  delete payload.id;
  const {error:e2} = editingGroupId ? await supabase.from("church_member_groups").update(payload).eq("id",editingGroupId) : await supabase.from("church_member_groups").insert(payload);
  if (e2) setError(e2.message);
  else {setNotice("Membership group and age range saved. Existing records can be reassigned when you edit them.");setEditingGroup(false);await load();}
  setBusy(false);
 };
 const deleteGroup = async (g:Group) => {
  if (!window.confirm(`Delete the “${g.name}” group? Members in it will become unassigned.`)) return;
  setBusy(true);const {error:e}=await supabase.from("church_member_groups").delete().eq("id",g.id);
  if(e)setError(e.message);else{setNotice("Group deleted.");await load();}setBusy(false);
 };
 const exportCsv = () => {
  const headers=["Member number","First name","Middle name","Last name","Date of birth","Age","Gender","Phone","Email","Address","Congregation","Occupation","Marital status","Baptism","Confirmation","Group","Status","Emergency contact","Emergency phone"];
  const quote=(v:any)=>`"${String(v??"").replace(/"/g,'""')}"`;
  const lines=[headers,...filtered.map(m=>[m.member_number,m.first_name,m.middle_name,m.last_name,m.date_of_birth,ageOf(m.date_of_birth),m.gender,m.phone,m.email,m.address,m.congregation,m.occupation,m.marital_status,m.baptism_status,m.confirmation_status,groupName(m.member_group_id),m.member_status,m.emergency_contact_name,m.emergency_contact_phone])].map(row=>row.map(quote).join(",")).join("\r\n");
  const blob=new Blob(["\uFEFF"+lines],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="worikambo-member-register.csv";a.click();URL.revokeObjectURL(url);
 };

 if (checking) return <main className="admin-shell"><div className="container"><div className="member-panel">Checking administrator access…</div></div></main>;
 if (!authorized) return <main className="admin-shell"><div className="container"><section className="member-panel"><span className="eyebrow">WORIKAMBO PRESBYTERIAN CONNECT</span><h1>Member register</h1><p>Sign in through the main administrator page using an approved account before opening confidential member records.</p>{error&&<p className="admin-error">{error}</p>}<a className="btn" href="/admin">Go to administrator sign in</a></section></div></main>;

 return <main className="admin-shell"><div className="container admin-container">
  <div className="member-top"><div><span className="eyebrow">CONFIDENTIAL CHURCH RECORDS</span><h1>Membership register</h1><p>Manage member details, calculate ages, and assign age-based groups using the ranges configured by the district.</p></div><div className="member-top-actions"><a className="btn btn-secondary" href="/admin">← Website admin</a><button className="btn" onClick={exportCsv}>Export CSV</button></div></div>
  <div className="member-stats"><div><strong>{members.length}</strong><span>Total registered members</span></div><div><strong>{members.filter(m=>m.member_status==="active").length}</strong><span>Active members</span></div><div><strong>{members.filter(m=>{const a=ageOf(m.date_of_birth);return a!==null&&a<18;}).length}</strong><span>Members under 18</span></div><div><strong>{members.filter(m=>m.member_status==="deceased").length}</strong><span>Death records</span></div></div>
  <div className="member-panel">
   <div className="member-tabs"><button className={tab==="members"?"active":""} onClick={()=>{setTab("members");setEditingMember(false);setEditingGroup(false);}}>Member records</button><button className={tab==="groups"?"active":""} onClick={()=>{setTab("groups");setEditingMember(false);setEditingGroup(false);}}>Groups & age ranges</button><button type="button" onClick={()=>{setTab("members");setStatusFilter("deceased");setEditingMember(false);setEditingGroup(false);}}>Death records ({members.filter(m=>m.member_status==="deceased").length})</button></div>
   {notice&&<p className="admin-success" role="status">{notice}</p>}{error&&<p className="admin-error" role="alert">{error}</p>}
   {tab==="members" && <>
    <div className="member-toolbar"><input className={inputClass} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, member ID, phone or email…"/><select className={inputClass} value={groupFilter} onChange={e=>setGroupFilter(e.target.value)}><option value="all">All groups</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select><select className={inputClass} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="active">Active members</option><option value="inactive">Inactive</option><option value="transferred">Transferred</option><option value="deceased">Deceased</option><option value="all">All statuses</option></select><button className="btn" onClick={newMember}>+ Add member</button></div>
    {editingMember&&<form className="member-editor" onSubmit={saveMember}>
     <div className="member-editor-heading"><div><h2>{draft.id?"Edit member record":"Register a new member"}</h2><p>Fields marked * are required. Age is calculated from date of birth.</p></div><button type="button" className="admin-close" onClick={()=>setEditingMember(false)}>Close</button></div>
     <div className="member-form-grid">
      <label>Member number *<input className={inputClass} value={draft.member_number??""} onChange={e=>updateMemberField("member_number",e.target.value)} required/></label>
      <label>First name *<input className={inputClass} value={draft.first_name??""} onChange={e=>updateMemberField("first_name",e.target.value)} required/></label>
      <label>Middle name<input className={inputClass} value={draft.middle_name??""} onChange={e=>updateMemberField("middle_name",e.target.value)}/></label>
      <label>Last name *<input className={inputClass} value={draft.last_name??""} onChange={e=>updateMemberField("last_name",e.target.value)} required/></label>
      <label>Date of birth<input className={inputClass} type="date" max={new Date().toISOString().slice(0,10)} value={draft.date_of_birth??""} onChange={e=>updateMemberField("date_of_birth",e.target.value)}/><small>Calculated age: {ageOf(draft.date_of_birth)==null?"Not provided":`${ageOf(draft.date_of_birth)} years`}</small></label>
      <label>Gender<select className={inputClass} value={draft.gender??""} onChange={e=>updateMemberField("gender",e.target.value)}><option value="">Select…</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
      <label>Phone number<input className={inputClass} type="tel" value={draft.phone??""} onChange={e=>updateMemberField("phone",e.target.value)}/></label>
      <label>Email address<input className={inputClass} type="email" value={draft.email??""} onChange={e=>updateMemberField("email",e.target.value)}/></label>
      <label>Congregation<input className={inputClass} value={draft.congregation??""} onChange={e=>updateMemberField("congregation",e.target.value)} placeholder="Local congregation"/></label>
      <label>Occupation<input className={inputClass} value={draft.occupation??""} onChange={e=>updateMemberField("occupation",e.target.value)}/></label>
      <label>Marital status<select className={inputClass} value={draft.marital_status??""} onChange={e=>updateMemberField("marital_status",e.target.value)}><option value="">Select…</option><option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option><option>Prefer not to say</option></select></label>
      <label>Membership group<select className={inputClass} value={draft.member_group_id??""} onChange={e=>{updateMemberField("member_group_id",e.target.value||null);updateMemberField("group_assignment",e.target.value?"manual":"age_based");}}><option value="">Unassigned / auto-match by age</option>{groups.filter(g=>g.active).map(g=><option key={g.id} value={g.id}>{g.name} ({ageLabel(g)})</option>)}</select><small>{draft.group_assignment==="manual"?"Manual group selection":"Group will be matched using the configured age ranges."}</small></label>
      <label>Assignment mode<select className={inputClass} value={draft.group_assignment??"age_based"} onChange={e=>updateMemberField("group_assignment",e.target.value)}><option value="age_based">Automatic by age</option><option value="manual">Manual group selection</option></select></label>
      <label>Membership status<select className={inputClass} value={draft.member_status??"active"} onChange={e=>updateMemberField("member_status",e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="transferred">Transferred</option><option value="deceased">Deceased</option></select></label>
      {draft.member_status==="deceased" && <><label>Date of death<input className={inputClass} type="date" value={draft.death_date??""} onChange={e=>updateMemberField("death_date",e.target.value||null)}/></label><label>Place of death<input className={inputClass} value={draft.death_place??""} onChange={e=>updateMemberField("death_place",e.target.value)}/></label><label>Reported by<input className={inputClass} value={draft.death_reported_by??""} onChange={e=>updateMemberField("death_reported_by",e.target.value)} placeholder="Name of reporting relative / church officer"/></label><label className="member-wide">Death record notes<textarea className={inputClass} value={draft.death_notes??""} onChange={e=>updateMemberField("death_notes",e.target.value)} placeholder="Optional church record details"/></label></>}
      <label>Baptism status<select className={inputClass} value={draft.baptism_status??""} onChange={e=>updateMemberField("baptism_status",e.target.value)}><option value="">Not recorded</option><option>Baptised</option><option>Not baptised</option><option>Unknown</option></select></label>
      <label>Confirmation status<select className={inputClass} value={draft.confirmation_status??""} onChange={e=>updateMemberField("confirmation_status",e.target.value)}><option value="">Not recorded</option><option>Confirmed</option><option>Not confirmed</option><option>Unknown</option></select></label>
      <label className="member-wide">Residential address<textarea className={inputClass} value={draft.address??""} onChange={e=>updateMemberField("address",e.target.value)}/></label>
      <label>Emergency contact name<input className={inputClass} value={draft.emergency_contact_name??""} onChange={e=>updateMemberField("emergency_contact_name",e.target.value)}/></label>
      <label>Emergency contact phone<input className={inputClass} type="tel" value={draft.emergency_contact_phone??""} onChange={e=>updateMemberField("emergency_contact_phone",e.target.value)}/></label>
      <label className="member-wide">Notes<textarea className={inputClass} value={draft.notes??""} onChange={e=>updateMemberField("notes",e.target.value)} placeholder="Additional membership details (avoid storing passwords or sensitive financial credentials)."/></label>
     </div>
     <div className="member-editor-actions"><button className="btn" disabled={busy}>{busy?"Saving…":"Save member record"}</button><button type="button" className="btn btn-secondary" onClick={()=>setEditingMember(false)}>Cancel</button></div>
    </form>}
    <div className="member-table-wrap"><table className="data-table member-table"><thead><tr><th>Member</th><th>Age</th><th>Group</th><th>Contact</th><th>Congregation</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(m=><tr key={m.id}><td><strong>{m.first_name} {m.middle_name} {m.last_name}</strong><small>{m.member_number}</small></td><td>{ageOf(m.date_of_birth)??"—"}</td><td>{groupName(m.member_group_id)}</td><td>{m.phone||m.email||"—"}</td><td>{m.congregation||"—"}</td><td><span className={"member-status "+m.member_status}>{m.member_status}</span></td><td><div className="admin-row-actions"><button onClick={()=>editMember(m)}>Edit</button><button className="danger" onClick={()=>deleteMember(m)}>Delete</button></div></td></tr>)}{!filtered.length&&<tr><td colSpan={7}>{busy?"Loading records…":"No matching member records. Use “Add member” to register someone."}</td></tr>}</tbody></table></div>
    <p className="member-results">Showing {filtered.length} of {members.length} members. Member data is private to approved church administrators.</p>
   </>}
   {tab==="groups"&&<>
    <div className="member-groups-heading"><div><h2>Ministries and age ranges</h2><p>Set the age boundaries used to assign members automatically. The first matching active range by order is applied.</p></div><button className="btn" onClick={()=>startGroup()}>+ Add group</button></div>
    {editingGroup&&<form className="member-editor" onSubmit={saveGroup}><div className="member-editor-heading"><h2>{editingGroupId?"Edit group":"Create group"}</h2><button type="button" className="admin-close" onClick={()=>setEditingGroup(false)}>Close</button></div><div className="member-form-grid"><label>Group name *<input className={inputClass} value={groupDraft.name} onChange={e=>setGroupDraft({...groupDraft,name:e.target.value})} required/></label><label>Display order<input className={inputClass} type="number" value={groupDraft.sort_order} onChange={e=>setGroupDraft({...groupDraft,sort_order:e.target.value})}/></label><label>Minimum age<input className={inputClass} type="number" min="0" value={groupDraft.min_age} onChange={e=>setGroupDraft({...groupDraft,min_age:e.target.value})} placeholder="Leave blank for no minimum"/></label><label>Maximum age<input className={inputClass} type="number" min="0" value={groupDraft.max_age} onChange={e=>setGroupDraft({...groupDraft,max_age:e.target.value})} placeholder="Leave blank for no maximum"/></label><label className="member-wide">Description<input className={inputClass} value={groupDraft.description} onChange={e=>setGroupDraft({...groupDraft,description:e.target.value})}/></label><label className="member-checkbox"><input type="checkbox" checked={!!groupDraft.active} onChange={e=>setGroupDraft({...groupDraft,active:e.target.checked})}/> Active for automatic assignment</label></div><div className="member-editor-actions"><button className="btn" disabled={busy}>{busy?"Saving…":"Save group settings"}</button><button type="button" className="btn btn-secondary" onClick={()=>setEditingGroup(false)}>Cancel</button></div></form>}
    <div className="member-group-list">{groups.map(g=><article className="member-group-card" key={g.id}><div className="member-group-icon">♙</div><div className="member-group-main"><h3>{g.name}</h3><p>{g.description||"No description added."}</p><span>{ageLabel(g)}</span></div><div className="member-group-actions"><span className={"member-status "+(g.active?"active":"inactive")}>{g.active?"Active":"Inactive"}</span><button onClick={()=>startGroup(g)}>Edit</button><button className="danger" onClick={()=>deleteGroup(g)}>Delete</button></div></article>)}</div>
    <div className="notice blue">Age ranges are district-configurable suggestions, not a statement of official Presbyterian policy. Confirm the approved age limits with your district leadership. If ranges overlap, the group with the lowest display order is chosen for automatic assignment.</div>
   </>}
  </div>
  <p className="admin-footnote">Protect member privacy: only approved administrators can access this register. Do not record passwords, PINs, or unrelated sensitive credentials in member notes.</p>
 </div></main>;
}
