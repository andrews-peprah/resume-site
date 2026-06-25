class Language < ApplicationRecord
  CATEGORIES = %w[spoken backend frontend infra recent tools].freeze

  default_scope { order(:position) }
  scope :in_category, ->(category) { where(category: category) }

  def proficiency_label
    case level
    when 90..      then "Expert"
    when 78..89    then "Advanced"
    when 60..77    then "Proficient"
    else                "Familiar"
    end
  end
end
