import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserDeleteForeignKeys1786000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guests" ALTER COLUMN "registered_by" DROP NOT NULL`);

        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_f32b1cb14a9920477bcfd63df2c"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL`);

        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "FK_e9658e959c490b0a634dfc54783"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);

        await queryRunner.query(`ALTER TABLE "guests" DROP CONSTRAINT IF EXISTS "FK_84a6fafde19c9f6d710bda3f799"`);
        await queryRunner.query(`ALTER TABLE "guests" ADD CONSTRAINT "FK_84a6fafde19c9f6d710bda3f799" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL`);

        await queryRunner.query(`ALTER TABLE "hotel_settings" DROP CONSTRAINT IF EXISTS "FK_43471d33d7db6b02972105c31ca"`);
        await queryRunner.query(`ALTER TABLE "hotel_settings" ADD CONSTRAINT "FK_43471d33d7db6b02972105c31ca" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hotel_settings" DROP CONSTRAINT IF EXISTS "FK_43471d33d7db6b02972105c31ca"`);
        await queryRunner.query(`ALTER TABLE "hotel_settings" ADD CONSTRAINT "FK_43471d33d7db6b02972105c31ca" FOREIGN KEY ("updated_by") REFERENCES "users"("id")`);

        await queryRunner.query(`ALTER TABLE "guests" DROP CONSTRAINT IF EXISTS "FK_84a6fafde19c9f6d710bda3f799"`);
        await queryRunner.query(`ALTER TABLE "guests" ADD CONSTRAINT "FK_84a6fafde19c9f6d710bda3f799" FOREIGN KEY ("registered_by") REFERENCES "users"("id")`);

        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "FK_e9658e959c490b0a634dfc54783"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);

        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_f32b1cb14a9920477bcfd63df2c"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c" FOREIGN KEY ("created_by") REFERENCES "users"("id")`);

        await queryRunner.query(`ALTER TABLE "guests" ALTER COLUMN "registered_by" SET NOT NULL`);
    }

}
