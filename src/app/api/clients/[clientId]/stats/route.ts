import { NextResponse } from 'next/server'
import { recordsApi, DailyRecord } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{
    clientId: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { clientId } = await params

    const records = await recordsApi.getByClientId(clientId)

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalRecords: 0,
          totalCandles: 0,
          totalSeasonalCandles: 0,
          totalHours: 0,
          avgCandles: 0,
          avgSeasonalCandles: 0,
          avgHours: 0
        }
      })
    }

    // 计算统计数据
    const totalRecords = records.length
    const totalCandles = records.reduce((sum, record) => sum + record.regular_candles, 0)
    const totalSeasonalCandles = records.reduce((sum, record) => sum + record.seasonal_candles, 0)
    const totalHours = records.reduce((sum, record) => sum + (record.actual_duration || 0), 0)
    const avgCandles = Math.round(totalCandles / totalRecords)
    const avgSeasonalCandles = Math.round(totalSeasonalCandles / totalRecords)
    const avgHours = parseFloat((totalHours / totalRecords).toFixed(1))

    // 最近7天的趋势
    const last7Days = records.slice(0, 7)
    const trend = last7Days.map(record => ({
      date: record.date,
      regular_candles: record.regular_candles,
      seasonal_candles: record.seasonal_candles,
      actual_duration: record.actual_duration
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalRecords,
        totalCandles,
        totalSeasonalCandles,
        totalHours,
        avgCandles,
        avgSeasonalCandles,
        avgHours,
        trend,
        latestRecord: records[0] || null
      }
    })
  } catch (error) {
    console.error('Failed to fetch client stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client stats' },
      { status: 500 }
    )
  }
}
