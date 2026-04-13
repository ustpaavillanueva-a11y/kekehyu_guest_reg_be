import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Guest } from './entities/guest.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { AccompanyingGuest } from './entities/accompanying-guest.entity';
import { GuestAgreement } from './entities/guest-agreement.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { Role } from '../../common/enums/role.enum';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(AccompanyingGuest)
    private readonly accompanyingGuestRepository: Repository<AccompanyingGuest>,
    @InjectRepository(GuestAgreement)
    private readonly agreementRepository: Repository<GuestAgreement>,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async create(
    createGuestDto: CreateGuestDto,
    registeredById: string,
  ): Promise<Guest> {
    // Create guest
    const guest = this.guestRepository.create({
      firstName: createGuestDto.firstName,
      lastName: createGuestDto.lastName,
      middleName: createGuestDto.middleName,
      phoneNumber: createGuestDto.phoneNumber,
      email: createGuestDto.email,
      country: createGuestDto.country,
      validIdPresented: createGuestDto.validIdPresented,
      vehiclePlateNo: createGuestDto.vehiclePlateNo,
      registeredById,
    });

    const savedGuest = await this.guestRepository.save(guest);

    // Create reservations
    for (const resDto of createGuestDto.reservations) {
      const reservation = this.reservationRepository.create({
        guestId: savedGuest.id,
        reservationNumber: resDto.reservationNumber,
        roomNumber: resDto.roomNumber,
        roomTypeId: resDto.roomTypeId,
        checkInDate: new Date(resDto.checkInDate),
        checkOutDate: resDto.checkOutDate ? new Date(resDto.checkOutDate) : undefined,
        checkInTime: resDto.checkInTime,
        checkOutTime: resDto.checkOutTime,
        status: ReservationStatus.CHECKED_IN,
      });

      const savedReservation = await this.reservationRepository.save(reservation);

      // Create accompanying guests for this reservation
      if (resDto.accompanyingGuests && resDto.accompanyingGuests.length > 0) {
        for (const agDto of resDto.accompanyingGuests) {
          const accompanyingGuest = this.accompanyingGuestRepository.create({
            reservationId: savedReservation.id,
            firstName: agDto.firstName,
            lastName: agDto.lastName,
            middleName: agDto.middleName,
            validIdPresented: agDto.validIdPresented,
            signature: agDto.signature,
          });
          await this.accompanyingGuestRepository.save(accompanyingGuest);
        }
      }
    }

    // Create agreement
    const agreement = this.agreementRepository.create({
      guestId: savedGuest.id,
      ...createGuestDto.agreement,
      signatureDate: new Date(createGuestDto.agreement.signatureDate),
    });
    await this.agreementRepository.save(agreement);

    return this.findOne(savedGuest.id);
  }

  async findAll(
    userId?: string,
    userRole?: Role,
  ): Promise<Guest[]> {
    const queryBuilder = this.guestRepository
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.reservations', 'reservation')
      .leftJoinAndSelect('reservation.roomType', 'roomType')
      .leftJoinAndSelect('reservation.accompanyingGuests', 'accompanyingGuest')
      .leftJoinAndSelect('guest.agreement', 'agreement')
      .leftJoinAndSelect('guest.registeredBy', 'registeredBy')
      .orderBy('guest.createdAt', 'DESC');

    // Front desk can only see their own registrations
    if (userRole === Role.FRONT_DESK && userId) {
      queryBuilder.where('guest.registeredById = :userId', { userId });
    }

    const guests = await queryBuilder.getMany();

    // Remove sensitive data from registeredBy
    return guests.map((guest) => {
      if (guest.registeredBy) {
        delete (guest.registeredBy as any).password;
      }
      return guest;
    });
  }

  async findOne(id: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { id },
      relations: [
        'reservations',
        'reservations.roomType',
        'reservations.accompanyingGuests',
        'agreement',
        'registeredBy',
      ],
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    if (guest.registeredBy) {
      delete (guest.registeredBy as any).password;
    }

    return guest;
  }

  async update(
    id: string,
    updateGuestDto: UpdateGuestDto,
    userId: string,
    userRole: Role,
  ): Promise<Guest> {
    const guest = await this.findOne(id);

    // Only super admin can update
    if (userRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can update guests');
    }

    Object.assign(guest, updateGuestDto);
    await this.guestRepository.save(guest);

    return this.findOne(id);
  }

  async remove(id: string, userRole: Role): Promise<void> {
    if (userRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can delete guests');
    }

    const guest = await this.findOne(id);
    await this.guestRepository.remove(guest);
  }

  // Statistics for dashboard
  async getStatistics(period: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - dayOfWeek,
        );
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const guests = await this.guestRepository.find({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
      relations: ['reservations', 'registeredBy'],
    });

    // Count by front desk
    const byFrontDesk = new Map<string, { user: any; count: number }>();
    for (const guest of guests) {
      const userId = guest.registeredById;
      if (!byFrontDesk.has(userId)) {
        byFrontDesk.set(userId, {
          user: guest.registeredBy
            ? {
                id: guest.registeredBy.id,
                firstName: guest.registeredBy.firstName,
                lastName: guest.registeredBy.lastName,
              }
            : null,
          count: 0,
        });
      }
      byFrontDesk.get(userId)!.count++;
    }

    return {
      totalGuests: guests.length,
      totalReservations: guests.reduce(
        (sum, g) => sum + (g.reservations?.length || 0),
        0,
      ),
      byFrontDesk: Array.from(byFrontDesk.values()),
    };
  }

  async getGuestsForPeriod(period: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - dayOfWeek,
        );
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return this.guestRepository.find({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
      relations: [
        'reservations',
        'reservations.roomType',
        'registeredBy',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // Update PDF path after generation
  async updatePdfPath(guestId: string, pdfPath: string): Promise<void> {
    await this.agreementRepository.update(
      { guestId },
      { pdfPath },
    );
  }

  // Upload PDF to Supabase Storage
  async uploadPdfToStorage(
    guestId: string,
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ message: string; pdfUrl: string }> {
    // Verify guest exists
    const guest = await this.findOne(guestId);
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    try {
      // Upload to Supabase Storage
      const pdfUrl = await this.supabaseStorageService.uploadPdf(
        fileBuffer,
        uniqueFileName,
        guestId,
      );

      // Update guest agreement with PDF URL
      await this.updatePdfPath(guestId, pdfUrl);

      return {
        message: 'PDF uploaded successfully',
        pdfUrl,
      };
    } catch (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  }
}
