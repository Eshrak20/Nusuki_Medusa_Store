import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration202603301700 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE product_category
      ADD COLUMN IF NOT EXISTS image text NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE product_category
      DROP COLUMN IF EXISTS image;
    `)
  }
}