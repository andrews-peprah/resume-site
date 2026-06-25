require "rouge"

module ApplicationHelper
  # Syntax-highlighting CSS for Rouge-rendered code blocks (scoped to .highlight).
  # Computed once at boot.
  ROUGE_CSS = Rouge::Themes::Base16.mode(:dark).render(scope: ".highlight").html_safe

  def rouge_css
    ROUGE_CSS
  end
end
