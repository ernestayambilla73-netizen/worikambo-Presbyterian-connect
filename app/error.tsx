"use client";

import Icon from "../components/Icon";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="system-state-page">
      <section className="system-state-card" aria-labelledby="error-title" role="alert">
        <span className="eyebrow">PEACE (SUMALISM) CONGREGATION</span>
        <div className="system-state-icon" aria-hidden="true"><Icon name="shield" size={30} /></div>
        <h1 id="error-title">We could not load this page.</h1>
        <p>Your request did not finish successfully. Please try again. If the problem continues, contact the church administrator and report which page you were opening.</p>
        <button className="btn" type="button" onClick={reset}>Try again <Icon name="arrow-up-right" size={16} /></button>
        <a className="system-state-home" href="/">Return to homepage</a>
      </section>
    </main>
  );
}
