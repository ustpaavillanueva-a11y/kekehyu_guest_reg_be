import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomType } from './entities/room-type.entity';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';

@Injectable()
export class RoomTypesService {
  private readonly logger = new Logger(RoomTypesService.name);

  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
  ) {}

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    try {
      const roomType = this.roomTypeRepository.create(createRoomTypeDto);
      return await this.roomTypeRepository.save(roomType);
    } catch (error) {
      this.logger.error(`Failed to create room type: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create room type. Database connection issue.');
    }
  }

  async findAll(): Promise<RoomType[]> {
    try {
      return await this.roomTypeRepository.find({
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch room types: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch room types. Database connection issue.');
    }
  }

  async findAllActive(): Promise<RoomType[]> {
    try {
      return await this.roomTypeRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch active room types: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch active room types. Database connection issue.');
    }
  }

  async findOne(id: string): Promise<RoomType> {
    try {
      const roomType = await this.roomTypeRepository.findOne({ where: { id } });

      if (!roomType) {
        throw new NotFoundException('Room type not found');
      }

      return roomType;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to fetch room type: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch room type. Database connection issue.');
    }
  }

  async update(
    id: string,
    updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    const roomType = await this.findOne(id);
    Object.assign(roomType, updateRoomTypeDto);
    return this.roomTypeRepository.save(roomType);
  }

  async remove(id: string): Promise<void> {
    const roomType = await this.findOne(id);
    await this.roomTypeRepository.remove(roomType);
  }

  async seedDefaultRoomTypes(): Promise<void> {
    const existingTypes = await this.roomTypeRepository.count();
    if (existingTypes > 0) return;

    const defaultTypes = [
      { name: 'STANDARD SINGLE', description: '1 Single Bed' },
      { name: 'STANDARD DOUBLE', description: '1 Double Bed' },
      { name: 'DELUXE SINGLE', description: '1 Single Bed with amenities' },
      { name: 'DELUXE DOUBLE', description: '2 Double Size Bed' },
      { name: 'SUITE', description: 'Suite room with living area' },
      { name: 'FAMILY ROOM', description: 'For family accommodation' },
    ];

    for (const type of defaultTypes) {
      await this.create(type);
    }
  }

  /**
   * Resolve room type name to UUID
   * Case-insensitive lookup, auto-creates if not found
   * @param roomTypeName - The name of the room type (e.g., "Standard Single" or "JUNIOR EXECUTIVE (KING BED)")
   * @returns The room type UUID
   */
  async resolveRoomTypeId(roomTypeName: string): Promise<string | null> {
    if (!roomTypeName || roomTypeName.trim() === '') {
      return null;
    }

    const trimmedName = roomTypeName.trim();

    try {
      // Case-insensitive search using LOWER()
      let roomType = await this.roomTypeRepository
        .createQueryBuilder('roomType')
        .where('LOWER(roomType.name) = LOWER(:name)', { name: trimmedName })
        .getOne();

      // If not found, auto-create the room type
      if (!roomType) {
        this.logger.log(`Room type "${trimmedName}" not found, creating new one...`);
        roomType = this.roomTypeRepository.create({
          name: trimmedName,
          description: `Auto-created room type: ${trimmedName}`,
          isActive: true,
        });
        await this.roomTypeRepository.save(roomType);
        this.logger.log(`Created new room type "${trimmedName}" with UUID: ${roomType.id}`);
      } else {
        this.logger.log(`Resolved room type "${trimmedName}" to UUID: ${roomType.id}`);
      }

      return roomType.id;
    } catch (error) {
      this.logger.error(`Failed to resolve room type: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Find room type by name (exact match, case-insensitive)
   */
  async findByName(name: string): Promise<RoomType | null> {
    try {
      return await this.roomTypeRepository
        .createQueryBuilder('roomType')
        .where('LOWER(roomType.name) = LOWER(:name)', { name: name.trim() })
        .getOne();
    } catch (error) {
      this.logger.error(`Failed to find room type by name: ${error.message}`, error.stack);
      return null;
    }
  }
}
