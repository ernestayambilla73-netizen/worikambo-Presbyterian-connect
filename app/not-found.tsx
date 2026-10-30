import Icon from "../components/Icon";

export default function NotFound() {
  return (
    <main className="system-state-page">
      <section className="system-state-card" aria-labelledby="not-found-title">
        <span className="eyebrow">PEACE (SUMALISM) CONGREGATION</span>
        <div className="system-state-icon" aria-hidden="true"><Icon name="church" size={30} /></div>
        <h1 id="not-found-title">This page could not be found.</h1>
        <p>The link may have changed, or the page may no longer be available. You can return to the church homepage and continue from there.</p>
        <a className="btn" href="/">Return to homepage <Icon name="arrow-up-right" size={16} /></a>
      </section>
    </main>
  );
}
