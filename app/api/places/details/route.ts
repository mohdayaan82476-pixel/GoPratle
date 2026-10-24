import { NextResponse } from 'next/server'

const FALLBACK_DETAILS: Record<string, { name: string; address: string; lat: number; lng: number }> = {
  'ChIJx9Lt_qSTyzsRzY48007_4q0': {
    name: 'Hyderabad, Telangana, India',
    address: 'Hyderabad, Telangana, India',
    lat: 17.385044,
    lng: 78.486671,
  },
  'ChIJ-9QpQyqRyzsRee9Yn07_4q1': {
    name: 'Hitec City, Hyderabad',
    address: 'Hitec City, Hyderabad, Telangana, India',
    lat: 17.4474,
    lng: 78.3762,
  },
  'ChIJg_17Q0-TyzsRFs_X491_0q2': {
    name: 'Secunderabad',
    address: 'Secunderabad, Telangana, India',
    lat: 17.4399,
    lng: 78.4983,
  },
  'ChIJb7c5x8mRyzsRh_5a891_0q3': {
    name: 'Gachibowli, Hyderabad',
    address: 'Gachibowli, Hyderabad, Telangana, India',
    lat: 17.4401,
    lng: 78.3489,
  },
  'ChIJnovotel_hyd_cc_001': {
    name: 'Novotel Hyderabad Convention Centre',
    address: 'Near Hitec City, P.O. Bag 1101, Cyberabad Post Office, Hyderabad, Telangana 500081',
    lat: 17.4728,
    lng: 78.3729,
  },
  'ChIJmarriott_hyd_hotel_002': {
    name: 'Hyderabad Marriott Hotel & Convention Centre',
    address: 'Tank Bund Rd, Opposite Hussain Sagar Lake, Hyderabad, Telangana 500080',
    lat: 17.4239,
    lng: 78.4851,
  },
  'ChIJtaj_krishna_hyd_003': {
    name: 'Taj Krishna',
    address: 'Rd Number 1, Mada Manzil, Banjara Hills, Hyderabad, Telangana 500034',
    lat: 17.4168,
    lng: 78.4485,
  },
  'ChIJitc_kohenur_hyd_004': {
    name: 'ITC Kohenur',
    address: 'Plot No. 5, Survey No. 83/1, Hyderabad Knowledge City, Madhapur, Hyderabad 500081',
    lat: 17.4359,
    lng: 78.3812,
  },
  'ChIJKEvqqk09wjsR9G9_r-k5_98': {
    name: 'Bengaluru, Karnataka, India',
    address: 'Bengaluru, Karnataka, India',
    lat: 12.9716,
    lng: 77.5946,
  },
  'ChIJwe1EZFlZwjsRAe2CST61Sis': {
    name: 'Mumbai, Maharashtra, India',
    address: 'Mumbai, Maharashtra, India',
    lat: 19.076,
    lng: 72.8777,
  },
  'ChIJL_P_CXMEDTkRw0ZiFAILAA8': {
    name: 'Delhi NCR, Delhi, India',
    address: 'Delhi NCR, Delhi, India',
    lat: 28.6139,
    lng: 77.209,
  },
  'ChIJx20VqKuV-DkR5a_8u321AA0': {
    name: 'Chennai, Tamil Nadu, India',
    address: 'Chennai, Tamil Nadu, India',
    lat: 13.0827,
    lng: 80.2707,
  },
  'ChIJN_12Qx7R-jkR7f_4u123AA1': {
    name: 'Kolkata, West Bengal, India',
    address: 'Kolkata, West Bengal, India',
    lat: 22.5726,
    lng: 88.3639,
  },
  'ChIJf_93Q0-TyzsRFs_X491_0q9': {
    name: 'Pune, Maharashtra, India',
    address: 'Pune, Maharashtra, India',
    lat: 18.5204,
    lng: 73.8567,
  },
  'ChIJz_88Q91WwjsRAe2CST61S02': {
    name: 'Goa, India',
    address: 'Goa, India',
    lat: 15.2993,
    lng: 74.124,
  },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')?.trim()

  if (!placeId) {
    return NextResponse.json({ message: 'Missing placeId parameter.' }, { status: 400 })
  }

  const cleanId = placeId.replace(/^places\//, '')
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  // If a real Google Places API key is configured and not the placeholder, call Google Places API (New) Place Details
  if (apiKey && apiKey !== 'your_google_places_api_key_here') {
    try {
      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(cleanId)}`
      const res = await fetch(url, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
        },
      })

      if (res.ok) {
        const data = await res.json() as {
          id?: string
          displayName?: { text?: string }
          formattedAddress?: string
          location?: { latitude?: number; longitude?: number }
        }

        const name = data.displayName?.text || data.formattedAddress || 'Selected place'
        return NextResponse.json({
          place: {
            name,
            placeId: data.id || cleanId,
            address: data.formattedAddress || name,
            lat: data.location?.latitude,
            lng: data.location?.longitude,
          },
        })
      }
    } catch (err) {
      console.warn('[Google Places] Details request failed:', err)
    }
  }

  // Fallback / offline match
  const fallback = FALLBACK_DETAILS[cleanId]
  if (fallback) {
    return NextResponse.json({
      place: {
        name: fallback.name,
        placeId: cleanId,
        address: fallback.address,
        lat: fallback.lat,
        lng: fallback.lng,
      },
    })
  }

  // If not in fallback list, return generic valid place object
  return NextResponse.json({
    place: {
      name: cleanId,
      placeId: cleanId,
      address: cleanId,
      unverified: true,
    },
  })
}
