class PostsController < ApplicationController
  def index
    @posts = Post.all
  end

  def show
    @post = Post.find(params[:slug])
    unless @post
      render file: Rails.root.join("public/404.html"), status: :not_found, layout: false
    end
  end
end
