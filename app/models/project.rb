class Project < ApplicationRecord
  serialize :stack, coder: JSON

  default_scope { order(:position) }

  def to_param
    slug
  end
end
