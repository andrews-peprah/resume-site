class SessionsController < ApplicationController
  # The login form itself must reject forged POSTs.
  protect_from_forgery with: :exception

  def new
    redirect_to admin_posts_path if admin_signed_in?
  end

  def create
    admin = AdminUser.find_by(email: params[:email].to_s.strip.downcase)
    if admin&.authenticate(params[:password])
      reset_session # prevent session fixation
      session[:admin_user_id] = admin.id
      redirect_to(session.delete(:return_to) || admin_posts_path, notice: "Signed in.")
    else
      flash.now[:alert] = "Invalid email or password."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    reset_session
    redirect_to login_path, notice: "Signed out."
  end
end
