import { NextResponse } from 'next/server'
import { recordsApi } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minCandles = searchParams.get('minCandles')
    const maxCandles = searchParams.get('maxCandles')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    let records = await recordsApi.getByClientId(clientId)

    // 按日期范围筛选
    if (startDate && endDate) {
      records = records.filter(record =>
        record.date >= startDate && record.date <= endDate
      )
    }

    // 按蜡烛数量筛选
    if (minCandles) {
      records = records.filter(record =>
        record.regular_candles >= parseInt(minCandles)
      )
    }

    if (maxCandles) {
      records = records.filter(record =>
        record.regular_candles <= parseInt(maxCandles)
      )
    }

    return NextResponse.json({
      success: true,
      data: records
    })
  } catch (error) {
    console.error('Failed to search records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search records' },
      { status: 500 }
    )
  }
}
