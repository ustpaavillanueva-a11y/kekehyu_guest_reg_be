import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTempUploadsTimezone1786000200000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_uploads" ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC'`);
        await queryRunner.query(`ALTER TABLE "temp_uploads" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "temp_uploads" ALTER COLUMN "expires_at" TYPE timestamptz USING "expires_at" AT TIME ZONE 'UTC'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temp_uploads" ALTER COLUMN "expires_at" TYPE timestamp USING "expires_at" AT TIME ZONE 'UTC'`);
        await queryRunner.query(`ALTER TABLE "temp_uploads" ALTER COLUMN "created_at" TYPE timestamp USING "created_at" AT TIME ZONE 'UTC'`);
        await queryRunner.query(`ALTER TABLE "temp_uploads" ALTER COLUMN "created_at" SET DEFAULT now()`);
    }

}
