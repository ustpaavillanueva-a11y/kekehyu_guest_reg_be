import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomType } from './entities/room-type.entity';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';

@Injectable()
export class RoomTypesService {
  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
  ) {}

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    const roomType = this.roomTypeRepository.create(createRoomTypeDto);
    return this.roomTypeRepository.save(roomType);
  }

  async findAll(): Promise<RoomType[]> {
    return this.roomTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findAllActive(): Promise<RoomType[]> {
    return this.roomTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RoomType> {
    const roomType = await this.roomTypeRepository.findOne({ where: { id } });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    return roomType;
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
}
