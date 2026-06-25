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
end
