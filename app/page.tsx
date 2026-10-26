const cards = [
  {icon:"⌂",title:"Our Congregations",text:"Find local congregations and discover worship times and contact details.",href:"/congregations",cta:"Find a church"},
  {icon:"✝",title:"Church Groups",text:"Explore Children's Service, Junior Youth, YPG, YAF and adult fellowships.",href:"/ministries",cta:"Explore ministries"},
  {icon:"▤",title:"News & Announcements",text:"Read district updates, church notices and stories from our congregations.",href:"/news",cta:"Read latest news"},
  {icon:"▦",title:"Events & Programmes",text:"Keep up with worship services, harvests, conferences and special programmes.",href:"/events",cta:"View events"},
  {icon:"♫",title:"Hymns & Liturgy",text:"Find the official PCG Resources app for hymns and liturgical materials.",href:"/hymns",cta:"Open resources"},
  {icon:"☼",title:"Daily Devotional",text:"Make time for scripture, reflection and prayer each day.",href:"/devotional",cta:"Read devotional"}
];
export default function Home(){return <main>
  <section className="hero"><div className="hero-inner">
    <div><span className="eyebrow">PRESBYTERIAN CHURCH OF GHANA · WORIKAMBO DISTRICT</span>
      <h1>Growing in faith.<br/><span>Connected in Christ.</span></h1>
      <p className="lead">Welcome to the digital home of our church family. Find a congregation, discover upcoming programmes, read church news and connect with ministries across the Worikambo District.</p>
      <div className="hero-actions"><a className="btn" href="/congregations">Find a congregation →</a><a className="btn btn-secondary" href="/about">Learn about us</a></div>
      <p className="small">One church family · Worship · Discipleship · Service</p>
    </div>
    <aside className="hero-panel"><span className="eyebrow">JOIN US IN WORSHIP</span><h3>There is a place for you here.</h3><p className="small">Whether you are a member, visitor or friend, we welcome you to worship and grow with us.</p>
      <div className="service-row"><span>Sunday Worship</span><strong>See local times</strong></div><div className="service-row"><span>Church groups</span><strong>All generations</strong></div><div className="service-row"><span>District updates</span><strong>News & events</strong></div>
      <p style={{marginTop:18,marginBottom:0}}><a className="text-link" href="/contact">Plan your visit →</a></p>
    </aside>
  </div></section>
  <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">EXPLORE THE DISTRICT</span><h2>What would you like to find?</h2></div><p>Choose a section below. Each opens its own page, so information is easier to find.</p></div><div className="grid">{cards.map(c=><article className="card" key={c.title}><div className="card-icon">{c.icon}</div><h3>{c.title}</h3><p>{c.text}</p><a className="text-link" href={c.href}>{c.cta} →</a></article>)}</div></div></section>
  <section className="section section-tint"><div className="container two-col"><div><span className="eyebrow">OUR CHURCH FAMILY</span><h2 className="page-title">A place to belong, learn and serve.</h2><p className="content-copy">Our district brings people together through worship, discipleship, community service and the love of Christ. Discover where you can worship, learn God's Word and contribute your gifts.</p><a className="btn" href="/ministries">Explore our groups</a></div><div className="card"><span className="eyebrow">SCRIPTURE FOR OUR JOURNEY</span><h3 style={{fontSize:24,marginTop:15}}>“How good and pleasant it is when God’s people live together in unity!”</h3><p>Psalm 133:1</p><a className="text-link" href="/devotional">Visit Daily Devotional →</a></div></div></section>
  <section className="verse-band"><blockquote>“That they all may be one.”</blockquote><p>JOHN 17:21 · OUR SHARED CALLING</p></section>
  <section className="section"><div className="container two-col"><div><span className="eyebrow">STAY CONNECTED</span><h2 className="page-title">Have a question or prayer request?</h2><p className="content-copy">Get in touch with the district or let us know you are planning to visit a congregation.</p><a className="btn btn-red" href="/contact">Contact the District →</a></div><div className="card"><h3>For church administrators</h3><p>Manage congregation records, church courses, news, hymns, events and devotional review through the administration area.</p><a className="text-link" href="/admin">Administration sign-in →</a></div></div></section>
</main>}