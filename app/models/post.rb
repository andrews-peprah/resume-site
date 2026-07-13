require "redcarpet"
require "rouge"
require "rouge/plugins/redcarpet"

class Post < ApplicationRecord
  # Render fenced code blocks with Rouge syntax highlighting.
  class HTMLRenderer < Redcarpet::Render::HTML
    include Rouge::Plugins::Redcarpet
  end

  scope :published, -> { where(published: true) }
  default_scope { order(published_on: :desc, created_at: :desc) }

  # Auto-derive a slug from the title when the admin leaves it blank.
  before_validation :ensure_slug

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true,
                   format: { with: /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/,
                             message: "must be lowercase words separated by hyphens" }

  def to_param
    slug
  end

  def long_date
    published_on&.strftime("%B %-d, %Y")
  end

  def reading_minutes
    [ (body.to_s.split.size / 200.0).ceil, 1 ].max
  end

  # Authored by the site owner, so the rendered HTML is trusted.
  def html
    self.class.markdown.render(body.to_s).html_safe
  end

  def self.markdown
    @markdown ||= Redcarpet::Markdown.new(
      HTMLRenderer.new(with_toc_data: true, hard_wrap: false),
      fenced_code_blocks: true,
      autolink: true,
      tables: true,
      strikethrough: true,
      superscript: true,
      lax_spacing: true,
      no_intra_emphasis: true
    )
  end

  private

  def ensure_slug
    return if slug.present?
    return if title.blank?

    self.slug = title.parameterize
  end
end
