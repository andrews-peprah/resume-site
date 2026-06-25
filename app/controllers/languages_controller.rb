class LanguagesController < ApplicationController
  def index
    @spoken   = Language.in_category("spoken")
    @backend  = Language.in_category("backend")
    @frontend = Language.in_category("frontend")
    @infra    = Language.in_category("infra")
    @recent   = Language.in_category("recent")
    @tools    = Language.in_category("tools")
  end
end
