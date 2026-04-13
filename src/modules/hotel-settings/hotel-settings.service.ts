import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelSetting } from './entities/hotel-setting.entity';
import {
  PolicyTemplate,
  PolicyCategory,
} from './entities/policy-template.entity';
import {
  UpdateHotelSettingDto,
  CreatePolicyTemplateDto,
  UpdatePolicyTemplateDto,
} from './dto/hotel-settings.dto';

@Injectable()
export class HotelSettingsService {
  constructor(
    @InjectRepository(HotelSetting)
    private readonly settingRepository: Repository<HotelSetting>,
    @InjectRepository(PolicyTemplate)
    private readonly policyRepository: Repository<PolicyTemplate>,
  ) {}

  // Hotel Settings
  async getSettings(): Promise<HotelSetting> {
    let settings = await this.settingRepository.findOne({ where: {} });

    if (!settings) {
      // Create default settings
      settings = this.settingRepository.create({
        hotelName: 'Kekehyu Business Hotel',
        defaultCheckInTime: '14:00',
        defaultCheckOutTime: '11:00',
        smokingFee: 5000,
        corkageFeePercent: 30,
      });
      await this.settingRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(
    updateDto: UpdateHotelSettingDto,
    updatedById: string,
  ): Promise<HotelSetting> {
    let settings = await this.getSettings();
    Object.assign(settings, updateDto, { updatedById });
    return this.settingRepository.save(settings);
  }

  // Policy Templates
  async createPolicy(
    createPolicyDto: CreatePolicyTemplateDto,
  ): Promise<PolicyTemplate> {
    const policy = this.policyRepository.create(createPolicyDto);
    return this.policyRepository.save(policy);
  }

  async getAllPolicies(): Promise<PolicyTemplate[]> {
    return this.policyRepository.find({
      order: { category: 'ASC', displayOrder: 'ASC' },
    });
  }

  async getActivePolicies(): Promise<PolicyTemplate[]> {
    return this.policyRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', displayOrder: 'ASC' },
    });
  }

  async getPoliciesByCategory(
    category: PolicyCategory,
  ): Promise<PolicyTemplate[]> {
    return this.policyRepository.find({
      where: { category, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async getPolicy(id: string): Promise<PolicyTemplate> {
    const policy = await this.policyRepository.findOne({ where: { id } });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    return policy;
  }

  async updatePolicy(
    id: string,
    updateDto: UpdatePolicyTemplateDto,
  ): Promise<PolicyTemplate> {
    const policy = await this.getPolicy(id);
    Object.assign(policy, updateDto);
    return this.policyRepository.save(policy);
  }

  async deletePolicy(id: string): Promise<void> {
    const policy = await this.getPolicy(id);
    await this.policyRepository.remove(policy);
  }

  async seedDefaultPolicies(): Promise<void> {
    const existingPolicies = await this.policyRepository.count();
    if (existingPolicies > 0) return;

    const defaultPolicies: CreatePolicyTemplateDto[] = [
      // Housekeeping
      {
        category: PolicyCategory.HOUSEKEEPING,
        code: 'housekeeping_1',
        content: 'I understand that make-up room service is upon request only.',
        displayOrder: 1,
      },
      {
        category: PolicyCategory.HOUSEKEEPING,
        code: 'housekeeping_2',
        content:
          'I acknowledge that housekeeping staff are not allowed to enter the room without guest consent.',
        displayOrder: 2,
      },
      // Hotel Policies
      {
        category: PolicyCategory.HOTEL,
        code: 'smoking',
        content:
          'Smoking inside rooms is prohibited. A ₱5,000 smoking fee applies for violations.',
        displayOrder: 1,
      },
      {
        category: PolicyCategory.HOTEL,
        code: 'corkage',
        content: 'A 30% corkage fee applies to outside food and beverages.',
        displayOrder: 2,
      },
      {
        category: PolicyCategory.HOTEL,
        code: 'no_pets',
        content: 'No pets allowed on hotel premises.',
        displayOrder: 3,
      },
      {
        category: PolicyCategory.HOTEL,
        code: 'negligence',
        content:
          'Guests are responsible for any loss, damage, or incidents caused by negligence.',
        displayOrder: 4,
      },
      {
        category: PolicyCategory.HOTEL,
        code: 'minors',
        content:
          'Minors must be accompanied by a responsible adult in accordance with local laws.',
        displayOrder: 5,
      },
      {
        category: PolicyCategory.HOTEL,
        code: 'parking',
        content: 'Parking is limited and subject to availability.',
        displayOrder: 6,
      },
      {
        category: PolicyCategory.HOTEL,
        code: 'safe',
        content:
          'The hotel is not liable for loss, theft, or damage to personal belongings. A digital in-room safe is provided.',
        displayOrder: 7,
      },
      {
        category: PolicyCategory.HOTEL,
        code: 'force_majeure',
        content:
          'In cases of force majeure (e.g., natural disasters), hotel policies may be adjusted as necessary.',
        displayOrder: 8,
      },
      // Data Privacy
      {
        category: PolicyCategory.DATA_PRIVACY,
        code: 'data_privacy',
        content:
          'I acknowledge that my personal information will be handled confidentially in accordance with data privacy regulations.',
        displayOrder: 1,
      },
    ];

    for (const policy of defaultPolicies) {
      await this.createPolicy(policy);
    }
  }
}
