class CreateComments < ActiveRecord::Migration[8.0]
  def change
    create_table :comments do |t|
      t.string :name, null: false
      t.text :body, null: false
      t.string :ip, null: false

      t.timestamps
    end
    add_index :comments, :created_at
    add_index :comments, :ip
  end
end
