import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserSession> {
    const session = this.sessionRepository.create({
      userId,
      loginAt: new Date(),
      ipAddress,
      userAgent,
      isActive: true,
    });

    return this.sessionRepository.save(session);
  }

  async endSession(sessionId: string): Promise<UserSession | null> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) return null;

    const logoutAt = new Date();
    const durationMinutes = Math.round(
      (logoutAt.getTime() - session.loginAt.getTime()) / (1000 * 60),
    );

    session.logoutAt = logoutAt;
    session.durationMinutes = durationMinutes;
    session.isActive = false;

    return this.sessionRepository.save(session);
  }

  async endAllUserSessions(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
    });

    for (const session of activeSessions) {
      await this.endSession(session.id);
    }
  }

  async getActiveSession(userId: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: { userId, isActive: true },
      order: { loginAt: 'DESC' },
    });
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { loginAt: 'DESC' },
    });
  }

  // For Admin Dashboard - Front Desk Activity
  async getFrontDeskActivity(period: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const sessions = await this.sessionRepository.find({
      where: {
        loginAt: MoreThanOrEqual(startDate),
      },
      relations: ['user'],
      order: { loginAt: 'DESC' },
    });

    // Filter only front_desk users
    const frontDeskSessions = sessions.filter(
      (s) => s.user?.role === 'front_desk',
    );

    // Group by user and calculate total hours
    const userStats = new Map<
      string,
      { user: any; totalMinutes: number; sessions: UserSession[] }
    >();

    for (const session of frontDeskSessions) {
      const userId = session.userId;
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          user: {
            id: session.user.id,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            email: session.user.email,
          },
          totalMinutes: 0,
          sessions: [],
        });
      }

      const stats = userStats.get(userId)!;
      stats.sessions.push(session);

      if (session.durationMinutes) {
        stats.totalMinutes += session.durationMinutes;
      } else if (session.isActive) {
        // Still logged in - calculate current duration
        const currentDuration = Math.round(
          (new Date().getTime() - session.loginAt.getTime()) / (1000 * 60),
        );
        stats.totalMinutes += currentDuration;
      }
    }

    return Array.from(userStats.values()).map((stats) => ({
      ...stats,
      totalHours: Math.round((stats.totalMinutes / 60) * 100) / 100,
    }));
  }

  async getAllSessionsForPeriod(period: 'today' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return this.sessionRepository.find({
      where: {
        loginAt: MoreThanOrEqual(startDate),
      },
      relations: ['user'],
      order: { loginAt: 'DESC' },
    });
  }
}
