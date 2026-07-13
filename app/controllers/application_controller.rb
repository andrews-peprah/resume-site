class ApplicationController < ActionController::Base
  # Public, read-only site — no forms or sign-in, so we don't gate on browser
  # version (would block crawlers, link-preview bots, and uptime checks).
  # The admin area (Admin::BaseController) opts into strict CSRF handling.
  protect_from_forgery with: :null_session

  helper_method :current_admin, :admin_signed_in?

  private

  def current_admin
    @current_admin ||= AdminUser.find_by(id: session[:admin_user_id]) if session[:admin_user_id]
  end

  def admin_signed_in?
    current_admin.present?
  end

  def authenticate_admin!
    return if admin_signed_in?

    session[:return_to] = request.fullpath if request.get?
    redirect_to login_path, alert: "Please sign in to continue."
  end
end
