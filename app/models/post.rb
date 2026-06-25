require "yaml"
require "redcarpet"
require "rouge"
require "rouge/plugins/redcarpet"

# Plain-Ruby blog post backed by a Markdown file in /posts.
# Each file starts with a YAML front-matter block:
#
#   ---
#   title: "My Post"
#   date: 2026-06-25
#   description: "One-line summary."
#   slug: my-post            # optional; derived from the filename otherwise
#   ---
#   Markdown body here...
#
class Post
  POSTS_DIR = Rails.root.join("posts")

  # Render fenced code blocks with Rouge syntax highlighting.
  class HTMLRenderer < Redcarpet::Render::HTML
    include Rouge::Plugins::Redcarpet
  end

  attr_reader :slug, :title, :date, :description, :body_markdown, :reading_minutes

  class << self
    def all
      @all ||= load_all
    end

    # Force a reload (handy in the console / development).
    def reload!
      @all = load_all
    end

    def find(slug)
      all.find { |post| post.slug == slug }
    end

    private

    def load_all
      Dir.glob(POSTS_DIR.join("*.md")).map { |path| from_file(path) }.sort_by(&:date).reverse
    end

    def from_file(path)
      meta, body = split_front_matter(File.read(path))
      default_slug = File.basename(path, ".md").sub(/\A\d{4}-\d{2}-\d{2}-/, "")
      new(
        slug: (meta["slug"] || default_slug).to_s,
        title: meta["title"].to_s,
        date: coerce_date(meta["date"]),
        description: meta["description"].to_s,
        body_markdown: body
      )
    end

    def split_front_matter(raw)
      if raw =~ /\A---\s*\n(.*?\n)---\s*\n(.*)\z/m
        [ YAML.safe_load(Regexp.last_match(1), permitted_classes: [ Date, Time ]) || {}, Regexp.last_match(2) ]
      else
        [ {}, raw ]
      end
    end

    def coerce_date(value)
      return value if value.is_a?(Date)
      Date.parse(value.to_s)
    rescue ArgumentError
      Date.new(1970, 1, 1)
    end
  end

  def initialize(slug:, title:, date:, description:, body_markdown:)
    @slug = slug
    @title = title
    @date = date
    @description = description
    @body_markdown = body_markdown
    @reading_minutes = [ (body_markdown.split.size / 200.0).ceil, 1 ].max
  end

  # Authored by the site owner, so the rendered HTML is trusted.
  def html
    @html ||= renderer.render(body_markdown).html_safe
  end

  def long_date
    date.strftime("%B %-d, %Y")
  end

  def to_param
    slug
  end

  private

  def renderer
    Redcarpet::Markdown.new(
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
