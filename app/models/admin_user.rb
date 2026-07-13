class AdminUser < ApplicationRecord
  has_secure_password

  normalizes :email, with: ->(e) { e.to_s.strip.downcase }

  validates :email, presence: true, uniqueness: true
end
