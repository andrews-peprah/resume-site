class CreateLanguages < ActiveRecord::Migration[8.0]
  def change
    create_table :languages do |t|
      t.string  :name, null: false
      t.string  :category, null: false   # spoken | backend | frontend | infra | recent
      t.integer :level, default: 0        # 0–100 (ignored for spoken)
      t.string  :level_label              # for spoken: "Native / Bilingual", etc.
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :languages, [ :category, :position ]
  end
end
