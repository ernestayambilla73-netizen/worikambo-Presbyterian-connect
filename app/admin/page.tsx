"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import QuickAccess from "../../components/QuickAccess";

type Row = Record<string, any>;
type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[] };
type Module = { label: string; table: string; key: string; fields: Field[]; columns: string[]; private?: boolean; album: string };

const modules: Module[] = [
 { label: "Homepage slideshow", album: "Homepage Slideshow", table: "church_gallery", key: "id", columns: ["image_url","title","caption","is_published","created_at"], fields: [{key:"title",label:"Slide title",required:true},{key:"caption",label:"Slide caption",type:"textarea"},{key:"album",label:"Collection",required:true},{key:"event_date",label:"Display date",type:"date"},{key:"image_url",label:"Slide image (upload from device)",type:"image",required:true},{key:"is_published",label:"Approve and publish on homepage",type:"checkbox"}]},
 { label: "Church gallery", album: "Church Life", table: "church_gallery", key: "id", columns: ["image_url","title","caption","album","is_published"], fields: [{key:"title",label:"Photo title",required:true},{key:"caption",label:"Caption / story",type:"textarea"},{key:"album",label:"Album / category",required:true},{key:"event_date",label:"Event date",type:"date"},{key:"image_url",label:"Photo (upload image)",type:"image",required:true},{key:"is_published",label:"Approve and publish in gallery",type:"checkbox"}]},
 { label: "Church news", album: "news", table: "church_posts", key: "id", columns: ["title","post_type","published_at","is_published"], fields: [{key:"post_type",label:"Content type",type:"select",options:["news"],required:true},{key:"title",label:"Title",required:true},{key:"body",label:"Full content",type:"textarea",required:true},{key:"event_date",label:"Date and time",type:"datetime-local"},{key:"venue",label:"Venue"},{key:"source_url",label:"Related link"},{key:"image_url",label:"Image URL (optional)"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "Events & programmes", album: "event", table: "church_posts", key: "id", columns: ["title","post_type","event_date","venue","is_published"], fields: [{key:"post_type",label:"Content type",type:"select",options:["event","service_programme"],required:true},{key:"title",label:"Event / programme title",required:true},{key:"body",label:"Programme details",type:"textarea"},{key:"event_date",label:"Date and time",type:"datetime-local"},{key:"venue",label:"Venue"},{key:"source_url",label:"Registration / information link"},{key:"image_url",label:"Poster image URL (optional)"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "Sermons & devotionals", album: "sermon", table: "church_posts", key: "id", columns: ["title","post_type","published_at","is_published"], fields: [{key:"post_type",label:"Content type",type:"select",options:["sermon","devotional"],required:true},{key:"title",label:"Title / theme",required:true},{key:"body",label:"Message / reflection",type:"textarea",required:true},{key:"event_date",label:"Message date",type:"date"},{key:"source_url",label:"Audio / video / Bible reference link"},{key:"image_url",label:"Cover image URL (optional)"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]},
 { label: "Ministries & fellowships", album: "ministries", table: "church_ministries", key: "id", columns: ["name","meeting_info","is_published"], fields: [{key:"name",label:"Ministry name",required:true},{key:"description",label:"About this ministry",type:"textarea",required:true},{key:"logo_url",label:"Official ministry logo (upload image)",type:"image"},{key:"meeting_info",label:"Meeting days and times"},{key:"href",label:"Public page link (optional)"},{key:"is_published",label:"Show publicly",type:"checkbox"}]},
 { label: "Homepage & page text", album: "home", table: "church_page_content", key: "slug", columns: ["slug","title","intro","updated_at"], fields: [{key:"slug",label:"Page key",required:true},{key:"title",label:"Heading",required:true},{key:"intro",label:"Introduction",type:"textarea"},{key:"body",label:"Main page content",type:"textarea"}]},
 { label: "Hymns & church resources", album: "hymn_link", table: "church_resources", key: "id", columns: ["title","resource_type","url","is_published"], fields: [{key:"title",label:"Resource title",required:true},{key:"resource_type",label:"Resource type",type:"select",options:["hymn_link","liturgy_link","course_material","other"],required:true},{key:"url",label:"Resource link",required:true},{key:"notes",label:"Description / notes",type:"textarea"},{key:"is_published",label:"Publish publicly",type:"checkbox"}]}
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
 const [previewUrls, setPreviewUrls] = useState<Record<string,string>>({});
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
   if (m.table === "church_gallery") query = m.album === "Homepage Slideshow" ? query.eq("album", "Homepage Slideshow") : query.neq("album", "Homepage Slideshow");
   const {data,error} = await query.limit(200);
   return {table:m.table + ":" + m.album,count:data?.length ?? 0,error};
  }));
  const nextCounts:Record<string,number> = {};
  results.forEach(r => { nextCounts[r.table] = r.count; });
  setCounts(nextCounts);
  let query = supabase.from(module.table).select("*").order(module.table === "church_page_content" ? "slug" : "created_at", {ascending:false});
  if (module.table === "church_gallery") query = module.album === "Homepage Slideshow" ? query.eq("album", "Homepage Slideshow") : query.neq("album", "Homepage Slideshow");
  const {data,error} = await query.limit(200);
  if (error) setError(error.message); else setRows(data ?? []);
  setBusy(false);
 }, [authorized, module, supabase]);

 useEffect(() => { load(); }, [load]);

 useEffect(() => {
  let cancelled = false;
  async function buildPreviews() {
   const next: Record<string,string> = {};
   for (const row of rows) {
    const marker = "/object/public/church-gallery/";
    const source = String(row.image_url || "");
    const position = source.indexOf(marker);
    if (position < 0) continue;
    const path = decodeURIComponent(source.slice(position + marker.length));
    const {data} = await supabase.storage.from("church-gallery").createSignedUrl(path, 3600);
    if (data?.signedUrl) next[row.id] = data.signedUrl;
   }
   if (!cancelled) setPreviewUrls(next);
  }
  void buildPreviews();
  return () => { cancelled = true; };
 }, [rows, supabase]);

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
 function startNew() { setDraft({...blank(module), album: module.album, post_type: module.table === "church_posts" ? module.album : undefined, slug: module.table === "church_page_content" ? module.album : undefined, resource_type: module.table === "church_resources" ? module.album : undefined, is_published: true}); setMediaFiles({}); setEditing(true); setError(""); setNotice(""); }
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
      is_published: true, created_by: session.id, updated_at: new Date().toISOString()
    });
    if (insertError) failures.push(file.name + ": " + insertError.message);
    else uploaded++;
   } catch (e) { failures.push(file.name + ": upload failed"); }
  }
  setBulkFiles([]);
  setBulkUploading(false); setBusy(false);
  if (failures.length) {
   setError(`Uploaded ${uploaded} of ${bulkFiles.length} photos. ` + failures.slice(0,3).join(" | "));
  } else setNotice(`Saved and published ${uploaded} photo${uploaded===1?"":"s"}. They are now available on the public ${module.album === "Homepage Slideshow" ? "homepage slideshow" : "church gallery"} and are listed below for review or deletion.`);
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
  else { setNotice(payload.is_published ? "Saved and published successfully. The image is now visible on the public website and in this administrator list." : "Saved successfully as a draft. It is visible in this administrator list; tick the publish option and save again to show it publicly."); setEditing(false); setMediaFiles({}); await load(); }
  setBusy(false);
 }
 async function remove(row: Row) {
  if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
  setBusy(true); setError(""); setNotice("");
  const {error} = await supabase.from(module.table).delete().eq(module.key,row[module.key]);
  if (error) setError(error.message); else {
   if (module.table === "church_gallery" && row.image_url) {
    const marker = "/object/public/church-gallery/";
    const position = String(row.image_url).indexOf(marker);
    if (position >= 0) {
     const objectPath = decodeURIComponent(String(row.image_url).slice(position + marker.length));
     const {error:storageError} = await supabase.storage.from("church-gallery").remove([objectPath]);
     if (storageError) setNotice("Gallery record deleted. The stored image file could not be removed automatically; ask the project owner to check storage.");
     else setNotice("Photo and database record deleted.");
    } else setNotice("Record deleted.");
   } else setNotice("Record deleted.");
   await load();
  }
  setBusy(false);
 }

 if (checking) return <main className="admin-shell"><div className="container"><div className="admin-panel">Checking administrator session…</div></div></main>;
 if (!authorized) return <main className="admin-shell"><div className="container admin-container"><section className="admin-panel admin-auth"><span className="eyebrow">PEACE (SUMALISM) CONGREGATION</span><h1>Administrator sign in</h1><p>Sign in with your Supabase account. Only accounts explicitly approved in the church administrator list can manage website content.</p><form onSubmit={signIn} className="admin-form"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></label><button className="btn" disabled={busy}>{busy ? "Please wait…" : "Sign in securely"}</button><button type="button" className="admin-link-button" disabled={busy} onClick={createAccount}>Create an account for approval</button></form>{notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}<p className="admin-muted">Creating an account does not make you an administrator. Access is granted separately by the project owner.</p></section></div></main>;

 return <main className="admin-shell"><div className="container admin-container">
  <div className="admin-top"><div><span className="eyebrow">CONTROL CENTRE</span><h1>Peace Congregation administration</h1><p>Signed in as {session.email}. Your dashboard is arranged into four clear sections: people, daily church work, website content and public website.</p></div><button className="btn btn-secondary" onClick={signOut}>Sign out</button></div>
  
  <section className="admin-panel" style={{marginBottom:24}}>
   <div className="admin-content-head"><div><span className="eyebrow">ADMINISTRATOR HOME</span><h2>Welcome to your church control centre</h2><p>Use the sections below in order. Start with people and daily church work, then manage website content and review the public website.</p></div></div>
   <div className="admin-summary">
    <a className="admin-summary-card" href="/admin/members"><strong>01</strong><span>Members &amp; death records</span></a>
    <a className="admin-summary-card" href="/admin/visitors"><strong>02</strong><span>Visitors &amp; follow-up</span></a>
    <a className="admin-summary-card" href="/admin/quick-desk"><strong>03</strong><span>Attendance &amp; finance desk</span></a>
    <a className="admin-summary-card" href="/admin/management"><strong>04</strong><span>Church operations &amp; records</span></a>
   </div>
   <div className="admin-content-head" style={{marginTop:22}}><div><h3>Website management</h3><p>Choose what you want to update on the public church website.</p></div></div>
   <div className="admin-summary">
    {modules.map((m,i)=><button key={m.table + ":" + m.album} className="admin-summary-card" onClick={()=>{setActive(i);setEditing(false);setNotice("");setError("");}}><strong>{counts[m.table + ":" + m.album] ?? "—"}</strong><span>{m.label}</span></button>)}
   </div>
  </section>
  <div className="admin-workspace"><aside className="admin-sidebar"><h2>Admin menu</h2>
   <strong className="admin-nav-heading">1. People</strong><a href="/admin/members">Member register &amp; groups ↗</a><a href="/admin/visitors">Visitor welcome &amp; follow-up ↗</a>
   <strong className="admin-nav-heading">2. Daily church work</strong><a href="/admin/quick-desk">Quick desk: attendance &amp; finance ↗</a><a href="/admin/management">Church operations &amp; records ↗</a>
   <strong className="admin-nav-heading">3. Website content</strong>{modules.map((m,i)=><button key={m.table + ":" + m.album} className={active===i?"active":""} onClick={()=>{setActive(i);setEditing(false);setNotice("");setError("");}}>{m.label}{m.private && <small>Private</small>}</button>)}
   <strong className="admin-nav-heading">4. Public website</strong><div className="admin-public-links">{[["Home","/"],["About","/about"],["Ministries","/ministries"],["News","/news"],["Events","/events"],["Gallery","/gallery"],["Contact","/contact"]].map(([label,href])=><a key={href} href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div><a href="/" target="_blank" rel="noreferrer">View public website ↗</a></aside>
   <section className="admin-content"><div className="admin-content-head"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h2>{module.label}</h2><p>{module.table==="church_posts" ? "Create and publish news, events, worship programmes, sermons and devotionals. Published items are available to the corresponding public content section." : module.table==="church_gallery" ? (module.album === "Homepage Slideshow" ? "Upload slide images separately here. New images stay as drafts until you preview and approve them. Only approved slides appear in the homepage carousel." : "Review all church-gallery photos here. Homepage slideshow items are managed separately.") : module.table==="church_ministries" ? "Manage ministry names, descriptions, official logos and meeting information. Publish or hide each ministry." : module.table==="church_page_content" ? "Edit reusable public page headings and text. The homepage uses the page key “home”." : module.table==="church_resources" ? "Manage links to hymns, liturgy, courses and other church resources." : "Create, edit, publish and remove information shown on the website."}</p></div><button className="btn" onClick={startNew}>+ Add new</button></div>
    {notice && <p className="admin-success" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}
    {module.table === "church_gallery" && <section className="admin-editor bulk-photo-upload">
      <div className="admin-editor-head"><div><h3>Quick photo upload</h3><p className="admin-muted">Upload several pictures at once. Each successful upload is saved, published and shown in the administrator list below.</p></div></div>
      <label className="bulk-photo-picker">Choose photos
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={e=>{const selected=Array.from(e.target.files ?? []);const tooLarge=selected.find(file=>file.size>10*1024*1024);if(tooLarge){setError(`${tooLarge.name} is larger than 10 MB. Choose smaller images.`);e.currentTarget.value="";return;}setBulkFiles(selected);setError("");}} />
      </label>
      {bulkFiles.length>0 && <div className="bulk-photo-summary"><strong>{bulkFiles.length} photo{bulkFiles.length===1?"":"s"} selected</strong><ul>{bulkFiles.map((file,i)=><li key={file.name+i}>{file.name}</li>)}</ul><button type="button" className="admin-close" onClick={()=>setBulkFiles([])}>Clear selection</button></div>}
      <p className="admin-muted">Photos are automatically titled from their filenames and published to “{module.album}”. They appear on the public website and in the administrator list below. You can edit or delete them at any time.</p>
      <button type="button" className="btn" disabled={!bulkFiles.length || busy} onClick={uploadMany}>{bulkUploading?"Uploading photos…":`Upload ${bulkFiles.length||""} selected photo${bulkFiles.length===1?"":"s"}`}</button>
    </section>}
    {editing && <form className="admin-editor" onSubmit={save}><div className="admin-editor-head"><h3>{draft[module.key] ? "Edit record" : "Create record"}</h3><button type="button" className="admin-close" onClick={()=>setEditing(false)}>Cancel</button></div><div className="admin-fields">{module.fields.map(f=><label key={f.key} className={f.type==="textarea"?"wide":""}>{f.label}{f.type==="textarea" ? <textarea placeholder={module.table==="church_posts" && f.key==="body" && draft.post_type==="service_programme" ? "Preacher: Rev. / Mr / Ms ...\nService leader: ...\nCall to worship: Psalm ...\nFirst Bible reading: Name — Book chapter:verses\nSecond Bible reading: Name — Book chapter:verses\nThird Bible reading: Name — Book chapter:verses\nSermon text/theme: ...\nHymns: ...\nNotices / other roles: ..." : undefined} value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required}/> : f.type==="image" ? <><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>{const file=e.target.files?.[0];if(file){if(file.size>10*1024*1024){setError("Choose an image smaller than 10 MB.");e.currentTarget.value="";return;}setMediaFiles({...mediaFiles,[f.key]:file});setError("");}}} required={!!f.required && !draft[f.key]}/>{(mediaFiles[f.key]||draft[f.key])&&<small>{mediaFiles[f.key]?.name || "Current image saved"}{draft[f.key]&&!mediaFiles[f.key]&&<> · <a href={previewUrls[draft.id] || draft[f.key]} target="_blank" rel="noreferrer">View current image</a></>}</small>}</> : f.type==="checkbox" ? <input type="checkbox" checked={!!draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.checked})}/> : f.type==="select" ? <select value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required}><option value="">Choose…</option>{f.options?.map(o=><option key={o} value={o}>{o.replaceAll("_"," ")}</option>)}</select> : <input type={f.type ?? "text"} value={draft[f.key] ?? ""} onChange={e=>setDraft({...draft,[f.key]:e.target.value})} required={f.required} readOnly={f.key===module.key && !!draft[f.key] && module.key==="slug"}/>}</label>)}</div><button className="btn" disabled={busy}>{busy?"Saving…":"Save changes"}</button></form>}
    <div className="admin-table-wrap">{busy && <p className="admin-muted">Loading…</p>}<table className="data-table"><thead><tr>{module.columns.map(c=><th key={c}>{c.replaceAll("_"," ")}</th>)}<th>Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row[module.key]}>{module.columns.map(c=><td key={c}>{c === "image_url" && row[c] ? <a href={previewUrls[row.id] || row[c]} target="_blank" rel="noreferrer" className="admin-image-preview-link"><img className="admin-image-preview" src={previewUrls[row.id] || row[c]} alt={row.title || "Uploaded church image"} loading="lazy"/><small>Open full image ↗</small></a> : c === "is_published" ? <span className={row[c] ? "status" : "status pending"}>{row[c] ? "Published" : "Draft · review"}</span> : display(row[c])}</td>)}<td><div className="admin-row-actions"><button onClick={()=>startEdit(row)}>Edit</button><button className="danger" onClick={()=>remove(row)}>Delete</button></div></td></tr>)}{!rows.length && !busy && <tr><td colSpan={module.columns.length+1}>No records yet. Select “Add new” to create the first one.</td></tr>}</tbody></table></div>
   </section>
  </div>
  <p className="admin-footnote">Media workflow: saved images appear in this administrator list. New uploads are published by default; you can uncheck the publish option to keep an item as a draft. Preview, edit or delete any item from Actions. Security: database row-level security enforces administrator access. Never place a Supabase service-role key in this website.</p>
 </div></main>;
}
