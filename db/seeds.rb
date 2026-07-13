# Idempotent seeds. Safe to run repeatedly (find_or_create_by on natural keys).
# Experiences and languages are defined here; the initial writing(s) are read
# from posts/*.md. New writings can be added later straight to the database.

# ---------------------------------------------------------------- Experiences
experiences = [
  { slug: "positrace", position: 1, role: "Senior Software Engineer", company: "PosiTrace",
    monogram: "P", logo_domain: "positrace.com", year_label: "2024 — Present",
    location: "Burnaby, BC, Canada", lat: 49.2488, lon: -122.9805,
    summary: "Building features for a multi-tenant vehicle-tracking platform and turning big data into reports people actually use. I started at the Guadalajara office and was relocated by the company to the Vancouver-area office in Burnaby.",
    stack: ["Ruby on Rails", "Angular", "TypeScript", "PostgreSQL", "Elasticsearch", "Big Data"],
    highlights: [
      "Build and maintain features for a multi-tenant vehicle-tracking platform, improving functionality and UX.",
      "Generate data-driven reports leveraging big-data technologies.",
      "Troubleshoot and resolve issues to keep the platform stable and performant.",
      "Spent the first year at the Guadalajara, Mexico office, then relocated with the company to Burnaby, BC, Canada."
    ] },
  { slug: "defined-ai", position: 2, role: "Software Engineer", company: "Defined.ai",
    monogram: "d.", logo_domain: "defined.ai", year_label: "2021 — 2024",
    location: "Porto, Portugal", lat: 41.1579, lon: -8.6291,
    summary: "Microservice backends and fully automated delivery pipelines powering crowd-sourced data collection for machine learning.",
    stack: ["C# / .NET", "React", "Prometheus", "Grafana", "Kibana", "Elasticsearch", "CI/CD"],
    highlights: [
      "Built microservice backends with a fully automated CI/CD pipeline.",
      "Instrumented systems with Prometheus, Grafana, Kibana, and Elasticsearch.",
      "Created solutions for crowd-sourced data collection powering ML applications.",
      "Turned ambiguous concepts into actionable plans with cross-functional teams."
    ] },
  { slug: "taproot", position: 3, role: "Lead Engineer", company: "Taproot Foundation",
    monogram: "T", logo_domain: "taprootfoundation.org", year_label: "2019 — 2023",
    location: "Remote · New York, USA", lat: 40.7128, lon: -74.0060,
    summary: "Led platform engineering and DevOps while making data tell stories through visualization — a fully remote role with the New York–based nonprofit.",
    stack: ["Ruby on Rails", "D3.js", "DevOps", "Search", "Data Analysis"],
    highlights: [
      "Maintained the platform and shipped new features; facilitated partner integrations.",
      "Owned server administration and DevOps operations.",
      "Specialized in data visualization with D3.js; optimized search to improve UX.",
      "Analyzed data to find bottlenecks and surface insights.",
      "Worked fully remote across time zones with the New York team."
    ] },
  { slug: "andela", position: 4, role: "Senior Consultant", company: "Andela",
    monogram: "A", logo_domain: "andela.com", year_label: "2018 — 2022",
    location: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792,
    summary: "Delivered software for global clients while mentoring the next wave of engineers.",
    stack: ["Ruby on Rails", "PostgreSQL", "Mentorship"],
    highlights: [
      "Built software for clients; set partner expectations and led partner engagement.",
      "Mentored junior developers and interviewed engineering candidates."
    ] },
  { slug: "flexdigitals", position: 5, role: "Backend Software Engineer", company: "FlexDigitals",
    monogram: "F", logo_domain: nil, year_label: "2018 — 2019",
    location: "Accra, Ghana", lat: 5.6037, lon: -0.1870,
    summary: "Architected and ran server-side systems end to end.",
    stack: ["Backend", "API Design", "Server Automation"],
    highlights: [
      "Designed software architectures and built server-side applications.",
      "Oversaw API integration, documentation, and automated server management."
    ] },
  { slug: "walulel", position: 6, role: "Backend Engineer", company: "Walulel Limited",
    monogram: "W", logo_domain: nil, year_label: "2018",
    location: "Osu, Accra, Ghana", lat: 5.5560, lon: -0.1820,
    summary: "Polyglot backend work — from query optimization to a GeoFence microservice.",
    stack: ["PHP / Laravel", "Vue.js", "Rails", "Node / Express", "PostgreSQL", "AWS"],
    highlights: [
      "PostgreSQL query optimization, big-data management, and Linux server administration.",
      "Built a GeoFence microservice and an internal document library."
    ] },
  { slug: "nfortics", position: 7, role: "Senior Ruby Developer", company: "Nfortics Ghana",
    monogram: "N", logo_domain: nil, year_label: "2014 — 2018",
    location: "Accra, Ghana", lat: 5.6037, lon: -0.1870,
    summary: "Software for microfinance and banking — where correctness really matters.",
    stack: ["Ruby on Rails", "PostgreSQL", "Java (Android)"],
    highlights: [
      "Delivered third-party API integrations and business-process platforms.",
      "Built web APIs, transaction reconciliation, and Android support in Java."
    ] },
  { slug: "mnotify", position: 8, role: "Junior Engineer", company: "mNotify",
    monogram: "m", logo_domain: "mnotify.com", year_label: "2014",
    location: "KNUST, Kumasi, Ghana", lat: 6.6730, lon: -1.5650,
    summary: "First professional code — and yes, it was WordPress.",
    stack: ["PHP", "WordPress", "MySQL"],
    highlights: [ "Maintained the company WordPress site and developed custom templates." ] },
  { slug: "ctk", position: 9, role: "Graphic Designer", company: "Christ the King Publications",
    monogram: "CK", logo_domain: nil, year_label: "2009 — 2013",
    location: "Kumasi, Ghana", lat: 6.6885, lon: -1.6244,
    summary: "Where it started — a designer's eye I still bring to engineering.",
    stack: ["CorelDRAW", "Layout", "Typography"],
    highlights: [ "Designed posters and event flyers; compiled written works into books." ] }
]

