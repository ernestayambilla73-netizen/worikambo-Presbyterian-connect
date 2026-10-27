"use client";

import { useEffect, useMemo, useState } from "react";

type Photo = { id:string; title:string; caption?:string|null; image_url:string; album?:string|null; event_date?:string|null };
const categories = [
  {label:"Church & worship",value:"all"},
  {label:"Men's Fellowship",value:"men"},
  {label:"Women's Fellowship",value:"women"},
  {label:"Children's Service",value:"children"},
  {label:"Junior Youth (JY)",value:"jy"},
  {label:"Young People's Guild (YPG)",value:"ypg"},
  {label:"Prayer & Bible study",value:"prayer"},
];
const officialSlides = [
  {title:"Gathered as one church family",caption:"Presbyterian Church of Ghana — congregational worship",image:"https://pcgonline.org/wp-content/uploads/2021/04/Welcome.jpg"},
  {title:"A home for worship and fellowship",caption:"Presbyterian Church of Ghana — church building",image:"https://pcgonline.org/wp-content/uploads/2021/04/Welcome1a.jpg"},
];
function categoryFor(album:string){const value=(album||"").toLowerCase();if(value.includes("men"))return "men";if(value.includes("women"))return "women";if(value.includes("children"))return "children";if(value==="jy"||value.includes("junior youth"))return "jy";if(value.includes("ypg")||value.includes("young people"))return "ypg";if(value.includes("prayer")||value.includes("bible"))return "prayer";return "all";}
export default function HomePhotoSlideshow({photos}:{photos:Photo[]}) {
  const [category,setCategory]=useState("all");
  const [active,setActive]=useState(0);
  const filtered=useMemo(()=>photos.filter(p=>categoryFor(p.album||"")===(category==="all"?"all":category)),[photos,category]);
  const slides=filtered.length ? filtered.map(p=>({title:p.title,caption:p.caption||p.album||"Worikambo Presbyterian District",image:p.image_url})) : category==="all" ? officialSlides : [];
  useEffect(()=>{setActive(0)},[category]);
  useEffect(()=>{if(slides.length<2)return;const timer=window.setInterval(()=>setActive(v=>(v+1)%slides.length),5500);return()=>window.clearInterval(timer)},[slides.length,category]);
  const slide=slides[active]||slides[0];
  return <section className="section home-photo-section" aria-label="Church life photo slideshow"><div className="container">
    <div className="section-heading"><div><span className="eyebrow">LIFE IN OUR CHURCH</span><h2>Faith, fellowship and service.</h2></div><p>See our church family in worship and community. District photo uploads appear here as they are approved for public viewing.</p></div>
    <div className="photo-category-tabs" role="group" aria-label="Filter church photos">{categories.map(c=><button key={c.value} type="button" className={category===c.value?"active":""} onClick={()=>setCategory(c.value)}>{c.label}</button>)}</div>
    {slide ? <div className="home-photo-stage"><img src={slide.image} alt={slide.title} loading="lazy"/><div className="home-photo-shade"/><div className="home-photo-caption"><span>WORIKAMBO PRESBYTERIAN CONNECT</span><h3>{slide.title}</h3><p>{slide.caption}</p></div>{slides.length>1&&<div className="home-photo-controls"><button type="button" aria-label="Previous photo" onClick={()=>setActive(v=>(v-1+slides.length)%slides.length)}>‹</button><span>{active+1} / {slides.length}</span><button type="button" aria-label="Next photo" onClick={()=>setActive(v=>(v+1)%slides.length)}>›</button></div>}</div> : <div className="home-photo-empty"><strong>{categories.find(c=>c.value===category)?.label} photos are not uploaded yet.</strong><p>Once an authorised administrator uploads real photos to the Gallery and chooses this category as the album, they will appear here automatically.</p><a className="text-link" href="/gallery">View public gallery →</a></div>}
    <p className="home-photo-source">Official PCG reference photos shown where district albums have not yet been uploaded. Use only approved, genuine congregation photos for ministry-specific albums.</p>
  </div></section>;
}
