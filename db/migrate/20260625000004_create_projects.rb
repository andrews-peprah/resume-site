class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects do |t|
      t.integer :position, null: false, default: 0
      t.string  :slug, null: false
      t.string  :name, null: false
      t.string  :tagline
      t.string  :year_label
      t.text    :summary
      t.text    :stack        # JSON array of tech
      t.string  :url          # live link (optional)
      t.string  :source_url   # source repo (optional)
      t.timestamps
    end
    add_index :projects, :position
    add_index :projects, :slug, unique: true
  end
end
