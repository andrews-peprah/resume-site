class PagesController < ApplicationController
  def home
    @experiences = Experience.all
    @latest = Post.published.first
    @ticker = Language.where(category: %w[backend frontend infra]).map(&:name).uniq
  end
end