experiences.each do |attrs|
  Experience.find_or_initialize_by(slug: attrs[:slug]).update!(attrs)
end
puts "Seeded #{Experience.count} experiences"

# ----------------------------------------------------------------- Languages
def seed_languages(category, list)
  list.each_with_index do |entry, i|
    name = entry[:name]
    Language.find_or_initialize_by(name: name, category: category).update!(
      level: entry[:level] || 0, level_label: entry[:label], position: i + 1
    )
  end
end

seed_languages("spoken", [
  { name: "English", label: "Native / Bilingual" },
  { name: "Twi",     label: "Native / Bilingual" },
  { name: "French",  label: "Elementary" }
])
seed_languages("backend", [
  { name: "Ruby / Rails", level: 95 }, { name: "C# / .NET Core", level: 88 },
  { name: "PHP / Laravel", level: 80 }, { name: "Node.js / Express", level: 78 },
  { name: "Java", level: 62 }
])
seed_languages("frontend", [
  { name: "TypeScript", level: 85 }, { name: "Angular", level: 84 },
  { name: "JavaScript", level: 88 }, { name: "React", level: 80 },
  { name: "Vue.js", level: 75 }, { name: "HTML / CSS", level: 90 }
])
seed_languages("infra", [
  { name: "PostgreSQL", level: 90 }, { name: "MySQL / MariaDB", level: 82 },
  { name: "SQLite", level: 80 }, { name: "Elasticsearch", level: 80 },
  { name: "Docker / Compose", level: 85 }, { name: "Linux / Bash", level: 88 },
  { name: "Nginx", level: 80 }, { name: "AWS", level: 72 },
  { name: "Git", level: 90 }, { name: "D3.js", level: 78 }, { name: "CI/CD", level: 82 }
])
seed_languages("recent", [
  { name: "Bash / Shell", level: 90 }, { name: "Docker & YAML", level: 88 },
  { name: "Nginx config", level: 80 }, { name: "Ruby / Rails", level: 95 },
  { name: "ERB & HTML", level: 88 }, { name: "Markdown", level: 92 }
])
# Full tools & platforms list (chips, no level) — everything hands-on.
seed_languages("tools", [
  { name: "Docker" }, { name: "Docker Compose" }, { name: "Linux" }, { name: "Git / GitHub" },
  { name: "Nginx / Proxy Manager" }, { name: "AWS" }, { name: "CI/CD pipelines" },
  { name: "Prometheus" }, { name: "Grafana" }, { name: "Kibana" }, { name: "Elasticsearch" },
  { name: "RSpec" }, { name: "Sidekiq" }, { name: "Hotwire / Turbo" }, { name: "Slim" },
  { name: "Redcarpet" }, { name: "Webpacker / Shakapacker" }, { name: "D3.js" },
  { name: "WordPress" }, { name: "phpMyAdmin" }, { name: "Tailscale / Headscale" },
  { name: "CorelDRAW" }, { name: "Microsoft Word" }
])
puts "Seeded #{Language.count} languages"

