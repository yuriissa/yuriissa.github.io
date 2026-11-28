/* Public YURI ISSA content bridge.
   Reads only published content from the public, read-only Worker API.
   The production API becomes active only after the backend release is approved. */
(() => {
  "use strict";

  const API_BASES = {
    production: "https://yuri-issa-admin.yuri-issa37.workers.dev",
    preview: "https://feature-admin-post-management-verified-yuri-issa-admin.yuri-issa37.workers.dev"
  };
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";
  const API_BASE = isPreview ? API_BASES.preview : API_BASES.production;
  const pageName = location.pathname.split("/").pop() || "index.html";
  const page = pageName === "projects.html" ? "projects"
    : pageName === "articles.html" ? "articles"
    : pageName === "designs.html" ? "gallery" : "index";
  const root = document.querySelector(".page-content");
  const language = () => document.documentElement.lang === "ar" ? "ar" : "en";
  const words = {
    en: {
      loading: "Loading published content…",
      unavailable: "The public content service is not connected yet. Please check back soon.",
      emptyProjects: "No published projects are available yet.",
      emptyArticles: "No published articles are available yet.",
      emptyGallery: "No images have been selected for the public gallery yet.",
      read: "READ MORE",
      project: "PROJECT",
      article: "ARTICLE",
      back: "BACK TO THE COLLECTION",
      notFound: "This item is unavailable or is no longer published.",
      error: "Content could not be loaded right now. Please try again later."
    },
    ar: {
      loading: "جارٍ تحميل المحتوى المنشور…",
      unavailable: "خدمة المحتوى العام لم تُربط بعد. يرجى العودة لاحقًا.",
      emptyProjects: "لا توجد مشاريع منشورة حاليًا.",
      emptyArticles: "لا توجد مقالات منشورة حاليًا.",
      emptyGallery: "لم تُحدَّد صور للعرض في المعرض العام حتى الآن.",
      read: "اقرأ المزيد",
      project: "مشروع",
      article: "مقال",
      back: "العودة إلى المجموعة",
      notFound: "هذا المحتوى غير متاح أو لم يعد منشورًا.",
      error: "تعذّر تحميل المحتوى الآن. يرجى المحاولة لاحقًا."
    }
  };

  const t = key => words[language()][key];
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const dateText = value => {
    if (!value) return "";
    const date = new Date(Number(value) * 1000);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(language() === "ar" ? "ar" : "en", { dateStyle: "medium" }).format(date);
  };
  const safeImageUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "ik.imagekit.io" ? url.href : "";
    } catch {
      return "";
    }
  };
  async function getJson(path) {
    if (isPreview && location.hostname !== "yuriissa.github.io") {
      const snapshotResponse = await fetch("preview-content.json", {
        method: "GET",
        credentials: "omit",
        headers: { Accept: "application/json" }
      });
      if (!snapshotResponse.ok) throw new Error("preview-snapshot-unavailable");
      const snapshot = await snapshotResponse.json();
      if (path === "/api/public/posts") return { posts: snapshot.posts || [] };
      if (path === "/api/public/gallery") return { images: snapshot.images || [] };
      const prefix = "/api/public/posts/";
      if (path.startsWith(prefix)) {
        const id = decodeURIComponent(path.slice(prefix.length));
        return { post: (snapshot.posts || []).find(item => item.id === id) || null };
      }
      throw new Error("preview-snapshot-route-unavailable");
    }
    const response = await fetch(API_BASE + path, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("public-api-unavailable");
    return response.json();
  }
  function statusNote(container, message, className = "page-note") {
    container.replaceChildren(el("div", className, message));
  }
  function postCard(post, type) {
    const card = el("article", "info-card public-post-card");
    if (safeImageUrl(post.image_url)) {
      const image = el("img", "public-post-image");
      image.src = safeImageUrl(post.image_url);
      image.alt = post.image_alt || post.title || "";
      image.loading = "lazy";
      image.decoding = "async";
      card.append(image);
    }
    card.append(el("span", "public-post-type", type === "project" ? t("project") : t("article")));
    card.append(el("h2", "public-post-title", post.title || ""));
    if (post.summary) card.append(el("p", "public-post-summary", post.summary));
    const date = dateText(post.published_at);
    if (date) card.append(el("p", "public-post-date", date));
    const link = el("a", "page-link", t("read"));
    link.href = (type === "project" ? "projects.html" : "articles.html") + "?post=" + encodeURIComponent(post.id) + (isPreview ? "&preview=1" : "");
    card.append(link);
    return card;
  }
  function detailView(container, post, type) {
    container.replaceChildren();
    const article = el("article", "public-post-detail");
    const back = el("a", "page-link public-back-link", "← " + t("back"));
    back.href = (type === "project" ? "projects.html" : "articles.html") + (new URLSearchParams(location.search).get("preview") === "1" ? "?preview=1" : "");
    article.append(back);
    article.append(el("div", "public-post-type", type === "project" ? t("project") : t("article")));
    article.append(el("h2", "public-detail-title", post.title || ""));
    const date = dateText(post.published_at);
    if (date) article.append(el("p", "public-post-date", date));
    if (safeImageUrl(post.image_url)) {
      const image = el("img", "public-detail-image");
      image.src = safeImageUrl(post.image_url);
      image.alt = post.image_alt || post.title || "";
      image.loading = "eager";
      image.decoding = "async";
      article.append(image);
    }
    if (post.summary) article.append(el("p", "public-detail-summary", post.summary));
    article.append(el("div", "public-detail-body", post.body || ""));
    container.append(article);
  }
  async function renderPosts(kind, token) {
    if (!root) return;
    const type = kind === "projects" ? "project" : "article";
    const params = new URLSearchParams(location.search);
    const postId = params.get("post");
    if (postId) {
      statusNote(root, t("loading"));
      try {
        const data = await getJson("/api/public/posts/" + encodeURIComponent(postId));
        if (token !== renderToken) return;
        if (!data.post || data.post.type !== type) throw new Error("not-found");
        detailView(root, data.post, type);
      } catch {
        if (token !== renderToken) return;
        statusNote(root, t("notFound"));
      }
      return;
    }
    const grid = root.querySelector(".cards") || el("div", "cards public-post-grid");
    const loadingNote = el("div", "page-note", t("loading"));
    root.replaceChildren(loadingNote, grid);
    try {
      const data = await getJson("/api/public/posts");
      if (token !== renderToken) return;
      const posts = (data.posts || []).filter(post => post.type === type);
      grid.replaceChildren();
      if (!posts.length) {
        grid.remove();
        loadingNote.textContent = t(kind === "projects" ? "emptyProjects" : "emptyArticles");
        return;
      }
      posts.forEach(post => grid.append(postCard(post, type)));
      loadingNote.remove();
    } catch {
      if (token !== renderToken) return;
      statusNote(root, t("unavailable"));
    }
  }
  async function renderGallery(token) {
    if (!root) return;
    statusNote(root, t("loading"));
    try {
      const data = await getJson("/api/public/gallery");
      if (token !== renderToken) return;
      const images = (data.images || data.media || []).filter(item => safeImageUrl(item.image_url));
      if (!images.length) {
        statusNote(root, t("emptyGallery"));
        return;
      }
      const grid = el("div", "public-gallery-grid");
      images.forEach(item => {
        const imageUrl = safeImageUrl(item.image_url);
        const figure = el("figure", "public-gallery-item");
        const image = el("img", "", item.alt_text || item.filename || "");
        image.src = imageUrl;
        image.alt = item.alt_text || item.filename || "";
        image.loading = "lazy";
        image.decoding = "async";
        figure.append(image);
        if (item.alt_text) figure.append(el("figcaption", "", item.alt_text));
        grid.append(figure);
      });
      root.replaceChildren(grid);
    } catch {
      if (token !== renderToken) return;
      statusNote(root, t("unavailable"));
    }
  }
  let renderToken = 0;
  async function render() {
    const token = ++renderToken;
    if (page === "projects" || page === "articles") {
      await renderPosts(page, token);
    } else if (page === "gallery") {
      await renderGallery(token);
    }
  }
  if (root && page !== "index") {
    render();
    const observer = new MutationObserver(() => render());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
})();
