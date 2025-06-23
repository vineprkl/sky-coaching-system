'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: string
  name: string
  avatar: string
  created_at: string
}

interface DailyRecord {
  id: string
  client_id: string
  date: string
  regular_candles: number
  regular_candles_comparison: string
  seasonal_candles: number
  online_time?: string
  actual_duration?: number
  notes: string
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'clients'>('add')

  // 表单状态
  const [formData, setFormData] = useState<{
    date: string
    regular_candles: string
    seasonal_candles: string
    online_time: string
    actual_duration: string
    notes: string
  }>({
    date: new Date().toISOString().split('T')[0],
    regular_candles: '',
    seasonal_candles: '',
    online_time: '',
    actual_duration: '',
    notes: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      fetchRecords(selectedClientId)
    }
  }, [selectedClientId])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const result = await response.json() as { success: boolean; data: Client[] }
      if (result.success) {
        setClients(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchRecords = async (clientId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clients/${clientId}/records`)
      const result = await response.json() as { success: boolean; data: DailyRecord[] }
      if (result.success) {
        setRecords(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClientId) {
      alert('请选择客户')
      return
    }

    try {
      const response = await fetch(`/api/clients/${selectedClientId}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json() as { success: boolean; data: { regular_candles_comparison: string } }
      if (result.success) {
        // 显示成功消息，包含自动计算的对比值
        const comparison = result.data.regular_candles_comparison
        alert(`✅ 数据添加成功！\n对比值已自动计算：${comparison}`)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          regular_candles: '',
          seasonal_candles: '',
          online_time: '',
          actual_duration: '',
          notes: ''
        })
        fetchRecords(selectedClientId)
      }
    } catch (error) {
      console.error('Failed to add record:', error)
      alert('添加失败，请重试')
    }
  }

  const handleCopyAllData = async () => {
    try {
      // 获取所有客户的当天记录
      const allData: string[] = []
      const today = new Date().toISOString().split('T')[0]

      allData.push(`📊 Sky代练服务 - 当天数据汇总`)
      allData.push(`📅 日期：${today}`)
      allData.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      allData.push('')

      let hasAnyData = false

      for (const client of clients) {
        try {
          const response = await fetch(`/api/clients/${client.id}/records`)
          const result = await response.json() as { success: boolean; data: DailyRecord[] }

          if (result.success && result.data.length > 0) {
            // 查找当天的记录
            const todayRecord = result.data.find((record: DailyRecord) => record.date === today)

            if (todayRecord) {
              hasAnyData = true
              allData.push(`👤 ${client.avatar} ${client.name}`)
              allData.push(`🕯️ 普通蜡烛：${todayRecord.regular_candles} (${todayRecord.regular_candles_comparison})`)
              allData.push(`✨ 季节蜡烛：${todayRecord.seasonal_candles}`)
              allData.push(`🕐 上线时间：${todayRecord.online_time || '未记录'}`)
              allData.push(`⏱️ 实际用时：${todayRecord.actual_duration ? `${todayRecord.actual_duration}分钟` : '未记录'}`)
              allData.push(`📝 备注：${todayRecord.notes || '无'}`)
              allData.push('')
            } else {
              allData.push(`👤 ${client.avatar} ${client.name}`)
              allData.push(`📅 当天暂无记录`)
              allData.push('')
            }
          } else {
            allData.push(`👤 ${client.avatar} ${client.name}`)
            allData.push(`📅 当天暂无记录`)
            allData.push('')
          }
        } catch (error) {
          console.error(`Failed to fetch records for ${client.name}:`, error)
          allData.push(`👤 ${client.avatar} ${client.name}`)
          allData.push(`❌ 数据获取失败`)
          allData.push('')
        }
      }

      allData.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      allData.push(`📊 统计信息：`)
      allData.push(`👥 总客户数：${clients.length}`)
      allData.push(`📅 生成时间：${new Date().toLocaleString('zh-CN')}`)

      if (!hasAnyData) {
        allData.push(`⚠️ 当天暂无任何代练记录`)
      }

      const copyText = allData.join('\n')

      await navigator.clipboard.writeText(copyText)
      alert('✅ 当天所有用户数据已复制到剪贴板！')
    } catch (error) {
      console.error('Failed to copy all data:', error)
      alert('❌ 复制失败，请重试')
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 drop-shadow-lg">✨ 管理后台 ✨</h1>
            <p className="text-blue-100 font-medium drop-shadow-md">Sky 代练服务数据管理系统</p>
          </div>
          <button
            onClick={handleCopyAllData}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-bold shadow-lg"
          >
            📋 复制当天所有数据
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex bg-gradient-to-r from-slate-800/90 to-purple-900/80 rounded-lg p-1 mb-8 max-w-2xl shadow-xl border border-purple-400/30">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === 'add'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-blue-200 hover:text-white font-medium'
              }`}
          >
            数据录入
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === 'manage'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-blue-200 hover:text-white font-medium'
              }`}
          >
            数据管理
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${activeTab === 'clients'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'text-blue-200 hover:text-white font-medium'
              }`}
          >
            客户管理
          </button>
        </div>

        {/* 客户选择 */}
        <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl mb-8 border border-purple-400/30">
          <label className="block text-sm font-bold text-white mb-2 drop-shadow-md">
            选择客户
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white placeholder-gray-300"
          >
            <option value="">请选择客户...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.avatar} {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* 数据统计卡片 */}
        {selectedClientId && records.length > 0 && (
          <StatisticsCard records={records} />
        )}

        {/* 内容区域 */}
        {activeTab === 'add' ? (
          <AddRecordForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            disabled={!selectedClientId}
          />
        ) : activeTab === 'manage' ? (
          <ManageRecords
            records={records}
            loading={loading}
            selectedClientId={selectedClientId}
          />
        ) : (
          <ClientManagement
            clients={clients}
            onRefresh={fetchClients}
          />
        )}
      </div>
    </div>
  )
}

interface FormData {
  date: string
  regular_candles: string
  seasonal_candles: string
  online_time: string
  actual_duration: string
  notes: string
}

function AddRecordForm({ formData, setFormData, onSubmit, disabled }: {
  formData: FormData
  setFormData: (data: FormData) => void
  onSubmit: (e: React.FormEvent) => void
  disabled: boolean
}) {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl border border-purple-400/30">
      <h2 className="text-xl font-bold text-white mb-6 drop-shadow-md">✨ 添加每日数据</h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-white mb-2 drop-shadow-md">
              📅 日期
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2 drop-shadow-md">
              🕯️ 普通蜡烛数量
            </label>
            <input
              type="number"
              value={formData.regular_candles}
              onChange={(e) => setFormData({ ...formData, regular_candles: e.target.value })}
              className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white placeholder-gray-300"
              required
            />
          </div>

          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-400/30">
            <p className="text-sm text-blue-200">
              💡 <strong className="text-white">对比值自动计算</strong><br />
              系统会自动对比前一天的普通蜡烛数量并显示差值
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2 drop-shadow-md">
              ✨ 季节蜡烛数量
            </label>
            <input
              type="number"
              value={formData.seasonal_candles}
              onChange={(e) => setFormData({ ...formData, seasonal_candles: e.target.value })}
              className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white placeholder-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2 drop-shadow-md">
              🕐 上线时间
            </label>
            <input
              type="time"
              value={formData.online_time}
              onChange={(e) => setFormData({ ...formData, online_time: e.target.value })}
              className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2 drop-shadow-md">
              ⏱️ 实际用时 (分钟)
            </label>
            <input
              type="number"
              value={formData.actual_duration}
              onChange={(e) => setFormData({ ...formData, actual_duration: e.target.value })}
              className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white placeholder-gray-300"
              placeholder="例如: 45"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-2 drop-shadow-md">
            📝 备注
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white placeholder-gray-300"
            placeholder="今日代练情况备注..."
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg"
        >
          添加记录
        </button>
      </form>
    </div>
  )
}

function ManageRecords({ records, loading, selectedClientId }: {
  records: DailyRecord[],
  loading: boolean,
  selectedClientId: string
}) {
  const handleCopyToday = (record: DailyRecord) => {
    const today = new Date().toISOString().split('T')[0]
    const copyText = `📅 ${today}