# ------------------------------------------------------------------- Writings
# Initial posts come from posts/*.md (YAML front matter + Markdown body).
Dir.glob(Rails.root.join("posts", "*.md")).each do |path|
  raw = File.read(path)
  meta, body =
    if raw =~ /\A---\s*\n(.*?\n)---\s*\n(.*)\z/m
      [ YAML.safe_load(Regexp.last_match(1), permitted_classes: [ Date, Time ]) || {}, Regexp.last_match(2) ]
    else
      [ {}, raw ]
    end
  slug = (meta["slug"] || File.basename(path, ".md").sub(/\A\d{4}-\d{2}-\d{2}-/, "")).to_s
  date = meta["date"].is_a?(Date) ? meta["date"] : (Date.parse(meta["date"].to_s) rescue nil)
  Post.find_or_initialize_by(slug: slug).update!(
    title: meta["title"].to_s, description: meta["description"].to_s,
    body: body, published_on: date, published: true
  )
end
puts "Seeded #{Post.count} posts"

# ---------------------------------------------------------------- Projects
# Only projects with a live link belong here — the list is a set of things
# someone can actually go and use.
projects = [
  { slug: "tierguard", position: 1, name: "TierGuard",
    tagline: "SaaS subscription management dashboard",
    year_label: "2026",
    stack: [ "React", "Vite", "TypeScript", "SaaS" ],
    summary: "My own product — a dashboard to track and manage SaaS subscriptions: plans, renewals and spend in one place, so nothing bills you by surprise.",
    url: "https://tierguard.com" },
  { slug: "menuluup", position: 2, name: "MenuLuup",
    tagline: "Digital menus for restaurants",
    year_label: "2026",
    stack: [ "Ruby on Rails", "Hotwire", "PostgreSQL", "SaaS" ],
    summary: "My own product — restaurants publish a clean, always-current digital menu customers reach by QR or link, no printing or reprinting when prices and dishes change.",
    url: "https://menuluup.com" }
].select { |a| a[:url].to_s.strip.present? }
# Keep the Projects list curated — drop any project not seeded above (which,
# by the filter, means anything without a live link).
Project.where.not(slug: projects.map { |a| a[:slug] }).destroy_all
projects.each { |a| Project.find_or_initialize_by(slug: a[:slug]).update!(a) }
puts "Seeded #{Project.count} projects"

# ------------------------------------------------------------------- Admin
# Single admin account for the posts back-office. Set ADMIN_EMAIL and
# ADMIN_PASSWORD in the environment; the password is only applied on first
# creation (or when ADMIN_RESET_PASSWORD=true) so re-seeding won't clobber a
# password you've since changed.
admin_email = ENV["ADMIN_EMAIL"].to_s.strip.downcase
admin_password = ENV["ADMIN_PASSWORD"].to_s
if admin_email.present? && admin_password.present?
  admin = AdminUser.find_or_initialize_by(email: admin_email)
  if admin.new_record? || ENV["ADMIN_RESET_PASSWORD"] == "true"
    admin.password = admin_password
    admin.save!
    puts "Seeded admin user #{admin_email}"
  else
    puts "Admin user #{admin_email} already exists (password left unchanged)"
  end
else
  puts "Skipped admin seed (set ADMIN_EMAIL and ADMIN_PASSWORD to create one)"
end
