class Comment < ApplicationRecord
  MAX_NAME = 40
  MAX_BODY = 500

  default_scope { order(created_at: :desc) }

  normalizes :name, with: ->(n) { n.to_s.strip.gsub(/\s+/, " ") }
  normalizes :body, with: ->(b) { b.to_s.strip }

  validates :name, presence: true, length: { maximum: MAX_NAME }
  validates :body, presence: true, length: { maximum: MAX_BODY }

  scope :recent, ->(limit = 50) { limit(limit) }

  def when_label
    created_at&.strftime("%b %-d, %Y · %-l:%M %p")
  end
end
