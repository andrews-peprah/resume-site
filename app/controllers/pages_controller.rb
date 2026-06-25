class PagesController < ApplicationController
  layout "resume"

  def home
    @latest = Post.all.first
  end
end
