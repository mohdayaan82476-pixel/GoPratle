import { NextResponse } from 'next/server'

interface AutocompletePrediction {
  placeId: string
  mainText: string
  secondaryText: string
  description: string
}

// Curated high-fidelity fallback dataset for Indian cities and venues
const FALLBACK_PLACES = [
  // Hyderabad & Telangana
  {
    placeId: 'ChIJx9Lt_qSTyzsRzY48007_4q0',
    mainText: 'Hyderabad',
    secondaryText: 'Telangana, India',
    description: 'Hyderabad, Telangana, India',
    lat: 17.385044,
    lng: 78.486671,
    isVenue: false,
  },
  {
    placeId: 'ChIJ-9QpQyqRyzsRee9Yn07_4q1',
    mainText: 'Hitec City, Hyderabad',
    secondaryText: 'Telangana, India',
    description: 'Hitec City, Hyderabad, Telangana, India',
    lat: 17.4474,
    lng: 78.3762,
    isVenue: false,
  },
  {
    placeId: 'ChIJg_17Q0-TyzsRFs_X491_0q2',
    mainText: 'Secunderabad',
    secondaryText: 'Telangana, India',
    description: 'Secunderabad, Telangana, India',
    lat: 17.4399,
    lng: 78.4983,
    isVenue: false,
  },
  {
    placeId: 'ChIJb7c5x8mRyzsRh_5a891_0q3',
    mainText: 'Gachibowli, Hyderabad',
    secondaryText: 'Telangana, India',
    description: 'Gachibowli, Hyderabad, Telangana, India',
    lat: 17.4401,
    lng: 78.3489,
    isVenue: false,
  },
  {
    placeId: 'ChIJnovotel_hyd_cc_001',
    mainText: 'Novotel Hyderabad Convention Centre',
    secondaryText: 'Hitec City, Hyderabad, Telangana',
    description: 'Novotel Hyderabad Convention Centre, Hitec City, Hyderabad, Telangana',
    lat: 17.4728,
    lng: 78.3729,
    isVenue: true,
  },
  {
    placeId: 'ChIJmarriott_hyd_hotel_002',
    mainText: 'Hyderabad Marriott Hotel & Convention Centre',
    secondaryText: 'Tank Bund Road, Hyderabad, Telangana',
    description: 'Hyderabad Marriott Hotel & Convention Centre, Tank Bund Road, Hyderabad, Telangana',
    lat: 17.4239,
    lng: 78.4851,
    isVenue: true,
  },
  {
    placeId: 'ChIJtaj_krishna_hyd_003',
    mainText: 'Taj Krishna',
    secondaryText: 'Banjara Hills, Hyderabad, Telangana',
    description: 'Taj Krishna, Banjara Hills, Hyderabad, Telangana',
    lat: 17.4168,
    lng: 78.4485,
    isVenue: true,
  },
  {
    placeId: 'ChIJitc_kohenur_hyd_004',
    mainText: 'ITC Kohenur',
    secondaryText: 'Hitec City, Hyderabad, Telangana',
    description: 'ITC Kohenur, Hitec City, Hyderabad, Telangana',
    lat: 17.4359,
    lng: 78.3812,
    isVenue: true,
  },
  // Other Top Metros
  {
    placeId: 'ChIJKEvqqk09wjsR9G9_r-k5_98',
    mainText: 'Bengaluru',
    secondaryText: 'Karnataka, India',
    description: 'Bengaluru, Karnataka, India',
    lat: 12.9716,
    lng: 77.5946,
    isVenue: false,
  },
  {
    placeId: 'ChIJwe1EZFlZwjsRAe2CST61Sis',
    mainText: 'Mumbai',
    secondaryText: 'Maharashtra, India',
    description: 'Mumbai, Maharashtra, India',
    lat: 19.076,
    lng: 72.8777,
    isVenue: false,
  },
  {
    placeId: 'ChIJL_P_CXMEDTkRw0ZiFAILAA8',
    mainText: 'Delhi NCR',
    secondaryText: 'Delhi, India',
    description: 'Delhi NCR, Delhi, India',
    lat: 28.6139,
    lng: 77.209,
    isVenue: false,
  },
  {
    placeId: 'ChIJx20VqKuV-DkR5a_8u321AA0',
    mainText: 'Chennai',
    secondaryText: 'Tamil Nadu, India',
    description: 'Chennai, Tamil Nadu, India',
    lat: 13.0827,
    lng: 80.2707,
    isVenue: false,
  },
  {
    placeId: 'ChIJN_12Qx7R-jkR7f_4u123AA1',
    mainText: 'Kolkata',
    secondaryText: 'West Bengal, India',
    description: 'Kolkata, West Bengal, India',
    lat: 22.5726,
    lng: 88.3639,
    isVenue: false,
  },
  {
    placeId: 'ChIJf_93Q0-TyzsRFs_X491_0q9',
    mainText: 'Pune',
    secondaryText: 'Maharashtra, India',
    description: 'Pune, Maharashtra, India',
    lat: 18.5204,
    lng: 73.8567,
    isVenue: false,
  },
  {
    placeId: 'ChIJz_88Q91WwjsRAe2CST61S02',
    mainText: 'Goa',
    secondaryText: 'India',
    description: 'Goa, India',
    lat: 15.2993,
    lng: 74.124,
    isVenue: false,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const latStr = searchParams.get('lat')
  const lngStr = searchParams.get('lng')

  if (q.length < 2) {
    return NextResponse.json({ predictions: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  // If a real Google Places API key is configured and not the placeholder, call Google Places API (New)
  if (apiKey && apiKey !== 'your_google_places_api_key_here') {
    try {
      const payload: Record<string, unknown> = {
        input: q,
        includedRegionCodes: ['IN'],
      }

      // 25km location bias if center coordinates are provided
      if (latStr && lngStr) {
        const lat = parseFloat(latStr)
        const lng = parseFloat(lngStr)
        if (!isNaN(lat) && !isNaN(lng)) {
          payload.locationBias = {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 25000.0, // 25,000 meters = 25km
            },
          }
        }
      }

      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json() as {
          suggestions?: Array<{
            placePrediction?: {
              place?: string
              placeId?: string
              text?: { text?: string }
              structuredFormat?: {
                mainText?: { text?: string }
                secondaryText?: { text?: string }
              }
            }
          }>
        }

        const predictions: AutocompletePrediction[] = (data.suggestions || [])
          .slice(0, 6)
          .map(s => {
            const pred = s.placePrediction
            const rawId = pred?.placeId || (pred?.place ? pred.place.replace(/^places\//, '') : '')
            const mainText = pred?.structuredFormat?.mainText?.text || pred?.text?.text || q
            const secondaryText = pred?.structuredFormat?.secondaryText?.text || ''
            const description = pred?.text?.text || `${mainText}${secondaryText ? `, ${secondaryText}` : ''}`
            return {
              placeId: rawId,
              mainText,
              secondaryText,
              description,
            }
          })
          .filter(p => p.placeId)

        if (predictions.length > 0) {
          return NextResponse.json({ predictions, source: 'google' })
        }
      } else {
        console.warn(`[Google Places] Autocomplete responded with HTTP ${res.status}. Falling back to internal directory.`)
      }
    } catch (err) {
      console.warn('[Google Places] Autocomplete request failed:', err)
    }
  }

  // Fallback / offline match for high reliability
  const queryLower = q.toLowerCase()
  const matched = FALLBACK_PLACES.filter(p =>
    p.mainText.toLowerCase().includes(queryLower) ||
    p.secondaryText.toLowerCase().includes(queryLower) ||
    p.description.toLowerCase().includes(queryLower)
  ).slice(0, 6)

  const predictions: AutocompletePrediction[] = matched.map(m => ({
    placeId: m.placeId,
    mainText: m.mainText,
    secondaryText: m.secondaryText,
    description: m.description,
  }))

  return NextResponse.json({
    predictions,
    source: apiKey && apiKey !== 'your_google_places_api_key_here' ? 'fallback' : 'internal',
  })
}
