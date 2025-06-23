'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  avatar: string
  created_at: string
}

export default function ClientSelector() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const result = await response.json()
      if (result.success) {
        setClients(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClientSelect = (clientId: string) => {
    router.push(`/dashboard/${clientId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 标题区域 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          ✨ Sky 代练服务 ✨
        </h1>
        <p className="text-lg text-blue-100 font-medium drop-shadow-md">
          选择你的专属账户查看代练进度
        </p>
      </div>

      {/* 客户选择网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl px-4">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => handleClientSelect(client.id)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-purple-400/30 transition-all duration-300 hover:border-blue-400/50 hover:bg-gradient-to-br hover:from-slate-700/90 hover:to-purple-800/80 aspect-square flex flex-col items-center justify-center">
              {/* 头像 */}
              <div className="text-7xl mb-6 text-center group-hover:animate-bounce filter drop-shadow-lg">
                {client.avatar}
              </div>

              {/* 名称 */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors drop-shadow-md">
                  {client.name}
                </h3>
              </div>
            </div>
          </div>
        ))}

        {/* 添加新客户按钮 - 仅在管理后台显示，用户前端隐藏 */}
      </div>

      {/* 底部装饰 */}
      <div className="mt-16 text-center text-blue-200/80 text-sm font-medium drop-shadow-md">
        <p>🌟 专业的《光·遇》代练服务 🌟</p>
      </div>
    </div>
  )
}
