"use client";

import { useEffect, useState } from "react";

type Slide = {
  id: string;
  title: string;
  caption?: string | null;
  image_url: string;
};

export default function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) {
    return (
      <section className="hero-slideshow hero-slideshow-empty" aria-label="Homepage slideshow">
        <div className="hero-slide-empty-state">
          <span className="eyebrow">OUR CHURCH FAMILY</span>
          <h2>Your church slideshow starts here</h2>
          <p>Approved pictures uploaded by the administrator will appear here. No sample or preset photos are displayed.</p>
          <a className="btn" href="/admin">Manage slideshow ↗</a>
        </div>
      </section>
    );
  }

  const current = slides[Math.min(active, slides.length - 1)];
  return (
    <section className="hero-slideshow" aria-label="Homepage slideshow">
      <div className="hero-slide-image">
        <img key={current.id} src={current.image_url} alt={current.title} />
        <div className="hero-slide-shade" />
        <div className="hero-slide-copy">
          <span className="hero-slide-kicker">PEACE CONGREGATION · CHURCH LIFE</span>
          <h2>{current.title}</h2>
          {current.caption && <p>{current.caption}</p>}
        </div>
        {slides.length > 1 && <div className="hero-slide-controls">
          <button type="button" aria-label="Previous slide" onClick={() => setActive((active - 1 + slides.length) % slides.length)}>‹</button>
          <span>{active + 1}<i>/</i>{slides.length}</span>
          <button type="button" aria-label={paused ? "Play slideshow" : "Pause slideshow"} className="hero-slide-pause" onClick={() => setPaused(!paused)}>{paused ? "▶" : "Ⅱ"}</button>
          <button type="button" aria-label="Next slide" onClick={() => setActive((active + 1) % slides.length)}>›</button>
        </div>}
      </div>
      {slides.length > 1 && <div className="hero-slide-dots" aria-label="Choose a slide">
        {slides.map((slide, index) => <button key={slide.id} type="button" className={index === active ? "active" : ""} aria-label={`Show slide ${index + 1}: ${slide.title}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} />)}
      </div>}
    </section>
  );
}
