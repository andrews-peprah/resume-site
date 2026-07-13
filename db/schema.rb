# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_07_13_000001) do
  create_table "admin_users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
  end

  create_table "experiences", force: :cascade do |t|
    t.integer "position", default: 0, null: false
    t.string "slug", null: false
    t.string "role", null: false
    t.string "company", null: false
    t.string "monogram"
    t.string "logo_domain"
    t.string "year_label"
    t.string "location"
    t.float "lat"
    t.float "lon"
    t.text "summary"
    t.text "stack"
    t.text "highlights"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["position"], name: "index_experiences_on_position"
    t.index ["slug"], name: "index_experiences_on_slug", unique: true
  end

  create_table "languages", force: :cascade do |t|
    t.string "name", null: false
    t.string "category", null: false
    t.integer "level", default: 0
    t.string "level_label"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category", "position"], name: "index_languages_on_category_and_position"
  end

  create_table "posts", force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "description"
    t.text "body", null: false
    t.date "published_on"
    t.boolean "published", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["published_on"], name: "index_posts_on_published_on"
    t.index ["slug"], name: "index_posts_on_slug", unique: true
  end

  create_table "projects", force: :cascade do |t|
    t.integer "position", default: 0, null: false
    t.string "slug", null: false
    t.string "name", null: false
    t.string "tagline"
    t.string "year_label"
    t.text "summary"
    t.text "stack"
    t.string "url"
    t.string "source_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["position"], name: "index_projects_on_position"
    t.index ["slug"], name: "index_projects_on_slug", unique: true
  end
end
