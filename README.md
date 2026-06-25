# andrewspeprah.com

Personal résumé site + blog. Rails 8, no database — blog posts are Markdown
files in [`posts/`](posts/) rendered with Redcarpet + Rouge. Runs as a single
container behind Nginx Proxy Manager, served over a private Headscale/Tailscale
mesh.

## Layout

| Path | What |
|------|------|
| `app/views/pages/home.html.erb` + `layouts/resume.html.erb` | The résumé (home page, `/`) |
| `app/views/posts/` + `layouts/application.html.erb` | The blog (`/writing`) |
| `app/models/post.rb` | Loads & renders Markdown posts |
| `posts/*.md` | Blog posts (YAML front matter + Markdown) |

## Writing a new post

Drop a file in `posts/`, named `YYYY-MM-DD-slug.md`:

```markdown
---
title: "My New Post"
date: 2026-07-01
description: "One-line summary shown in lists and meta tags."
slug: my-new-post
---

Markdown body. Fenced code blocks get syntax highlighting.
```

Commit, push, then on the server `git pull` + rebuild (below). No database, no admin login.

## Local development

```bash
bin/setup            # bundle install
bin/rails server     # http://localhost:3000
```

## Deploying to the home server (greywolf)

The app runs in the Tailscale container's network namespace and is reached by
NPM on the VPS at `100.64.0.2:3000`.

```bash
cd ~/local
git clone git@github.com:andrews-peprah/resume-site.git   # first time
# (or: cd ~/local/resume-site && git pull)

# Put deploy/docker-compose.local.yml at ~/local/docker-compose.local.yml
# Set SECRET_KEY_BASE in ~/local/.env  (openssl rand -hex 64)

docker compose -f docker-compose.local.yml up -d --build site
docker compose -f docker-compose.local.yml restart site   # after a git pull
```

One-time NPM change: point the site's proxy host at **`100.64.0.2:3000`**
(was WordPress on `:80`).
