source "https://rubygems.org"

gem "rails", "~> 8.0.4"
# SQLite database — file-backed, persisted in a Docker volume
gem "sqlite3", ">= 2.1"
# Slim templates
gem "slim-rails", "~> 4.0"
# The modern asset pipeline for Rails [https://github.com/rails/propshaft]
gem "propshaft"
# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"

# Markdown rendering for blog posts + syntax highlighting
gem "redcarpet", "~> 3.6"
gem "rouge", "~> 4.2"

# Password hashing for the admin login (has_secure_password)
gem "bcrypt", "~> 3.1"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ windows jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
end

group :development do
  gem "web-console"
end
