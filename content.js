/* Yuri Issa — central website content file
   Edit the values below to change the website's visible text and links.
   Keep the CSS and HTML unchanged unless you want to alter the design. */
window.SITE_CONTENT = {
  siteTitle: "YURI ISSA — Personal Website",
  brandFirst: "YURI",
  brandLast: "ISSA.",
  description: "Yuri Issa — personal space for ideas, creativity, technology and projects.",
  navigation: ["Home", "About", "Projects", "Articles", "Gallery", "Contact", "EN"],
  navigationTargets: ["#home", "#about", "#projects", "#articles", "#gallery", "#contact", "#home"],
  hero: {
    eyebrow: "WELCOME TO YURI ISSA",
    greeting: "HELLO, I'M",
    name: "YURI ISSA",
    description: "A personal space for ideas, creativity, technology and projects.",
    button: "DISCOVER MORE"
  },
  explore: { title: "EXPLORE MY WORLD", viewAll: "VIEW ALL" },
  featureCards: [
    { title: "ABOUT ME", description: "My story and background." },
    { title: "PROJECTS", description: "My work and creations." },
    { title: "ARTICLES", description: "Ideas, tips and knowledge." },
    { title: "GALLERY", description: "Photos and visual content." }
  ],
  values: [
    "Security<br>&amp; Trust",
    "Innovation<br>&amp; Creativity",
    "Technology<br>&amp; Progress",
    "Knowledge<br>&amp; Sharing"
  ],
  about: {
    kicker: "01 / ABOUT",
    title: "A little about me",
    description: "Curiosity leads the way. This is my personal space to introduce myself, collect what I create, and share the ideas and experiences that shape my journey."
  },
  projects: {
    kicker: "02 / PROJECTS",
    title: "Projects & creations",
    cards: [
      { title: "WorkTime", description: "A personal work-hours and overtime tracking project.", button: "VIEW PROJECT ↗", url: "https://github.com/yuriissa/WorkTime-App" },
      { title: "Experiments", description: "A space for small tools, prototypes and ideas in progress." },
      { title: "Future projects", description: "New concepts and creations will be collected here." }
    ]
  },
  articles: {
    kicker: "03 / ARTICLES",
    title: "Articles",
    description: "Ideas, lessons learned, useful discoveries and reflections — gathered in one place."
  },
  gallery: {
    kicker: "04 / GALLERY",
    title: "Gallery",
    description: "A future collection of images, designs and visual memories."
  },
  contact: {
    kicker: "05 / CONTACT",
    title: "Let’s connect",
    description: "Every idea starts somewhere. Thanks for visiting Yuri Issa.",
    button: "FIND ME ON GITHUB ↗",
    url: "https://github.com/yuriissa"
  },
  footer: {
    brand: "YURI ISSA.",
    copyright: "© 2026 · All Rights Reserved"
  },
  socialLinks: {
    youtube: "#contact",
    github: "https://github.com/yuriissa",
    linkedin: "#contact",
    x: "#contact"
  }
};

(function applySiteContent() {
  const c = window.SITE_CONTENT;
  if (!c) return;
  const one = (s) => document.querySelector(s);
  const text = (s, v) => { const e = one(s); if (e && v !== undefined) e.textContent = v; };
  const html = (s, v) => { const e = one(s); if (e && v !== undefined) e.innerHTML = v; };
  const label = (s, v) => {
    const e = one(s); if (!e || v === undefined) return;
    const nodes = [...e.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (nodes.length) nodes[0].textContent = " " + v + " ";
    else e.insertBefore(document.createTextNode(v), e.firstChild);
  };
  const attr = (s, a, v) => { const e = one(s); if (e && v !== undefined) e.setAttribute(a, v); };
  document.title = c.siteTitle;
  html(".brand-name", `${c.brandFirst} <span>${c.brandLast}</span>`);
  attr('meta[name="description"]', 'content', c.description);
  c.navigation.forEach((v,i) => { label(`.nav a:nth-child(${i+1})`, v); attr(`.nav a:nth-child(${i+1})`, "href", c.navigationTargets[i]); });
  text('.eyebrow', c.hero.eyebrow);
  const h1 = one('.hero h1');
  if (h1) { h1.firstChild.textContent = c.hero.greeting + ' '; text('.hero h1 span', c.hero.name); }
  text('.hero-copy p', c.hero.description);
  label('.hero-copy .glow-btn', c.hero.button);
  text('.section-heading h2', c.explore.title);
  label('.section-heading .view-all', c.explore.viewAll);
  c.featureCards.forEach((v,i) => {
    text(`.feature:nth-child(${i+1}) h3`, v.title);
    text(`.feature:nth-child(${i+1}) p`, v.description);
  });
  c.values.forEach((v,i) => html(`.values .value:nth-child(${i+1}) > span:last-child`, v));
  const sections = [c.about,c.projects,c.articles,c.gallery,c.contact];
  const ids = ['about','projects','articles','gallery','contact'];
  sections.forEach((v,i) => {
    const root = `#${ids[i]}`;
    text(`${root} .kicker`, v.kicker);
    text(`${root} h2`, v.title);
    if (v.description) text(`${root} > p`, v.description);
  });
  c.projects.cards.forEach((v,i) => {
    const root = `#projects .info-card:nth-child(${i+1})`;
    text(`${root} h3`, v.title);
    text(`${root} p`, v.description);
    if (v.button) label(`${root} a`, v.button);
    if (v.url) attr(`${root} a`, 'href', v.url);
  });
  text('#contact h2', c.contact.title);
  text('#contact > p', c.contact.description);
  label('#contact .glow-btn', c.contact.button);
  attr('#contact .glow-btn', 'href', c.contact.url);
  text('.footer-brand', c.footer.brand);
  const footer = one('.site-footer > div:first-child');
  if (footer) footer.innerHTML = `<span class="footer-brand"></span> ${c.footer.copyright}`;
  text('.footer-brand', c.footer.brand);
  ['youtube','github','linkedin','x'].forEach((name,i) => attr(`.socials a:nth-child(${i+1})`, 'href', c.socialLinks[name]));
})();