🕯️ 普通蜡烛：${record.regular_candles} (${record.regular_candles_comparison})
✨ 季节蜡烛：${record.seasonal_candles}
🕐 上线时间：${record.online_time || '未记录'}
⏱️ 实际用时：${record.actual_duration ? `${record.actual_duration}分钟` : '未记录'}
📝 备注：${record.notes || '无'}`

    navigator.clipboard.writeText(copyText).then(() => {
      alert('数据已复制到剪贴板！')
    }).catch(() => {
      alert('复制失败，请手动复制')
    })
  }

  const handleDeleteRecord = async (recordId: string, date: string) => {
    if (confirm(`确定要删除 ${date} 的记录吗？`)) {
      try {
        const response = await fetch(`/api/records/${recordId}`, {
          method: 'DELETE',
        })

        const result = await response.json() as { success: boolean }
        if (result.success) {
          alert('记录删除成功！')
          window.location.reload() // 简单的刷新，实际项目中应该更新状态
        }
      } catch (error) {
        console.error('Failed to delete record:', error)
        alert('删除失败，请重试')
      }
    }
  }

  if (!selectedClientId) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl text-center border border-purple-400/30">
        <p className="text-blue-200 font-medium">请先选择客户查看数据</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl text-center border border-purple-400/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl border border-purple-400/30">
      <h2 className="text-xl font-bold text-white mb-6 drop-shadow-md">📊 历史记录管理</h2>

      {records.length === 0 ? (
        <p className="text-blue-200 text-center py-8 font-medium">暂无数据记录</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-purple-400/30">
                <th className="text-left py-3 px-4 text-white font-bold drop-shadow-md">📅 日期</th>
                <th className="text-left py-3 px-4 text-white font-bold drop-shadow-md">🕯️ 普通蜡烛</th>
                <th className="text-left py-3 px-4 text-white font-bold drop-shadow-md">✨ 季节蜡烛</th>
                <th className="text-left py-3 px-4 text-white font-bold drop-shadow-md">🕐 上线时间</th>
                <th className="text-left py-3 px-4 text-white font-bold drop-shadow-md">⏱️ 实际用时</th>
                <th className="text-left py-3 px-4 text-white font-bold drop-shadow-md">📝 备注</th>
                <th className="text-left py-3 px-4 text-white font-bold drop-shadow-md">🛠️ 操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record: DailyRecord) => (
                <tr key={record.id} className="border-b border-purple-400/20 hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4 text-blue-200 font-medium">{record.date}</td>
                  <td className="py-3 px-4 text-blue-200 font-medium">
                    {record.regular_candles}
                    <span className="text-green-300 text-sm ml-2 font-bold drop-shadow-md">
                      {record.regular_candles_comparison}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-blue-200 font-medium">{record.seasonal_candles}</td>
                  <td className="py-3 px-4 text-green-300 font-medium">{record.online_time || '-'}</td>
                  <td className="py-3 px-4 text-indigo-300 font-medium">{record.actual_duration ? `${record.actual_duration}分` : '-'}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-purple-200">{record.notes}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyToday(record)}
                        className="px-2 py-1 bg-blue-500/80 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        title="复制数据"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id, record.date)}
                        className="px-2 py-1 bg-red-500/80 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        title="删除记录"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatisticsCard({ records }: { records: DailyRecord[] }) {
  // 计算统计数据
  const totalRecords = records.length

  if (totalRecords === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl border border-purple-400/30 mb-8">
        <h3 className="text-lg font-bold text-white mb-4 drop-shadow-md">📈 数据统计</h3>
        <p className="text-blue-200 text-center">暂无数据</p>
      </div>
    )
  }

  // 计算普通蜡烛总数
  const totalCandles = records.reduce((sum, record) => sum + Number(record.regular_candles), 0)

  // 计算普通蜡烛平均增长（基于对比值）
  const recordsWithComparison = records.filter(r => r.regular_candles_comparison && r.regular_candles_comparison !== 'NEW')
  const totalGrowth = recordsWithComparison.reduce((sum, record) => {
    const comparison = record.regular_candles_comparison
    const growth = parseInt(comparison.replace('+', '')) || 0
    return sum + growth
  }, 0)
  const avgGrowth = recordsWithComparison.length > 0 ? Math.round(totalGrowth / recordsWithComparison.length) : 0

  // 计算季节蜡烛总数和平均增长
  const totalSeasonalCandles = records.reduce((sum, record) => sum + Number(record.seasonal_candles), 0)
  const avgSeasonalGrowth = Math.round(totalSeasonalCandles / totalRecords)

  // 计算实际用时总数和平均时间
  const totalDuration = records.reduce((sum, record) => sum + Number(record.actual_duration || 0), 0)
  const avgDuration = Math.round(totalDuration / totalRecords)

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl border border-purple-400/30 mb-8">
      <h3 className="text-lg font-bold text-white mb-4 drop-shadow-md">📈 数据统计</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gradient-to-br from-blue-600/80 to-purple-600/80 rounded-lg border border-blue-400/30">
          <div className="text-2xl mb-1 filter drop-shadow-lg">📊</div>
          <div className="text-lg font-bold text-white drop-shadow-md">{totalRecords}</div>
          <div className="text-xs text-blue-200">总记录数</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-yellow-600/80 to-orange-600/80 rounded-lg border border-yellow-400/30">
          <div className="text-2xl mb-1 filter drop-shadow-lg">📈</div>
          <div className="text-lg font-bold text-white drop-shadow-md">{avgGrowth > 0 ? `+${avgGrowth}` : avgGrowth}</div>
          <div className="text-xs text-yellow-200">平均增长</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-purple-600/80 to-pink-600/80 rounded-lg border border-purple-400/30">
          <div className="text-2xl mb-1 filter drop-shadow-lg">✨</div>
          <div className="text-lg font-bold text-white drop-shadow-md">{avgSeasonalGrowth}</div>
          <div className="text-xs text-purple-200">平均季节增长</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-indigo-600/80 to-violet-600/80 rounded-lg border border-indigo-400/30">
          <div className="text-2xl mb-1 filter drop-shadow-lg">⏱️</div>
          <div className="text-lg font-bold text-white drop-shadow-md">{avgDuration}分</div>
          <div className="text-xs text-indigo-200">平均时间</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-blue-200 font-medium drop-shadow-md">
          总计：🕯️ {totalCandles} | ✨ {totalSeasonalCandles} | ⏱️ {totalDuration}分钟
        </p>
      </div>
    </div>
  )
}

function ClientManagement({ clients, onRefresh }: { clients: Client[], onRefresh: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newClient, setNewClient] = useState<{ name: string; avatar: string }>({ name: '', avatar: '🌟' })

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      })

      const result = await response.json() as { success: boolean }
      if (result.success) {
        alert('客户添加成功！')
        setNewClient({ name: '', avatar: '🌟' })
        setShowAddForm(false)
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to add client:', error)
      alert('添加失败，请重试')
    }
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (confirm(`确定要删除客户 "${clientName}" 吗？这将同时删除该客户的所有记录！`)) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE',
        })

        const result = await response.json() as { success: boolean }
        if (result.success) {
          alert('客户删除成功！')
          onRefresh()
        }
      } catch (error) {
        console.error('Failed to delete client:', error)
        alert('删除失败，请重试')
      }
    }
  }

  const emojiOptions = ['🌟', '🌙', '☁️', '🌈', '❄️', '🔥', '💎', '🌸', '🍀', '⭐', '🌺', '🦋']

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 rounded-lg p-6 shadow-xl border border-purple-400/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white drop-shadow-md">👥 客户管理</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 transition-all font-medium"
        >
          {showAddForm ? '取消' : '+ 添加客户'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-purple-400/20">
          <h3 className="text-lg font-bold text-white mb-4">添加新客户</h3>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">客户名称</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white"
                  placeholder="请输入客户名称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">头像</label>
                <select
                  value={newClient.avatar}
                  onChange={(e) => setNewClient({ ...newClient, avatar: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-400/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700/80 text-white"
                >
                  {emojiOptions.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji} {emoji}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 transition-all font-bold"
            >
              添加客户
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-slate-700/50 rounded-lg p-4 border border-purple-400/20 hover:border-purple-400/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{client.avatar}</div>
                <div>
                  <div className="font-bold text-white">{client.name}</div>
                  <div className="text-xs text-blue-200">
                    创建于 {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteClient(client.id, client.name)}
                className="px-3 py-1 bg-red-500/80 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-blue-200">暂无客户，点击上方按钮添加第一个客户</p>
        </div>
      )}
    </div>
  )
}
