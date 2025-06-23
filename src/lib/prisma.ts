import { PrismaClient } from '@prisma/client'

// 全局变量声明，避免在开发环境中重复创建 Prisma 实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 创建 Prisma 客户端实例
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// 在开发环境中将 Prisma 实例保存到全局变量，避免热重载时重复创建
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 数据库类型定义
export interface Client {
  id: string
  name: string
  avatar: string
  createdAt: Date
  updatedAt: Date
}

export interface DailyRecord {
  id: string
  clientId: string
  date: string
  regularCandles: number
  regularCandlesComparison: string
  seasonalCandles: number
  onlineTime?: string | null
  actualDuration?: number | null
  notes: string
  createdAt: Date
  updatedAt: Date
}

// 客户相关的数据库操作
export const clientsApi = {
  // 获取所有客户
  async getAll(): Promise<Client[]> {
    return await prisma.client.findMany({
      orderBy: { createdAt: 'asc' }
    })
  },

  // 创建新客户
  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    return await prisma.client.create({
      data: client
    })
  },

  // 更新客户信息
  async update(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client> {
    return await prisma.client.update({
      where: { id },
      data: updates
    })
  },

  // 删除客户
  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id }
    })
  }
}

// 每日记录相关的数据库操作
export const recordsApi = {
  // 获取指定客户的所有记录
  async getByClientId(clientId: string): Promise<DailyRecord[]> {
    return await prisma.dailyRecord.findMany({
      where: { clientId },
      orderBy: { date: 'desc' }
    })
  },

  // 获取指定客户的最新记录
  async getLatestByClientId(clientId: string): Promise<DailyRecord | null> {
    return await prisma.dailyRecord.findFirst({
      where: { clientId },
      orderBy: { date: 'desc' }
    })
  },

  // 创建新记录
  async create(record: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyRecord> {
    // 自动计算对比值
    const recordWithComparison = await this.calculateComparison(record)
    
    return await prisma.dailyRecord.create({
      data: recordWithComparison
    })
  },

  // 计算对比值的辅助方法
  async calculateComparison(record: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>> {
    try {
      // 获取前一天的记录
      const recordDate = new Date(record.date)
      const previousDate = new Date(recordDate)
      previousDate.setDate(previousDate.getDate() - 1)
      const previousDateStr = previousDate.toISOString().split('T')[0]

      const previousRecord = await prisma.dailyRecord.findFirst({
        where: {
          clientId: record.clientId,
          date: previousDateStr
        }
      })

      // 计算对比值
      let comparison = ''
      if (previousRecord) {
        const diff = record.regularCandles - previousRecord.regularCandles
        if (diff > 0) {
          comparison = `+${diff}`
        } else if (diff < 0) {
          comparison = `${diff}`
        } else {
          comparison = '0'
        }
      } else {
        // 如果没有前一天的记录，显示为新记录
        comparison = 'NEW'
      }

      return {
        ...record,
        regularCandlesComparison: comparison
      }
    } catch (error) {
      console.error('计算对比值时出错:', error)
      // 如果计算失败，返回原记录
      return record
    }
  },

  // 更新记录
  async update(id: string, updates: Partial<Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DailyRecord> {
    return await prisma.dailyRecord.update({
      where: { id },
      data: updates
    })
  },

  // 删除记录
  async delete(id: string): Promise<void> {
    await prisma.dailyRecord.delete({
      where: { id }
    })
  },

  // 获取指定日期范围内的记录
  async getByDateRange(clientId: string, startDate: string, endDate: string): Promise<DailyRecord[]> {
    return await prisma.dailyRecord.findMany({
      where: {
        clientId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    })
  }
}
