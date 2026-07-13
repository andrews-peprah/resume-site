class PlayController < ApplicationController
  # The comment form posts here, so it needs real CSRF protection (the base
  # ApplicationController uses null_session for the public read-only site).
  protect_from_forgery with: :exception, only: :comment

  RATE_LIMIT = 3            # max comments ...
  RATE_WINDOW = 5.minutes   # ... per IP per window

  def index
    @comments = Comment.recent(50)
    @comment = Comment.new
    new_captcha
  end

  def comment
    if rate_limited?
      redirect_to(play_path(anchor: "chat"), alert: "You're posting too fast — please wait a few minutes.") and return
    end

    unless captcha_ok?
      @comment = Comment.new(comment_params)
      @comment.errors.add(:base, "Incorrect answer to the anti-bot question. Try again.")
      @comments = Comment.recent(50)
      new_captcha
      return render :index, status: :unprocessable_entity
    end

    @comment = Comment.new(comment_params.merge(ip: request.remote_ip))
    if @comment.save
      redirect_to play_path(anchor: "chat"), notice: "Thanks — your comment is up!"
    else
      @comments = Comment.recent(50)
      new_captcha
      render :index, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:name, :body)
  end

  # ---- anti-bot: server-generated arithmetic challenge -------------------
  def new_captcha
    a = rand(1..9)
    b = rand(1..9)
    session[:captcha_answer] = a + b
    @captcha_question = "What is #{a} + #{b}?"
  end

  def captcha_ok?
    expected = session[:captcha_answer]
    given = params[:captcha].to_s.strip
    expected.present? && given.match?(/\A\d+\z/) && given.to_i == expected.to_i
  end

  # ---- per-IP rate limiting ----------------------------------------------
  def rate_limited?
    Comment.where(ip: request.remote_ip)
           .where(created_at: RATE_WINDOW.ago..)
           .count >= RATE_LIMIT
  end
end
