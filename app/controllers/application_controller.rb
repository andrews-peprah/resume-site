class ApplicationController < ActionController::Base
  # Public, read-only site — no forms or sign-in, so we don't gate on browser
  # version (would block crawlers, link-preview bots, and uptime checks).
  protect_from_forgery with: :null_session
end
