/* YURI ISSA — public, read-only image gallery. */
(function () {
  "use strict";
  var API_URL = "https://feature-admin-post-management-verified-yuri-issa-admin.yuri-issa37.workers.dev/api/public/gallery";

  function isArabic() {
    return document.documentElement.lang.toLowerCase().indexOf("ar") === 0;
  }
  function text(ar, en) { return isArabic() ? ar : en; }
  function make(tag, cls, value) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  }
  function safeImageUrl(value) {
    if (typeof value !== "string" || !value) return "";
    try {
      var url = new URL(value);
      return url.protocol === "https:" && url.hostname === "ik.imagekit.io" ? url.href : "";
    } catch (error) { return ""; }
  }
  function render(container, images) {
    container.replaceChildren();
    if (!images.length) {
      container.appendChild(make("p", "public-gallery-empty",
        text("لا توجد صور مختارة للعرض حاليًا.", "No images have been selected for the public gallery yet.")));
      return;
    }
    var grid = make("div", "public-gallery-grid");
    images.forEach(function (item) {
      var src = safeImageUrl(item.image_url);
      if (!src) return;
      var figure = make("figure", "public-gallery-item");
      var link = make("a", "public-gallery-link");
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", text("فتح الصورة بالحجم الكامل: ", "Open full-size image: ") + (item.alt_text || item.filename || ""));
      var image = make("img", "public-gallery-image");
      image.src = src;
      image.alt = item.alt_text || item.filename || text("صورة من المعرض", "Gallery image");
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      link.appendChild(image);
      figure.appendChild(link);
      if (item.alt_text) {
        var caption = make("figcaption", "public-gallery-caption", item.alt_text);
        caption.dir = "auto";
        figure.appendChild(caption);
      }
      grid.appendChild(figure);
    });
    if (!grid.children.length) {
      container.appendChild(make("p", "public-gallery-empty",
        text("لا توجد صور متاحة للعرض حاليًا.", "No gallery images are available right now.")));
      return;
    }
    container.appendChild(grid);
  }
  function load() {
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-public-gallery]"));
    if (!containers.length) return;
    containers.forEach(function (container) {
      container.textContent = text("جارٍ تحميل المعرض…", "Loading gallery…");
    });
    fetch(API_URL, { method: "GET", headers: { "Accept": "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Gallery request failed");
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.images)) throw new Error("Invalid gallery response");
        containers.forEach(function (container) { render(container, data.images); });
      })
      .catch(function () {
        containers.forEach(function (container) {
          container.textContent = text("تعذّر تحميل المعرض الآن. يرجى المحاولة لاحقًا.", "The gallery could not be loaded. Please try again later.");
        });
      });
  }
  document.addEventListener("DOMContentLoaded", function () {
    load();
    var observer = new MutationObserver(function (mutations) {
      if (mutations.some(function (item) { return item.attributeName === "lang"; })) load();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
})();