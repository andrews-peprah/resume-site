class ExperiencesController < ApplicationController
  def index
    @experiences = Experience.all
  end

  def show
    @experience = Experience.find_by!(slug: params[:slug])
    @prev = @experience.previous_experience
    @next = @experience.next_experience
  end
end
