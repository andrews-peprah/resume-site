module Admin
  class PostsController < BaseController
    before_action :set_post, only: %i[edit update destroy]

    # Show every post, published or not, newest first.
    def index
      @posts = Post.unscoped.order(published_on: :desc, created_at: :desc)
    end

    def new
      @post = Post.new(published: true, published_on: Date.current)
    end

    def create
      @post = Post.new(post_params)
      if @post.save
        redirect_to admin_posts_path, notice: "Post created."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @post.update(post_params)
        redirect_to admin_posts_path, notice: "Post updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @post.destroy
      redirect_to admin_posts_path, notice: "Post deleted.", status: :see_other
    end

    private

    def set_post
      # Post#to_param returns the slug, so path helpers put the slug in :id.
      @post = Post.unscoped.find_by!(slug: params[:id])
    end

    def post_params
      params.require(:post).permit(:title, :slug, :description, :body, :published, :published_on)
    end
  end
end
