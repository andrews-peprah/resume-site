class CreateExperiences < ActiveRecord::Migration[8.0]
  def change
    create_table :experiences do |t|
      t.integer :position, null: false, default: 0
      t.string  :slug, null: false
      t.string  :role, null: false
      t.string  :company, null: false
      t.string  :monogram
      t.string  :logo_domain
      t.string  :year_label
      t.string  :location
      t.float   :lat
      t.float   :lon
      t.text    :summary
      t.text    :stack         # JSON array
      t.text    :highlights    # JSON array
      t.timestamps
    end
    add_index :experiences, :slug, unique: true
    add_index :experiences, :position
  end
end
