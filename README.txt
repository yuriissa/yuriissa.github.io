YURI ISSA WEBSITE — EXPANDABLE ROOT FILES

Main files:
- index.html: the home page and its structure.
- content.js: central text, labels and navigation links for the home page.
- style.css: shared visual design and layout used across all pages.
- projects.html: personal projects collection.
- designs.html: visual designs and creative work.
- articles.html: articles and insights.
- README.txt: this guide.

All files are kept directly in the repository root. No folders are required.

Editing:
1. Edit home-page wording and links in content.js where possible.
2. Keep style.css linked from every page so the visual identity stays consistent.
3. Add new content to the matching page, keeping the shared header, navigation and footer.
4. Keep filenames and links consistent. File names are case-sensitive on GitHub Pages.

Publishing:
Upload or commit the changed files to the repository root. GitHub Pages publishes the site from the main branch after changes are merged there.
The original home-page artwork remains embedded in the existing page design and is preserved in this update.


PUBLIC POSTS INTEGRATION — PREVIEW ONLY

- public-posts.js reads published posts from the YURI ISSA administration Worker.
- index.html displays the latest published posts.
- articles.html displays published articles.
- projects.html displays published projects.
- post.html displays one published post using its ID in the query string.
- The public website uses GET requests only. It has no administrator credentials and cannot create, edit, publish, or delete posts.
- Post text is inserted as text, not executable HTML. Featured images are accepted only from the ImageKit HTTPS host.

IMPORTANT:
The current public-posts.js endpoint is the development Preview Worker:
https://feature-admin-post-management-verified-yuri-issa-admin.yuri-issa37.workers.dev

This is intentional for development. Do not merge this website integration into the live main branch until the production Worker API has been reviewed, deployed with the correct production database and ImageKit configuration, and the API endpoint in public-posts.js has been changed to the approved production Worker URL. Production website and production Worker must remain untouched during preview testing.
