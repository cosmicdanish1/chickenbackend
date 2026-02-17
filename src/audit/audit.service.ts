import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface CreateAuditLogDto {
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(log);
  }

  async findAll(params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    entity?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (params?.startDate && params?.endDate) {
      query.andWhere('audit.created_at BETWEEN :startDate AND :endDate', {
        startDate: params.startDate,
        endDate: params.endDate,
      });
    }

    if (params?.userId) {
      query.andWhere('audit.user_id = :userId', { userId: params.userId });
    }

    if (params?.action) {
      query.andWhere('audit.action = :action', { action: params.action });
    }

    if (params?.entity) {
      query.andWhere('audit.entity = :entity', { entity: params.entity });
    }

    query.orderBy('audit.created_at', 'DESC');

    if (params?.limit) {
      query.limit(params.limit);
    }

    return query.getMany();
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entity, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string, limit?: number): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentLogs(limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStatistics(startDate?: string, endDate?: string): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    byUser: Array<{ userId: string; userEmail: string; count: number }>;
  }> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (startDate && endDate) {
      query.where('audit.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const logs = await query.getMany();

    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    const userCounts: Record<string, { email: string; count: number }> = {};

    logs.forEach(log => {
      // Count by action
      byAction[log.action] = (byAction[log.action] || 0) + 1;

      // Count by entity
      byEntity[log.entity] = (byEntity[log.entity] || 0) + 1;

      // Count by user
      if (log.userId) {
        if (!userCounts[log.userId]) {
          userCounts[log.userId] = { email: log.userEmail || '', count: 0 };
        }
        userCounts[log.userId].count++;
      }
    });

    const byUser = Object.entries(userCounts).map(([userId, data]) => ({
      userId,
      userEmail: data.email,
      count: data.count,
    }));

    return {
      totalLogs: logs.length,
      byAction,
      byEntity,
      byUser,
    };
  }
}
