"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import QuickAccess from "../../components/QuickAccess";

type Row = Record<string, any>;
type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[] };
type Module = { label: string; table: string; key: string; fields: Field[]; columns: string[]; private?: boolean };

const modules: Module[] = [
 { label: "Congregations", table: "church_congregations", key: "id", columns: ["name","community","service_times","is_published"], fields: [
  {key:"name",label:"Congregation name",required:true},{key:"community",label:"Community"},{key:"address",label:"Address"},{key:"service_times",label:"Worship times",type:"textarea"},{key:"contact_name",label:"Contact person"},{key:"contact_phone",label:"Contact phone"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "News & events", table: "church_posts", key: "id", columns: ["post_type","title","event_date","is_published"], fields: [
  {key:"post_type",label:"Content type",type:"select",options:["news","event","sermon","devotional","service_programme"],required:true},{key:"title",label:"Title",required:true},{key:"body",label:"Content",type:"textarea"},{key:"image_url",label:"News cover image (upload)",type:"image"},{key:"event_date",label:"Event/date",type:"datetime-local"},{key:"venue",label:"Venue"},{key:"source_url",label:"Audio/video/source URL"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "Hero slideshow & gallery", table: "church_gallery", key: "id", columns: ["title","album","event_date","is_published"], fields: [
  {key:"title",label:"Photo title",required:true},{key:"caption",label:"Caption / story",type:"textarea"},{key:"album",label:"Album / category",required:true},{key:"event_date",label:"Event date",type:"date"},{key:"image_url",label:"Photo (upload image)",type:"image",required:true},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "Hymns & resources", table: "church_resources", key: "id", columns: ["title","resource_type","url","is_published"], fields: [
  {key:"title",label:"Resource title",required:true},{key:"resource_type",label:"Resource type",type:"select",options:["hymn_link","liturgy_link","course_material","other"],required:true},{key:"url",label:"Authorised resource URL"},{key:"notes",label:"Notes",type:"textarea"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "Church courses", table: "church_courses", key: "id", private: true, columns: ["title","course_date","materials_url"], fields: [
  {key:"title",label:"Course title",required:true},{key:"description",label:"Description",type:"textarea"},{key:"course_date",label:"Course date",type:"date"},{key:"materials_url",label:"Materials URL"}]},
 { label: "Ministries", table: "church_ministries", key: "id", columns: ["name","meeting_info","is_published"], fields: [
  {key:"name",label:"Ministry name",required:true},{key:"description",label:"Description",type:"textarea"},{key:"logo_url",label:"Logo image URL"},{key:"meeting_info",label:"Meeting details"},{key:"href",label:"Ministry page or link"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "Page content", table: "church_page_content", key: "slug", columns: ["slug","title","updated_at"], fields: [
  {key:"slug",label:"Page slug (e.g. about, contact)",required:true},{key:"title",label:"Page title",required:true},{key:"intro",label:"Page introduction",type:"textarea"},{key:"body",label:"Page content",type:"textarea"}]}
];

const blank = (m: Module): Row => Object.fromEntries(m.fields.map(f => [f.key, f.type === "checkbox" ? false : ""]));
const display = (v: any) => v === true ? "Published" : v === false ? "Draft / No" : v == null || v === "" ? "—" : String(v).replace("T"," ").slice(0,80);

export default function AdminDashboard() {
 const supabase = useMemo(() => createClient(), []);
 const [session, setSession] = useState<any>(null);
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [authorized, setAuthorized] = useState(false);
 const [checking, setChecking] = useState(true);
 const [active, setActive] = useState(0);
 const [rows, setRows] = useState<Row[]>([]);
 const [draft, setDraft] = useState<Row>({});
 const [editing, setEditing] = useState(false);
 const [busy, setBusy] = useState(false);
 const [notice, setNotice] = useState("");
 const [error, setError] = useState("");
 const [counts, setCounts] = useState<Record<string,number>>({});
 const [mediaFiles, setMediaFiles] = useState<Record<string,File>>({});
 const module = modules[active];

 const checkAccess = useCallback(async (user: any) => {
  if (!user) { setSession(null); setAuthorized(false); setChecking(false); return; }
  setSession(user);
  const { data, error: roleError } = await supabase.from("church_admins").select("user_id,role").eq("user_id", user.id).maybeSingle();
  setAuthorized(!roleError && !!data);
  setChecking(false);
  if (roleError) setError("Could not verify administrator access. Check the database policies.");
  else if (!data) setError("This account is signed in but is not yet registered as a church administrator. Ask the project owner to grant your account admin access.");
 }, [supabase]);

 useEffect(() => {
  supabase.auth.getSession().then(({data}) => checkAccess(data.session?.user));
  const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, next) => { checkAccess(next?.user); });
  return () => subscription.unsubscribe();
 }, [supabase, checkAccess]);

 const load = useCallback(async () => {
  if (!authorized) return;
  setBusy(true); setError("");
  const results = await Promise.all(modules.map(async m => {
   const {data,error} = await supabase.from(m.table).select("*").order(m.table === "church_page_content" ? "slug" : "created_at", {ascending:false}).limit(200);
   return {table:m.table,count:data?.length ?? 0,error};
  }));
  const nextCounts:Record<string,number> = {};
  results.forEach(r => { nextCounts[r.table] = r.count; });
  setCounts(nextCounts);
  const {data,error} = await supabase.from(module.table).select("*").order(module.table === "church_page_content" ? "slug" : "created_at", {ascending:false}).limit(200);
  if (error) setError(error.message); else setRows(data ?? []);
  setBusy(false);
 }, [authorized, module, supabase]);

 useEffect(() => { load(); }, [load]);

 async function signIn(e: React.FormEvent) {
  e.preventDefault(); setBusy(true); setError(""); setNotice("");
  const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password});
  if (error) setError(error.message);
  setBusy(false);
 }
 async function createAccount() {
  setBusy(true); setError(""); setNotice("");
  const {error} = await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/admin`}});
  if (error) setError(error.message);
  else { setNotice("Account request submitted. Verify your email if requested, then ask the project owner to grant administrator access. Registration alone does not grant privileges."); }
  setBusy(false);
 }
 async function signOut() { await supabase.auth.signOut(); setAuthorized(false); setSession(null); setRows([]); setNotice("Signed out."); }
 function startNew() { setDraft(blank(module)); setMediaFiles({}); setEditing(true); setError(""); setNotice(""); }
 function startEdit(row: Row) {
  const copy = {...row};
  if (copy.event_date) copy.event_date = String(copy.event_date).slice(0,16);
  if (copy.course_date) copy.course_date = String(copy.course_date).slice(0,10);
  setDraft(copy); setMediaFiles({}); setEditing(true); setError(""); setNotice("");
 }
 async function save(e: React.FormEvent) {
  e.preventDefault(); setBusy(true); setError(""); setNotice("");
  const payload:Row = {...draft};
  for (const f of module.fields) if (f.type === "image" && mediaFiles[f.key]) {
   const file = mediaFiles[f.key];
   const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
   const path = `${module.table}/${session.id}/${Date.now()}-${safeName}`;
   const {error:uploadError} = await supabase.storage.from("church-gallery").upload(path,file,{upsert:false,contentType:file.type});
   if (uploadError) { setError("Image upload failed: " + uploadError.message); setBusy(false); return; }
   payload[f.key] = supabase.storage.from("church-gallery").getPublicUrl(path).data.publicUrl;
  }
  for (const f of module.fields) if (f.type === "datetime-local" && payload[f.key]) payload[f.key] = new Date(payload[f.key]).toISOString();
  if (module.table === "church_posts" && payload.is_published) payload.published_at = new Date().toISOString();
  if (module.table === "church_posts" && !payload.is_published) payload.published_at = null;
  if (module.table === "church_gallery") payload.updated_at = new Date().toISOString();
  if (module.table === "church_page_content") { payload.updated_by = session.id; payload.updated_at = new Date().toISOString(); }
  else if (module.table !== "church_congregations" && module.table !== "church_ministries") payload.created_by = session.id;
  const {error} = await supabase.from(module.table).upsert(payload, {onConflict:module.key});
  if (error) setError(error.message);
  else { setNotice("Saved to the Presbyterian Connect database."); setEditing(false); setMediaFiles({}); await load(); }
  setBusy(false);
 }
 async function remove(row: Row) {
  if (!window.confirm("Delete this record? This cannot be undone.")) return;
  setBusy(true); setError(""); setNotice("");
  const {error} = await supabase.from(module.table).delete().eq(module.key,row[module.key]);
  if (error) setError(error.message); else { setNotice("Record deleted."); await load(); }
  setBusy(false);
 }

 if (checking) return <main className="admin-shell"><div className="container"><div className="admin-panel">Checking administrator session…</div></div></main>;
 if (!authorized) return <main className="admin-shell"><div className="container admin-container"><section className="admin-panel admin-auth"><span className="eyebrow">WORIKAMBO PRESBYTERIAN CONNECT</span><h1>Administrator sign in</h1><p>Sign in with your Supabase account. Only accounts explicitly approved in the church administrator list can manage website content.</p><form onSubmit={signIn} className="admin-form"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></label><button className="btn" disabled={busy}>{busy ? "Please wait…" : "Sign in securely"}</button><button type="button" className="admin-link-button" disabled={busy} onClick={createAccount}>Create an account for approval</button></form>{notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}<p className="admin-muted">Creating an account does not make you an administrator. Access is granted separately by the project owner.</p></section></div></main>;

 return <main className="admin-shell"><div className="container admin-container">
  <div className="admin-top"><div><span className="eyebrow">CONTROL CENTRE</span><h1>Website administration</h1><p>Signed in as {session.email}. Changes are stored in Supabase PostgreSQL.</p></div><button className="btn btn-secondary" onClick={signOut}>Sign out</button></div>
  
  <div className="admin-summary">{modules.map(m=><button key={m.table} className="admin-summary-card" onClick={()=>{setActive(modules.indexOf(m));setEditing(false);}}><strong>{counts[m.table] ?? "—"}</strong><span>{m.label}</span></button>)}</div>
  <div className="admin-workspace"><aside className="admin-sidebar"><h2>Manage website</h2><a href="/admin/members">Member register, death records &amp; groups ↗</a>{modules.map((m,i)=><button key={m.table} className={active===i?"active":""} onClick={()=>{setActive(i);setEditing(false);setNotice("");setError("");}}>{m.label}{m.private && <small>Private</small>}</button>)}<a href="/" target="_blank" rel="noreferrer">View public website ↗</a></aside>
   <section className="admin-content"><div className="admin-content-head"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h2>{module.label}</h2><p>{module.table==="church_posts" ? "Publish a news item by ticking “Publish publicly”. Published news appears on the public News page." : module.table==="church_gallery" ? "Upload and publish church photos here. Published photos automatically appear in the homepage hero slideshow and public Gallery; add seven or more photos for a longer sequence." : module.private ? "Private administrator-only records." : "Create, edit, publish and remove information shown on the website."}</p></div><button className="btn" onClick={startNew}>+ Add new</button></div>
    {notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}
    {editing && <form className="admin-editor" onSubmit={save}><div className="admin-editor-head"><h3>{draft[module.key] ? "Edit record" : "Create record"}</h3><button type="button" className="admin-close" onClick={()=>setEditing(false)}>Cancel</button></div><div className="admin-fields">{module.fields.map(f=><label key={f.key} className={f.type==="textarea"?"wide":""}>{f.label}{f.type==="textarea" ? <textarea placeholder={module.table==="church_posts" && f.key==="body" && draft.post_type==="service_programme" ? "Preacher: Rev. / Mr / Ms ...\nService leader: ...\nCall to worship: Psalm ...\nFirst Bible reading: Name — Book chapter:verses\nSecond Bible reading: Name — Book chapter:verses\nThird Bible reading: Name — Book chapter:verses\nSermon text/theme: ...\nHymns: ...\nNotices / other roles: ..." : undefined} value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required}/> : f.type==="image" ? <><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>{const file=e.target.files?.[0];if(file){if(file.size>10*1024*1024){setError("Choose an image smaller than 10 MB.");e.currentTarget.value="";return;}setMediaFiles({...mediaFiles,[f.key]:file});setError("");}}} required={!!f.required && !draft[f.key]}/>{(mediaFiles[f.key]||draft[f.key])&&<small>{mediaFiles[f.key]?.name || "Current image saved"}{draft[f.key]&&!mediaFiles[f.key]&&<> · <a href={draft[f.key]} target="_blank" rel="noreferrer">View current image</a></>}</small>}</> : f.type==="checkbox" ? <input type="checkbox" checked={!!draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.checked})}/> : f.type==="select" ? <select value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required}><option value="">Choose…</option>{f.options?.map(o=><option key={o} value={o}>{o.replaceAll("_"," ")}</option>)}</select> : <input type={f.type ?? "text"} value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required} readOnly={f.key===module.key && !!draft[f.key] && module.key==="slug"}/>}</label>)}</div><button className="btn" disabled={busy}>{busy?"Saving…":"Save changes"}</button></form>}
    <div className="admin-table-wrap">{busy && <p className="admin-muted">Loading…</p>}<table className="data-table"><thead><tr>{module.columns.map(c=><th key={c}>{c.replaceAll("_"," ")}</th>)}<th>Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row[module.key]}>{module.columns.map(c=><td key={c}>{display(row[c])}</td>)}<td><div className="admin-row-actions"><button onClick={()=>startEdit(row)}>Edit</button><button className="danger" onClick={()=>remove(row)}>Delete</button></div></td></tr>)}{!rows.length && !busy && <tr><td colSpan={module.columns.length+1}>No records yet. Select “Add new” to create the first one.</td></tr>}</tbody></table></div>
   </section>
  </div>
  <p className="admin-footnote">Security: database row-level security enforces administrator access. Never place a Supabase service-role key in this website.</p>
 </div></main>;
}
