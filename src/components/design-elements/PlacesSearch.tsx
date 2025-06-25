import React, { useState, useEffect, useCallback, useRef } from 'react'
import searchIcon from '/icons/acn/search-normal.svg'

interface PlacePrediction {
    place_id: string
    description: string
}

interface PlaceDetails {
    name: string
    formatted_address: string
    geometry: {
        location: {
            lat: () => number
            lng: () => number
        }
    }
    url: string
}

interface Places {
    name: string
    lat: number
    lng: number
    address: string
    mapLocation: string
}

interface PlacesSearchProps {
    selectedPlace: Places | null
    setSelectedPlace: (place: Places | null) => void
    placeholder?: string
    label?: string
    required?: boolean
    className?: string
    disabled?: boolean
    error?: string
}

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY_HERE'

/**
 * Dynamically loads the Google Maps JavaScript API.
 */
const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            return resolve()
        }
        const existingScript = document.getElementById('google-maps-script')
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve())
            existingScript.addEventListener('error', (e) => reject(e))
            return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`
        script.id = 'google-maps-script'
        script.onload = () => resolve()
        script.onerror = (e) => reject(e)
        document.head.appendChild(script)
    })
}

/**
 * PlacesSearch Component
 *
 * A reusable component that provides Google Places API integration for location search.
 * Features:
 * - Debounced search with 500ms delay
 * - Location restriction to India
 * - Auto-complete suggestions
 * - Place details fetching
 * - Error handling and loading states
 * - Click outside to close
 * - Clear functionality
 *
 * Usage:
 * ```tsx
 * const [selectedPlace, setSelectedPlace] = useState<Places | null>(null)
 *
 * <PlacesSearch
 *   selectedPlace={selectedPlace}
 *   setSelectedPlace={setSelectedPlace}
 *   placeholder="Search for location..."
 *   label="Location"
 *   required={true}
 * />
 * ```
 *
 * Required Environment Variable:
 * - VITE_GOOGLE_PLACES_API_KEY: Your Google Places API key
 */
const PlacesSearch: React.FC<PlacesSearchProps> = ({
    selectedPlace,
    setSelectedPlace,
    placeholder = 'Search location...',
    label = 'Location',
    required = false,
    className = '',
    disabled = false,
    error,
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<PlacePrediction[]>([])
    const [showResults, setShowResults] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [userInitiatedSearch, setUserInitiatedSearch] = useState(false)
    const [blurredAndNotSelected, setBlurredAndNotSelected] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    const autocompleteService = useRef<google.maps.places.AutocompleteSuggestion | null>(null)
    const placesService = useRef<google.maps.places.Place | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            setApiError('API Key is missing. Please add VITE_GOOGLE_PLACES_API_KEY to your .env file.')
            return
        }

        // Add a small delay to ensure DOM is ready
        const initializeGoogleMaps = () => {
            loadGoogleMapsScript()
                .then(() => {
                    // Add a small delay to ensure Google Maps is fully initialized
                    setTimeout(() => {
                        if (window.google && window.google.maps && window.google.maps.places) {
                            autocompleteService.current = new window.google.maps.places.AutocompleteSuggestion()
                            placesService.current = new window.google.maps.places.Place(document.createElement('div'))
                            console.log('✅ Google Maps services initialized')
                        } else {
                            setApiError('Google Maps Places API not available')
                        }
                    }, 100)
                })
                .catch((error) => {
                    console.error('Google Maps loading error:', error)
                    setApiError(
                        'Failed to load Google Maps script. Check the browser console and Network tab for more details.',
                    )
                })
        }

        // Initialize immediately if DOM is ready, otherwise wait
        if (document.readyState === 'complete') {
            initializeGoogleMaps()
        } else {
            window.addEventListener('load', initializeGoogleMaps)
            return () => window.removeEventListener('load', initializeGoogleMaps)
        }
    }, [])

    useEffect(() => {
        if (selectedPlace && selectedPlace.name && !userInitiatedSearch) {
            console.log('🔄 PlacesSearch syncing with selectedPlace prop:', selectedPlace.name)
            setSearchQuery(selectedPlace.name)
            setBlurredAndNotSelected(false)
        } else if (!selectedPlace && !userInitiatedSearch) {
            console.log('🔄 PlacesSearch clearing query - no selectedPlace')
            setSearchQuery('')
        }
    }, [selectedPlace, userInitiatedSearch])

    const searchLocations = useCallback((query: string) => {
        if (!query.trim() || !autocompleteService.current) {
            setSearchResults([])
            return
        }

        setIsLoading(true)
        autocompleteService.current.placePrediction(
            {
                input: query,
                componentRestrictions: { country: 'in' },
            },
            (predictions, status) => {
                setIsLoading(false)
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSearchResults(predictions)
                } else if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    setApiError(`Places API error: ${status}`)
                } else {
                    setSearchResults([])
                }
            },
        )
    }, [])

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery && userInitiatedSearch) {
                searchLocations(searchQuery)
            }
        }, 500)
        return () => clearTimeout(handler)
    }, [searchQuery, searchLocations, userInitiatedSearch])

    const getPlaceDetails = useCallback((placeId: string): Promise<Places | null> => {
        return new Promise((resolve) => {
            if (!placesService.current) return resolve(null)

            placesService.current.getDetails(
                {
                    placeId,
                    fields: ['name', 'formatted_address', 'geometry', 'url'],
                },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                        resolve({
                            name: place.name || '',
                            address: place.formatted_address || '',
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                            mapLocation: place.url || '',
                        })
                    } else {
                        setApiError(`Failed to fetch place details: ${status}`)
                        resolve(null)
                    }
                },
            )
        })
    }, [])

    const handleSelectPlace = useCallback(
        async (place: PlacePrediction) => {
            setIsLoading(true)
            const details = await getPlaceDetails(place.place_id)
            if (details) {
                setSelectedPlace(details)
                setSearchQuery(details.name)
            }
            console.log(details)
            setIsLoading(false)
            setShowResults(false)
            setUserInitiatedSearch(false)
        },
        [getPlaceDetails, setSelectedPlace],
    )

    const handleSearchInputChange = (text: string) => {
        setSearchQuery(text)
        setUserInitiatedSearch(true)
        setSelectedPlace(null)
        setBlurredAndNotSelected(false)
        if (text.trim()) {
            setShowResults(true)
        } else {
            setSearchResults([])
            setShowResults(false)
        }
    }

    const handleClearSearch = useCallback(() => {
        setSearchQuery('')
        setSelectedPlace(null)
        setSearchResults([])
        setShowResults(false)
        setUserInitiatedSearch(false)
        setBlurredAndNotSelected(false)
    }, [setSelectedPlace])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowResults(false)
                if (!selectedPlace) setBlurredAndNotSelected(true)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [selectedPlace])

    const hasError = error || apiError || (blurredAndNotSelected && required)

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <label className='block text-sm py-2'>
                {label} {required && <span className='text-red-500'>*</span>}
            </label>
            <div className='relative'>
                <div
                    className={`flex items-center border-2 rounded-[5px] px-3 py-2 bg-[#FAFAFA] ${
                        hasError ? 'border-red-500' : 'border-[#E3E3E3]'
                    } focus-within:border-blue-500 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <img src={searchIcon} alt='search' className='w-4 h-4 mr-2' />
                    <input
                        type='text'
                        className='flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed'
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        onFocus={() => {
                            if (searchQuery) setShowResults(true)
                        }}
                        disabled={disabled}
                    />
                    {isLoading ? (
                        <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                    ) : searchQuery && !disabled ? (
                        <button
                            onClick={handleClearSearch}
                            className='w-4 h-4 text-gray-400 hover:text-gray-600 flex items-center justify-center'
                        >
                            ✕
                        </button>
                    ) : null}
                </div>

                {hasError && (
                    <div className='mt-1 text-sm text-red-500'>{error || apiError || 'This field is required'}</div>
                )}

                {showResults && searchResults.length > 0 && (
                    <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-50'>
                        {searchResults.map((item) => (
                            <button
                                key={item.place_id}
                                className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0'
                                onClick={() => handleSelectPlace(item)}
                            >
                                {item.description}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PlacesSearch
