# andrewspeprah.com

Interactive, full-width résumé site + blog. **Rails 8**, **Slim** templates,
**SQLite** (Active Record). Each role is its own page with an animated **d3-geo
globe** that flies to the location and drops a pin. Experiences, languages/tools,
and writings are **seeded** and stored in the database. Runs as a single
container behind Nginx Proxy Manager over a private Headscale/Tailscale mesh.

## Layout

| Path | What |
|------|------|
| `app/models/{experience,language,post}.rb` | Data models |
| `db/seeds.rb` | Experiences, languages/tools (+ writings read from `posts/*.md`) |
| `app/views/**/*.slim` | Slim templates |
| `app/assets/stylesheets/application.css` | The full design |
| `public/globe.js` + `public/d3.v7.min.js` + `public/world-land.geojson` | The globe |

## Content

- **Experiences & languages**: edit `db/seeds.rb`, then `bin/rails db:seed` (idempotent).
- **Writings**: the first one is seeded from `posts/*.md`. New writings are added
  **from the database** — e.g. in a console on the server:
  ```ruby
  Post.create!(title: "…", slug: "…", description: "…", body: "## Markdown…", published_on: Date.today)
  ```
  (Markdown is rendered with Redcarpet + Rouge.) Add more `posts/*.md` + `db:seed` if you prefer file-authoring.

## Local development

```bash
bin/setup                       # bundle install
bin/rails db:prepare            # create + migrate + seed
bin/rails server                # http://localhost:3000
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
