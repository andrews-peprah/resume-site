Rails.application.routes.draw do
  # Liveness probe for NPM / uptime monitoring.
  get "up" => "rails/health#show", as: :rails_health_check

  root "pages#home"

  resources :experiences, only: %i[index show], param: :slug, path: "experience"
  resources :projects, only: %i[index], path: "projects"
  get "languages", to: "languages#index", as: :languages
  resources :posts, only: %i[index show], param: :slug, path: "writing"

  # --- Admin ---------------------------------------------------------------
  get  "login",  to: "sessions#new",     as: :login
  post "login",  to: "sessions#create"
  delete "logout", to: "sessions#destroy", as: :logout

  namespace :admin do
    root to: "posts#index"
    resources :posts, param: :id
  end
end
