import { NextResponse } from 'next/server'
import { getRequirements, createRequirement } from '@/lib/api'

// GET /api/requirements proxy to Express API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryParams = searchParams.getAll('category')
    const location = searchParams.get('location') || undefined
    const from = searchParams.get('from') || undefined
    const to = searchParams.get('to') || undefined
    const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'eventDate'

    const data = await getRequirements({
      category: categoryParams.length > 0 ? categoryParams : undefined,
      location,
      from,
      to,
      sort,
    })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch requirements' },
      { status: err.status || 500 }
    )
  }
}

// POST /api/requirements proxy to Express API
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const saved = await createRequirement(body)
    return NextResponse.json(saved, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to save requirement', details: err.details },
      { status: err.status || 422 }
    )
  }
}
