import { NextResponse } from 'next/server'
import { getRequirementById } from '@/lib/api'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requirement = await getRequirementById(id)

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found.' }, { status: 404 })
    }

    return NextResponse.json({ requirement })
  } catch (err: any) {
    console.error('Error fetching requirement by id:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
