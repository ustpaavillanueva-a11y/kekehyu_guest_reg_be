import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTotalRoomsToHotelSettings1785998805109 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("hotel_settings");
        const columnExists = table?.columns.find(col => col.name === "total_rooms");

        if (!columnExists) {
            await queryRunner.addColumn(
                "hotel_settings",
                new TableColumn({
                    name: "total_rooms",
                    type: "int",
                    isNullable: false,
                    default: 0,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("hotel_settings");
        const columnExists = table?.columns.find(col => col.name === "total_rooms");

        if (columnExists) {
            await queryRunner.dropColumn("hotel_settings", "total_rooms");
        }
    }

}
