import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTempUploads1786000100000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("temp_uploads");
        if (table) {
            return;
        }

        await queryRunner.createTable(
            new Table({
                name: "temp_uploads",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "file_path",
                        type: "varchar",
                    },
                    {
                        name: "file_url",
                        type: "varchar",
                    },
                    {
                        name: "file_name",
                        type: "varchar",
                    },
                    {
                        name: "uploaded_by",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "expires_at",
                        type: "timestamp",
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            "temp_uploads",
            new TableForeignKey({
                columnNames: ["uploaded_by"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("temp_uploads", true);
    }

}
