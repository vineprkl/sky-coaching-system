'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DailyRecord {
  id: string
  client_id: string
  date: string
  regular_candles: number
  regular_candles_comparison: string
  seasonal_candles: number
  service_hours: number
  notes: string
  created_at: string
}

interface ClientDashboardProps {
  clientId: string
}

export default function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today')
  const router = useRouter()

  useEffect(() => {
    fetchRecords()
  }, [clientId])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/records`)
      const result = await response.json()
      if (result.success) {
        setRecords(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  const todayRecord = records[0] // 假设第一条是最新的记录

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-700/80 to-purple-800/80 backdrop-blur-sm rounded-xl border border-purple-400/30 text-blue-200 hover:text-white hover:border-blue-400/50 transition-all duration-300 font-medium drop-shadow-lg hover:shadow-xl"
        >
          <span className="text-lg">🏠</span>
          <span>返回选择</span>
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg">我的代练数据</h1>
        <div></div>
      </div>

      {/* 标签切换 */}
      <div className="flex bg-gradient-to-r from-slate-800/90 to-purple-900/80 backdrop-blur-sm rounded-xl p-1 mb-8 max-w-md mx-auto border border-purple-400/30">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${activeTab === 'today'
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
            : 'text-blue-200 hover:text-white font-medium'
            }`}
        >
          今日反馈
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${activeTab === 'history'
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
            : 'text-blue-200 hover:text-white font-medium'
            }`}
        >
          历史星图
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'today' ? (
        <TodayView record={todayRecord} />
      ) : (
        <HistoryView records={records} />
      )}
    </div>
  )
}

function TodayView({ record }: { record?: DailyRecord }) {
  if (!record) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌟</div>
        <p className="text-gray-600">今日还没有代练数据</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 主要数据卡片 */}
      <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-400/30">
        <h3 className="text-lg font-bold text-white mb-4 drop-shadow-md">📅 {record.date}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-600/80 to-orange-600/80 rounded-xl border border-yellow-400/30">
            <div className="text-2xl mb-2 filter drop-shadow-lg">🕯️</div>
            <div className="text-2xl font-bold text-white drop-shadow-md">{record.regular_candles}</div>
            <div className="text-sm text-yellow-200">普通蜡烛</div>
            <div className="text-xs text-green-300 mt-1 font-bold">{record.regular_candles_comparison}</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-600/80 to-pink-600/80 rounded-xl border border-purple-400/30">
            <div className="text-2xl mb-2 filter drop-shadow-lg">✨</div>
            <div className="text-2xl font-bold text-white drop-shadow-md">{record.seasonal_candles}</div>
            <div className="text-sm text-purple-200">季节蜡烛</div>
          </div>

          {record.online_time && (
            <div className="text-center p-4 bg-gradient-to-br from-green-600/80 to-emerald-600/80 rounded-xl border border-green-400/30">
              <div className="text-2xl mb-2 filter drop-shadow-lg">🕐</div>
              <div className="text-2xl font-bold text-white drop-shadow-md">{record.online_time}</div>
              <div className="text-sm text-green-200">上线时间</div>
            </div>
          )}

          {record.actual_duration && (
            <div className="text-center p-4 bg-gradient-to-br from-indigo-600/80 to-violet-600/80 rounded-xl border border-indigo-400/30">
              <div className="text-2xl mb-2 filter drop-shadow-lg">⏱️</div>
              <div className="text-2xl font-bold text-white drop-shadow-md">{record.actual_duration}分</div>
              <div className="text-sm text-indigo-200">实际用时</div>
            </div>
          )}
        </div>
      </div>

      {/* 备注卡片 */}
      {record.notes && (
        <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-400/30">
          <h4 className="font-bold text-white mb-3 drop-shadow-md">📝 今日备注</h4>
          <p className="text-blue-100 leading-relaxed">{record.notes}</p>
        </div>
      )}
    </div>
  )
}

function HistoryView({ records }: { records: DailyRecord[] }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 backdrop-blur-sm rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-400/30 hover:border-blue-400/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-bold text-white drop-shadow-md">{record.date}</div>
                  <div className="text-sm text-blue-200">
                    🕯️ {record.regular_candles} | ✨ {record.seasonal_candles}
                    {record.online_time && ` | 🕐 ${record.online_time}`}
                    {record.actual_duration && ` | ⏱️ ${record.actual_duration}分`}
                  </div>
                </div>
              </div>
              <div className="text-sm text-green-300 font-bold drop-shadow-md">
                {record.regular_candles_comparison}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
