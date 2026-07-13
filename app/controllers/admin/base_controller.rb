module Admin
  # Shared base for every controller under /admin: strict CSRF + login required.
  class BaseController < ApplicationController
    protect_from_forgery with: :exception
    before_action :authenticate_admin!

    layout "admin"
  end
end
