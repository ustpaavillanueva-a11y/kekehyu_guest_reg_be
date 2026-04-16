import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoomTypesBackupToGuestAgreements1776320503012 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column already exists before adding
        const table = await queryRunner.getTable("guest_agreements");
        const columnExists = table?.columns.find(col => col.name === "room_types_backup");
        
        if (!columnExists) {
            await queryRunner.addColumn(
                "guest_agreements",
                new TableColumn({
                    name: "room_types_backup",
                    type: "varchar",
                    length: "500",
                    isNullable: true,
                    default: null,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("guest_agreements");
        const columnExists = table?.columns.find(col => col.name === "room_types_backup");
        
        if (columnExists) {
            await queryRunner.dropColumn("guest_agreements", "room_types_backup");
        }
    }

}
