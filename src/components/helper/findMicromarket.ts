import * as turf from '@turf/turf'

import rawGeojson from './micromarket.json'
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson'

interface Places {
    name: string
    lat: number
    lng: number
    address: string
    mapLocation: string
}

const geojson = rawGeojson as FeatureCollection

/**
 * Find the micromarket based on a lat/lng point and GeoJSON data
 * @param selectedPlace - Object with lat and lng coordinates
 * @returns Micromarket name or null if not found
 */
export function getMicromarketFromCoordinates(selectedPlace: Places): [string | null, string | null] {
    if (!selectedPlace.lng || !selectedPlace.lat) {
        return [null, null]
    }

    const point = turf.point([selectedPlace.lng || 0, selectedPlace.lat || 0])

    for (const feature of geojson.features) {
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            if (turf.booleanPointInPolygon(point, feature as Feature<Polygon | MultiPolygon>)) {
                let micromarket: string
                if (feature.properties?.Name === feature.properties?.Micromarket) {
                    micromarket = feature.properties?.Name
                } else {
                    micromarket = `${feature.properties?.Name}, ${feature.properties?.Micromarket}`
                }
                return [micromarket || null, feature.properties?.Zone || null]
            }
        }
    }

    return [null, null]
}
