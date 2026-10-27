"use client";

import { useEffect, useMemo, useState } from "react";

type Photo = { id:string; title:string; caption?:string|null; image_url:string; album?:string|null; event_date?:string|null };
const fallbackSlides = [
  {title:"A church family united in faith",caption:"Presbyterian Church of Ghana · Peace Congregation",image:"https://pcgonline.org/wp-content/uploads/2021/04/Welcome.jpg"},
  {title:"Worship, fellowship and service",caption:"A welcoming place to grow together",image:"https://pcgonline.org/wp-content/uploads/2021/04/Welcome1a.jpg"},
];

export default function HomePhotoSlideshow({photos}:{photos:Photo[]}) {
  const slides = useMemo(() => {
    const uploaded = photos.map(p => ({title:p.title,caption:p.caption || p.album || "Peace Congregation",image:p.image_url}));
    return uploaded.length ? uploaded : fallbackSlides;
  },[photos]);
  const [active,setActive] = useState(0);
  const [paused,setPaused] = useState(false);
  useEffect(()=>{ if(paused || slides.length<2)return; const timer=window.setInterval(()=>setActive(v=>(v+1)%slides.length),5000); return()=>window.clearInterval(timer); },[slides.length,paused]);
  useEffect(()=>{setActive(v=>Math.min(v,Math.max(0,slides.length-1)));},[slides.length]);
  const slide=slides[active] || slides[0];
  return <aside className="hero-slideshow" aria-label="Peace Congregation photo slideshow" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
    <div className="hero-slide-image" key={slide.image}>
      <img src={slide.image} alt={slide.title} fetchPriority={active===0?"high":"auto"} />
      <div className="hero-slide-shade" />
      <div className="hero-slide-copy">
        <span className="hero-slide-kicker">PEACE CONGREGATION · PCG</span>
        <h2>{slide.title}</h2>
        <p>{slide.caption}</p>
      </div>
      {slides.length>1 && <div className="hero-slide-controls">
        <button type="button" aria-label="Previous scene" onClick={()=>setActive(v=>(v-1+slides.length)%slides.length)}>‹</button>
        <span>{String(active+1).padStart(2,"0")} <i>/</i> {String(slides.length).padStart(2,"0")}</span>
        <button type="button" aria-label="Next scene" onClick={()=>setActive(v=>(v+1)%slides.length)}>›</button>
        <button type="button" className="hero-slide-pause" onClick={()=>setPaused(v=>!v)} aria-label={paused?"Resume slideshow":"Pause slideshow"}>{paused?"▶":"Ⅱ"}</button>
      </div>}
    </div>
    <div className="hero-slide-dots" aria-label="Choose a scene">{slides.map((item,i)=><button key={item.image+i} type="button" className={i===active?"active":""} onClick={()=>setActive(i)} aria-label={`Show scene ${i+1}: ${item.title}`} />)}</div>
    <div className="hero-slide-admin-note">Manage scenes in <a href="/admin">Admin Dashboard → Gallery</a>. Publish more than six photos to create a longer slideshow.</div>
  </aside>;
}
