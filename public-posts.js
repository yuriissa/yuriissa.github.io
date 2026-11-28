/* YURI ISSA — public, read-only posts integration.
   This script talks only to the published-posts API. It has no admin credentials
   and never sends write requests. User content is inserted with textContent. */
(function () {
  "use strict";

  var API_BASE = "https://feature-admin-post-management-verified-yuri-issa-admin.yuri-issa37.workers.dev";
  var FEED_URL = API_BASE + "/api/public/posts";
  var DETAIL_URL = API_BASE + "/api/public/posts/";
  var cachedPosts = null;
  var loading = null;

  function isArabic() {
    return document.documentElement.lang.toLowerCase().indexOf("ar") === 0;
  }

  function text(ar, en) {
    return isArabic() ? ar : en;
  }

  function safeImageUrl(value) {
    if (typeof value !== "string" || !value) return "";
    try {
      var url = new URL(value);
      return url.protocol === "https:" && url.hostname === "ik.imagekit.io" ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function make(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  }

  function formatDate(timestamp) {
    if (!Number.isFinite(Number(timestamp))) return "";
    try {
      return new Intl.DateTimeFormat(isArabic() ? "ar" : "en", {
        year: "numeric", month: "short", day: "numeric"
      }).format(new Date(Number(timestamp) * 1000));
    } catch (error) {
      return "";
    }
  }

  function addImage(parent, post, className) {
    var src = safeImageUrl(post.image_url);
    if (!src) return;
    var image = make("img", className);
    image.src = src;
    image.alt = post.image_alt || post.title || text("صورة المنشور", "Post image");
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    parent.appendChild(image);
  }

  function renderCard(post) {
    var article = make("article", "public-post-card");
    var link = make("a", "public-post-card-link");
    link.href = "post.html?id=" + encodeURIComponent(post.id);
    link.setAttribute("aria-label", text("اقرأ: ", "Read: ") + (post.title || ""));
    addImage(link, post, "public-post-image");

    var copy = make("div", "public-post-copy");
    var typeLabel = post.type === "project" ? text("مشروع", "Project") : text("مقال", "Article");
    var date = formatDate(post.published_at);
    copy.appendChild(make("div", "public-post-meta", date ? typeLabel + " · " + date : typeLabel));
    copy.appendChild(make("h3", "public-post-title", post.title || text("منشور بلا عنوان", "Untitled post")));
    if (post.summary) copy.appendChild(make("p", "public-post-summary", post.summary));
    copy.appendChild(make("span", "public-post-read", text("اقرأ المزيد", "Read more")));
    link.appendChild(copy);
    article.appendChild(link);
    return article;
  }

  function getPosts() {
    if (cachedPosts) return Promise.resolve(cachedPosts);
    if (loading) return loading;
    loading = fetch(FEED_URL, { method: "GET", headers: { "Accept": "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.posts)) throw new Error("Invalid feed response");
        cachedPosts = data.posts;
        return cachedPosts;
      })
      .finally(function () { loading = null; });
    return loading;
  }

  function renderFeed(container, posts) {
    var kind = container.getAttribute("data-public-feed") || "all";
    var limit = Math.max(1, Math.min(100, Number(container.getAttribute("data-limit")) || 12));
    var filtered = posts.filter(function (post) {
      return kind === "all" || post.type === kind;
    }).slice(0, limit);

    container.replaceChildren();
    if (!filtered.length) {
      container.appendChild(make("p", "public-feed-empty",
        text("لا توجد منشورات منشورة في هذا القسم حاليًا.", "There are no published posts in this section yet.")));
      return;
    }
    var grid = make("div", "public-post-grid");
    filtered.forEach(function (post) {
      if (post && typeof post.id === "string" && post.id.length <= 64) grid.appendChild(renderCard(post));
    });
    container.appendChild(grid);
  }

  function loadFeeds() {
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-public-feed]"));
    if (!containers.length) return;
    containers.forEach(function (container) {
      container.textContent = text("جارٍ تحميل المنشورات…", "Loading published posts…");
    });
    getPosts().then(function (posts) {
      containers.forEach(function (container) { renderFeed(container, posts); });
    }).catch(function () {
      containers.forEach(function (container) {
        container.textContent = text("تعذّر تحميل المنشورات الآن. يرجى المحاولة لاحقًا.", "Posts could not be loaded right now. Please try again later.");
      });
    });
  }

  function renderDetail(container, post) {
    container.replaceChildren();
    var article = make("article", "public-post-detail");
    var typeLabel = post.type === "project" ? text("مشروع", "Project") : text("مقال", "Article");
    var date = formatDate(post.published_at);
    article.appendChild(make("div", "public-post-meta", date ? typeLabel + " · " + date : typeLabel));
    article.appendChild(make("h1", "public-post-detail-title", post.title || text("منشور بلا عنوان", "Untitled post")));
    if (post.summary) article.appendChild(make("p", "public-post-detail-summary", post.summary));
    addImage(article, post, "public-post-detail-image");
    article.appendChild(make("div", "public-post-body", post.body || ""));
    container.appendChild(article);
  }

  function loadDetail() {
    var container = document.querySelector("[data-public-post-detail]");
    if (!container) return;
    var id = new URLSearchParams(window.location.search).get("id") || "";
    if (!/^[a-f0-9-]{16,64}$/i.test(id)) {
      container.textContent = text("رابط المنشور غير صالح.", "This post link is invalid.");
      return;
    }
    container.textContent = text("جارٍ تحميل المنشور…", "Loading post…");
    fetch(DETAIL_URL + encodeURIComponent(id), { method: "GET", headers: { "Accept": "application/json" } })
      .then(function (response) {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error("request-failed");
        return response.json();
      })
      .then(function (data) {
        if (!data || !data.post || data.post.id !== id) throw new Error("invalid-response");
        renderDetail(container, data.post);
      })
      .catch(function (error) {
        container.textContent = error.message === "not-found"
          ? text("هذا المنشور غير متاح أو لم يعد منشورًا.", "This post is unavailable or is no longer published.")
          : text("تعذّر تحميل المنشور. يرجى المحاولة لاحقًا.", "The post could not be loaded. Please try again later.");
      });
  }

  function updateHeadings() {
    document.querySelectorAll("[data-public-feed-title]").forEach(function (heading) {
      var kind = heading.getAttribute("data-public-feed-title");
      heading.textContent = kind === "project"
        ? text("المشاريع المنشورة", "Published projects")
        : kind === "article"
          ? text("المقالات المنشورة", "Published articles")
          : text("أحدث المنشورات", "Latest posts");
    });
  }

  function refresh() {
    cachedPosts = null;
    updateHeadings();
    loadFeeds();
    loadDetail();
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateHeadings();
    loadFeeds();
    loadDetail();
    var observer = new MutationObserver(function (mutations) {
      if (mutations.some(function (item) { return item.attributeName === "lang"; })) refresh();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
})();