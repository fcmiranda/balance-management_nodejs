import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1720266725000 implements MigrationInterface {
  name = 'InitialMigration1720266725000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "role" VARCHAR(10) NOT NULL DEFAULT 'client',
        "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
        "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "userId" INTEGER NOT NULL,
        "accountNumber" VARCHAR(20) NOT NULL UNIQUE,
        "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
        "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_userId" ON "accounts" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounts_accountNumber" ON "accounts" ("accountNumber")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_accounts_accountNumber"`);
    await queryRunner.query(`DROP INDEX "IDX_accounts_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
