class Experience < ApplicationRecord
  serialize :stack, coder: JSON
  serialize :highlights, coder: JSON

  default_scope { order(:position) }

  def to_param
    slug
  end

  def previous_experience
    self.class.where("position < ?", position).reorder(position: :desc).first
  end

  def next_experience
    self.class.where("position > ?", position).reorder(position: :asc).first
  end
end
