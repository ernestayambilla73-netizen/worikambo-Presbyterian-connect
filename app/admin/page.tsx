"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import QuickAccess from "../../components/QuickAccess";

type Row = Record<string, any>;
type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[] };
type Module = { label: string; table: string; key: string; fields: Field[]; columns: string[]; private?: boolean; album: string };

const modules: Module[] = [
 { label: "Homepage slideshow", album: "Homepage Slideshow", table: "church_gallery", key: "id", columns: ["image_url","title","caption","is_published","created_at"], fields: [
  {key:"title",label:"Slide title",required:true},{key:"caption",label:"Slide caption",type:"textarea"},{key:"album",label:"Collection",required:true},{key:"event_date",label:"Display date",type:"date"},{key:"image_url",label:"Slide image (upload from device)",type:"image",required:true},{key:"is_published",label:"Approve and publish on homepage",type:"checkbox"}]},
 { label: "Church gallery", album: "Church Life", table: "church_gallery", key: "id", columns: ["image_url","title","caption","album","is_published"], fields: [
  {key:"title",label:"Photo title",required:true},{key:"caption",label:"Caption / story",type:"textarea"},{key:"album",label:"Album / category",required:true},{key:"event_date",label:"Event date",type:"date"},{key:"image_url",label:"Photo (upload image)",type:"image",required:true},{key:"is_published",label:"Approve and publish in gallery",type:"checkbox"}]}
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
 const [bulkFiles, setBulkFiles] = useState<File[]>([]);
 const [bulkUploading, setBulkUploading] = useState(false);
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
   let query = supabase.from(m.table).select("*").order(m.table === "church_page_content" ? "slug" : "created_at", {ascending:false});
   if (m.table === "church_gallery") query = query.eq("album", m.album);
   const {data,error} = await query.limit(200);
   return {table:m.table + ":" + m.album,count:data?.length ?? 0,error};
  }));
  const nextCounts:Record<string,number> = {};
  results.forEach(r => { nextCounts[r.table] = r.count; });
  setCounts(nextCounts);
  let query = supabase.from(module.table).select("*").order(module.table === "church_page_content" ? "slug" : "created_at", {ascending:false});
  if (module.table === "church_gallery") query = query.eq("album", module.album);
  const {data,error} = await query.limit(200);
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
 function startNew() { setDraft({...blank(module), album: module.album, is_published: false}); setMediaFiles({}); setEditing(true); setError(""); setNotice(""); }
 function startEdit(row: Row) {
  const copy = {...row};
  if (copy.event_date) copy.event_date = String(copy.event_date).slice(0,16);
  if (copy.course_date) copy.course_date = String(copy.course_date).slice(0,10);
  setDraft(copy); setMediaFiles({}); setEditing(true); setError(""); setNotice("");
 }
 async function uploadMany() {
  if (!bulkFiles.length || module.table !== "church_gallery") return;
  setBulkUploading(true); setBusy(true); setError(""); setNotice("");
  let uploaded = 0;
  const failures: string[] = [];
  for (const file of bulkFiles) {
   try {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path = `church_gallery/${session.id}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName}`;
    const {error:uploadError} = await supabase.storage.from("church-gallery").upload(path,file,{upsert:false,contentType:file.type});
    if (uploadError) { failures.push(file.name + ": " + uploadError.message); continue; }
    const title = file.name.replace(/\\.[^.]+$/,"").replace(/[_-]+/g," ").trim() || "Church photo";
    const image_url = supabase.storage.from("church-gallery").getPublicUrl(path).data.publicUrl;
    const {error:insertError} = await supabase.from("church_gallery").insert({
      title, caption: "", album: module.album, event_date: null, image_url,
      is_published: false, created_by: session.id, updated_at: new Date().toISOString()
    });
    if (insertError) failures.push(file.name + ": " + insertError.message);
    else uploaded++;
   } catch (e) { failures.push(file.name + ": upload failed"); }
  }
  setBulkFiles([]);
  setBulkUploading(false); setBusy(false);
  if (failures.length) {
   setError(`Uploaded ${uploaded} of ${bulkFiles.length} photos. ` + failures.slice(0,3).join(" | "));
  } else setNotice(`Uploaded ${uploaded} photo${uploaded===1?"":"s"} as draft${uploaded===1?"":"s"}. Review the previews below, edit captions if needed, then tick the publish box to make them public.`);
  await load();
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
  else { setNotice("Saved to the Peace Congregation database."); setEditing(false); setMediaFiles({}); await load(); }
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
 if (!authorized) return <main className="admin-shell"><div className="container admin-container"><section className="admin-panel admin-auth"><span className="eyebrow">PEACE (SUMALISM) CONGREGATION</span><h1>Administrator sign in</h1><p>Sign in with your Supabase account. Only accounts explicitly approved in the church administrator list can manage website content.</p><form onSubmit={signIn} className="admin-form"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></label><button className="btn" disabled={busy}>{busy ? "Please wait…" : "Sign in securely"}</button><button type="button" className="admin-link-button" disabled={busy} onClick={createAccount}>Create an account for approval</button></form>{notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}<p className="admin-muted">Creating an account does not make you an administrator. Access is granted separately by the project owner.</p></section></div></main>;

 return <main className="admin-shell"><div className="container admin-container">
  <div className="admin-top"><div><span className="eyebrow">CONTROL CENTRE</span><h1>Peace Congregation administration</h1><p>Signed in as {session.email}. Changes are stored in Supabase PostgreSQL.</p></div><button className="btn btn-secondary" onClick={signOut}>Sign out</button></div>
  
  <div className="admin-summary">
   {modules.map(m=><button key={m.table} className="admin-summary-card" onClick={()=>{setActive(modules.indexOf(m));setEditing(false);}}><strong>{counts[m.table + ":" + m.album] ?? "—"}</strong><span>{m.label}</span></button>)}
   <a className="admin-summary-card" href="/admin/members"><strong>↗</strong><span>Member registration &amp; death records</span></a>
  </div>
  <div className="admin-workspace"><aside className="admin-sidebar"><h2>Manage website</h2><a href="/admin/members">Member register, death records &amp; groups ↗</a>{modules.map((m,i)=><button key={m.table} className={active===i?"active":""} onClick={()=>{setActive(i);setEditing(false);setNotice("");setError("");}}>{m.label}{m.private && <small>Private</small>}</button>)}<a href="/" target="_blank" rel="noreferrer">View public website ↗</a></aside>
   <section className="admin-content"><div className="admin-content-head"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h2>{module.label}</h2><p>{module.table==="church_posts" ? "Publish a news item by ticking “Publish publicly”. Published news appears on the public News page." : module.table==="church_gallery" ? "Upload and publish church photos here. Published photos automatically appear in the homepage hero slideshow and public Gallery; add seven or more photos for a longer sequence." : module.private ? "Private administrator-only records." : "Create, edit, publish and remove information shown on the website."}</p></div><button className="btn" onClick={startNew}>+ Add new</button></div>
    {notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}
    {module.table === "church_gallery" && <section className="admin-editor bulk-photo-upload">
      <div className="admin-editor-head"><div><h3>Quick photo upload</h3><p className="admin-muted">Select several pictures at once. No need to fill in each photo's details.</p></div></div>
      <label className="bulk-photo-picker">Choose photos
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={e=>{const selected=Array.from(e.target.files ?? []);const tooLarge=selected.find(file=>file.size>10*1024*1024);if(tooLarge){setError(`${tooLarge.name} is larger than 10 MB. Choose smaller images.`);e.currentTarget.value="";return;}setBulkFiles(selected);setError("");}} />
      </label>
      {bulkFiles.length>0 && <div className="bulk-photo-summary"><strong>{bulkFiles.length} photo{bulkFiles.length===1?"":"s"} selected</strong><ul>{bulkFiles.map((file,i)=><li key={file.name+i}>{file.name}</li>)}</ul><button type="button" className="admin-close" onClick={()=>setBulkFiles([])}>Clear selection</button></div>}
      <p className="admin-muted">Photos are automatically titled from their filenames and saved to “{module.album}” as drafts. Check the image previews below, then edit and publish only the pictures you approve.</p>
      <button type="button" className="btn" disabled={!bulkFiles.length || busy} onClick={uploadMany}>{bulkUploading?"Uploading photos…":`Upload ${bulkFiles.length||""} selected photo${bulkFiles.length===1?"":"s"}`}</button>
    </section>}
    {editing && <form className="admin-editor" onSubmit={save}><div className="admin-editor-head"><h3>{draft[module.key] ? "Edit record" : "Create record"}</h3><button type="button" className="admin-close" onClick={()=>setEditing(false)}>Cancel</button></div><div className="admin-fields">{module.fields.map(f=><label key={f.key} className={f.type==="textarea"?"wide":""}>{f.label}{f.type==="textarea" ? <textarea placeholder={module.table==="church_posts" && f.key==="body" && draft.post_type==="service_programme" ? "Preacher: Rev. / Mr / Ms ...\nService leader: ...\nCall to worship: Psalm ...\nFirst Bible reading: Name — Book chapter:verses\nSecond Bible reading: Name — Book chapter:verses\nThird Bible reading: Name — Book chapter:verses\nSermon text/theme: ...\nHymns: ...\nNotices / other roles: ..." : undefined} value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required}/> : f.type==="image" ? <><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>{const file=e.target.files?.[0];if(file){if(file.size>10*1024*1024){setError("Choose an image smaller than 10 MB.");e.currentTarget.value="";return;}setMediaFiles({...mediaFiles,[f.key]:file});setError("");}}} required={!!f.required && !draft[f.key]}/>{(mediaFiles[f.key]||draft[f.key])&&<small>{mediaFiles[f.key]?.name || "Current image saved"}{draft[f.key]&&!mediaFiles[f.key]&&<> · <a href={draft[f.key]} target="_blank" rel="noreferrer">View current image</a></>}</small>}</> : f.type==="checkbox" ? <input type="checkbox" checked={!!draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.checked})}/> : f.type==="select" ? <select value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required}><option value="">Choose…</option>{f.options?.map(o=><option key={o} value={o}>{o.replaceAll("_"," ")}</option>)}</select> : <input type={f.type ?? "text"} value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required} readOnly={f.key===module.key && !!draft[f.key] && module.key==="slug"}/>}</label>)}</div><button className="btn" disabled={busy}>{busy?"Saving…":"Save changes"}</button></form>}
    <div className="admin-table-wrap">{busy && <p className="admin-muted">Loading…</p>}<table className="data-table"><thead><tr>{module.columns.map(c=><th key={c}>{c.replaceAll("_"," ")}</th>)}<th>Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row[module.key]}>{module.columns.map(c=><td key={c}>{c === "image_url" && row[c] ? <a href={row[c]} target="_blank" rel="noreferrer" className="admin-image-preview-link"><img className="admin-image-preview" src={row[c]} alt={row.title || "Uploaded church image"} loading="lazy"/><small>Open full image ↗</small></a> : c === "is_published" ? <span className={row[c] ? "status" : "status pending"}>{row[c] ? "Published" : "Draft · review"}</span> : display(row[c])}</td>)}<td><div className="admin-row-actions"><button onClick={()=>startEdit(row)}>Edit</button><button className="danger" onClick={()=>remove(row)}>Delete</button></div></td></tr>)}{!rows.length && !busy && <tr><td colSpan={module.columns.length+1}>No records yet. Select “Add new” to create the first one.</td></tr>}</tbody></table></div>
   </section>
  </div>
  <p className="admin-footnote">Review workflow: every new image starts as a draft. Preview it, edit its title/caption, and publish only after checking it. You can delete an incorrect image from Actions. Security: database row-level security enforces administrator access. Never place a Supabase service-role key in this website.</p>
 </div></main>;
}
