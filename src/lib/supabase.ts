// 暂时注释掉 Supabase 导入，使用纯模拟数据模式
// import { createClient } from '@supabase/supabase-js'

// 这些环境变量需要在 .env.local 文件中配置
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 检查是否配置了真实的 Supabase
// const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
//   !supabaseUrl.includes('placeholder') &&
//   !supabaseAnonKey.includes('placeholder')

// 暂时设置为 null，使用模拟数据
// 明确类型定义以避免 TypeScript 推断为 never
export const supabase: any = null

// 模拟数据（当 Supabase 未配置时使用）
const mockClients: Client[] = [
  {
    id: '1',
    name: '小星',
    avatar: '🌟',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: '月光',
    avatar: '🌙',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: '云朵',
    avatar: '☁️',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// 生成最近几天的日期用于测试
const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const dayBeforeYesterday = new Date(today)
dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)

const mockRecords: DailyRecord[] = [
  {
    id: '1',
    client_id: '1',
    date: yesterday.toISOString().split('T')[0],
    regular_candles: 22,
    regular_candles_comparison: '+3',
    seasonal_candles: 4,
    online_time: '20:30',
    actual_duration: 45,
    notes: '完成了所有日常任务，额外收集了一些季节蜡烛',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    client_id: '1',
    date: dayBeforeYesterday.toISOString().split('T')[0],
    regular_candles: 19,
    regular_candles_comparison: '+2',
    seasonal_candles: 3,
    online_time: '19:45',
    actual_duration: 38,
    notes: '今日任务顺利完成',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    client_id: '2',
    date: yesterday.toISOString().split('T')[0],
    regular_candles: 18,
    regular_candles_comparison: '+1',
    seasonal_candles: 2,
    online_time: '21:15',
    actual_duration: 42,
    notes: '月光的代练记录',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// 数据库类型定义
export interface Client {
  id: string
  name: string
  avatar: string
  created_at: string
  updated_at: string
}

export interface DailyRecord {
  id: string
  client_id: string
  date: string
  regular_candles: number
  regular_candles_comparison: string
  seasonal_candles: number
  online_time?: string // 上线时间 (HH:MM 格式)
  actual_duration?: number // 实际用时（分钟）
  notes: string
  created_at: string
  updated_at: string
}

// 客户相关的数据库操作
export const clientsApi = {
  // 获取所有客户
  async getAll(): Promise<Client[]> {
    if (!supabase) {
      // 使用模拟数据
      return mockClients
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // 创建新客户
  async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    if (!supabase) {
      // 使用模拟数据
      const newClient: Client = {
        id: Date.now().toString(),
        ...client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockClients.push(newClient)
      return newClient
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新客户信息
  async update(id: string, updates: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client> {
    if (!supabase) {
      // 使用模拟数据
      const clientIndex = mockClients.findIndex(client => client.id === id)
      if (clientIndex === -1) {
        throw new Error('Client not found')
      }

      mockClients[clientIndex] = {
        ...mockClients[clientIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      return mockClients[clientIndex]
    }

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除客户
  async delete(id: string): Promise<void> {
    if (!supabase) {
      // 使用模拟数据
      const clientIndex = mockClients.findIndex(client => client.id === id)
      if (clientIndex > -1) {
        mockClients.splice(clientIndex, 1)
      }
      // 同时删除该客户的所有记录
      for (let i = mockRecords.length - 1; i >= 0; i--) {
        if (mockRecords[i].client_id === id) {
          mockRecords.splice(i, 1)
        }
      }
      return
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// 每日记录相关的数据库操作
export const recordsApi = {
  // 获取指定客户的所有记录
  async getByClientId(clientId: string): Promise<DailyRecord[]> {
    if (!supabase) {
      // 使用模拟数据
      return mockRecords.filter(record => record.client_id === clientId)
    }

    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 获取指定客户的最新记录
  async getLatestByClientId(clientId: string): Promise<DailyRecord | null> {
    if (!supabase) {
      // 使用模拟数据
      const clientRecords = mockRecords.filter(record => record.client_id === clientId)
      if (clientRecords.length === 0) return null

      // 按日期排序，返回最新的
      clientRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      return clientRecords[0]
    }

    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 是没有找到记录的错误码
    return data || null
  },

  // 创建新记录
  async create(record: Omit<DailyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DailyRecord> {
    // 自动计算对比值
    const recordWithComparison = await this.calculateComparison(record)

    if (!supabase) {
      // 使用模拟数据
      const newRecord: DailyRecord = {
        id: Date.now().toString(),
        ...recordWithComparison,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockRecords.unshift(newRecord) // 添加到开头，保持最新的在前面
      return newRecord
    }

    const { data, error } = await supabase
      .from('daily_records')
      .insert([recordWithComparison])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 计算对比值的辅助方法
  async calculateComparison(record: Omit<DailyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<Omit<DailyRecord, 'id' | 'created_at' | 'updated_at'>> {
    try {
      // 获取前一天的记录
      const recordDate = new Date(record.date)
      const previousDate = new Date(recordDate)
      previousDate.setDate(previousDate.getDate() - 1)
      const previousDateStr = previousDate.toISOString().split('T')[0]

      let previousRecord: DailyRecord | null = null

      if (!supabase) {
        // 使用模拟数据查找前一天记录
        previousRecord = mockRecords.find(r =>
          r.client_id === record.client_id && r.date === previousDateStr
        ) || null
      } else {
        // 使用 Supabase 查找前一天记录
        const { data } = await supabase
          .from('daily_records')
          .select('*')
          .eq('client_id', record.client_id)
          .eq('date', previousDateStr)
          .single()

        previousRecord = data
      }

      // 计算对比值
      let comparison = ''
      if (previousRecord) {
        const diff = record.regular_candles - previousRecord.regular_candles
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
        regular_candles_comparison: comparison
      }
    } catch (error) {
      console.error('计算对比值时出错:', error)
      // 如果计算失败，返回原记录
      return record
    }
  },

  // 更新记录
  async update(id: string, updates: Partial<Omit<DailyRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<DailyRecord> {
    if (!supabase) {
      // 使用模拟数据
      const recordIndex = mockRecords.findIndex(record => record.id === id)
      if (recordIndex === -1) {
        throw new Error('Record not found')
      }

      mockRecords[recordIndex] = {
        ...mockRecords[recordIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      return mockRecords[recordIndex]
    }

    const { data, error } = await supabase
      .from('daily_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除记录
  async delete(id: string): Promise<void> {
    if (!supabase) {
      // 使用模拟数据
      const index = mockRecords.findIndex(record => record.id === id)
      if (index > -1) {
        mockRecords.splice(index, 1)
      }
      return
    }

    const { error } = await supabase
      .from('daily_records')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 获取指定日期范围内的记录
  async getByDateRange(clientId: string, startDate: string, endDate: string): Promise<DailyRecord[]> {
    if (!supabase) {
      // 使用模拟数据
      return mockRecords.filter(record =>
        record.client_id === clientId &&
        record.date >= startDate &&
        record.date <= endDate
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('client_id', clientId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }
}
