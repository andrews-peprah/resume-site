class CreatePosts < ActiveRecord::Migration[8.0]
  def change
    create_table :posts do |t|
      t.string  :title, null: false
      t.string  :slug, null: false
      t.text    :description
      t.text    :body, null: false        # Markdown
      t.date    :published_on
      t.boolean :published, null: false, default: true
      t.timestamps
    end
    add_index :posts, :slug, unique: true
    add_index :posts, :published_on
  end
end
