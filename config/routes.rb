Rails.application.routes.draw do
  # Liveness probe for NPM / uptime monitoring.
  get "up" => "rails/health#show", as: :rails_health_check

  root "pages#home"

  get "writing", to: "posts#index", as: :posts
  get "writing/:slug", to: "posts#show", as: :post
end
