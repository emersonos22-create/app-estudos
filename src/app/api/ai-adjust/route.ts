import { NextRequest, NextResponse } from 'next/server'
import { getStudyPlanAdjustments, BehaviorData } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const data: BehaviorData = await request.json()
    
    const adjustments = await getStudyPlanAdjustments(data)
    
    return NextResponse.json(adjustments)
  } catch (error) {
    console.error('Erro na API de ajustes:', error)
    return NextResponse.json(
      { error: 'Erro ao processar ajustes' },
      { status: 500 }
    )
  }
}
