/* YURI ISSA public content integration.
   Reads only published posts and explicitly public gallery images from the admin Worker.
   No admin credentials or write operations are used on the public website. */
(() => {
  "use strict";

  const API = "https://yuri-issa-admin.yuri-issa37.workers.dev/api/public";
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  };
  const safeImage = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "ik.imagekit.io" ? url.href : "";
    } catch (_) { return ""; }
  };
  const dateLabel = (value) => {
    const date = new Date(Number(value) * 1000);
    return Number.isFinite(date.getTime()) ? date.toLocaleDateString(document.documentElement.lang === "ar" ? "ar" : "en") : "";
  };
  const get = async (path) => {
    const response = await fetch(API + path, { method: "GET", headers: { Accept: "application/json" }, mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error("Public content unavailable");
    return response.json();
  };

  function postCard(post) {
    const card = make("article", "info-card");
    const title = make("h3", "", post.title || (post.type === "article" ? "Article" : "Project"));
    const summary = make("p", "", post.summary || "");
    card.append(title, summary);
    if (post.image_url) {
      const src = safeImage(post.image_url);
      if (src) {
        const image = make("img", "public-content-image");
        image.src = src;
        image.alt = post.image_alt || post.title || "";
        image.loading = "lazy";
        image.decoding = "async";
        card.append(image);
      }
    }
    const meta = make("p", "public-content-meta", dateLabel(post.published_at));
    card.append(meta);
    const link = make("a", "view-all", "READ MORE");
    link.href = "article.html?id=" + encodeURIComponent(post.id);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Read " + (post.title || "published post") + " as data");
    card.append(link);
    return card;
  }

  async function loadProjects() {
    const host = document.querySelector("#projects .cards");
    if (!host) return;
    try {
      const data = await get("/posts");
      const projects = (data.posts || []).filter(post => post.type === "project");
      if (!projects.length) return;
      host.replaceChildren(...projects.map(postCard));
    } catch (_) { /* Keep the existing static site content as a graceful fallback. */ }
  }

  async function loadArticles() {
    const articles = document.querySelector("#published-articles");
    if (!articles) return;
    try {
      const data = await get("/posts");
      const posts = (data.posts || []).filter(post => post.type === "article");
      const host = articles.querySelector(".cards");
      if (host && posts.length) host.replaceChildren(...posts.map(postCard));
      if (posts.length) articles.hidden = false;
    } catch (_) { /* Optional content must not break the main site. */ }
  }

  async function loadProjectPage() {
    const host = document.querySelector(".page-content .cards");
    if (!host) return;
    try {
      const data = await get("/posts");
      const projects = (data.posts || []).filter(post => post.type === "project");
      if (!projects.length) return;
      host.replaceChildren(...projects.map(postCard));
      const note = document.querySelector(".page-content .page-note");
      if (note) note.textContent = "Projects published through the YURI ISSA administration panel.";
    } catch (_) { /* Leave the existing page intact when the API is unavailable. */ }
  }

  async function loadGallery() {
    const section = document.querySelector("#gallery");
    if (!section) return;
    try {
      const data = await get("/gallery");
      const images = data.images || [];
      if (!images.length) return;
      let grid = section.querySelector(".public-gallery-grid");
      if (!grid) {
        grid = make("div", "public-gallery-grid");
        section.append(grid);
      }
      grid.replaceChildren();
      for (const item of images) {
        const src = safeImage(item.image_url);
        if (!src) continue;
        const figure = make("figure", "public-gallery-item");
        const image = make("img");
        image.src = src;
        image.alt = item.alt_text || item.filename || "";
        image.loading = "lazy";
        image.decoding = "async";
        figure.append(image);
        if (item.alt_text) figure.append(make("figcaption", "", item.alt_text));
        grid.append(figure);
      }
    } catch (_) { /* Keep the existing gallery introduction visible. */ }
  }


  async function loadArticlePage() {
    const id = new URLSearchParams(location.search).get("id");
    const host = document.querySelector("[data-public-article]");
    if (!host || !id || !/^[A-Za-z0-9-]{16,64}$/.test(id)) return;
    try {
      const data = await get("/posts/" + encodeURIComponent(id));
      const post = data.post;
      if (!post) throw new Error("Unavailable");
      document.title = (post.title || "YURI ISSA") + " — YURI ISSA";
      host.replaceChildren(make("div", "kicker", post.type === "article" ? "PUBLISHED ARTICLE" : "PUBLISHED PROJECT"));
      host.append(make("h1", "", post.title || ""));
      if (post.image_url) {
        const src = safeImage(post.image_url);
        if (src) {
          const image = make("img", "public-content-image");
          image.src = src;
          image.alt = post.image_alt || post.title || "";
          host.append(image);
        }
      }
      host.append(make("p", "public-content-meta", dateLabel(post.published_at)));
      host.append(make("div", "public-article-body", post.body || post.summary || ""));
    } catch (_) {
      host.replaceChildren(make("p", "", "This published item is unavailable."));
    }
  }

  function addStyles() {
    if (document.getElementById("public-content-styles")) return;
    const style = make("style");
    style.id = "public-content-styles";
    style.textContent = ".public-content-image{display:block;width:100%;max-height:230px;object-fit:cover;border-radius:10px;margin-top:14px}.public-content-meta{font-size:12px;opacity:.7;margin-top:12px}.public-article-body{white-space:pre-wrap;line-height:1.9;margin-top:24px;overflow-wrap:anywhere}.public-gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:24px}.public-gallery-item{margin:0;min-width:0}.public-gallery-item img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px}.public-gallery-item figcaption{font-size:12px;opacity:.75;margin-top:7px}";
    document.head.append(style);
  }

  addStyles();
  loadProjects();
  loadArticles();
  loadProjectPage();
  loadGallery();\n  loadArticlePage();
})();
