import React, { useState } from 'react'
import PlacesSearch from '../design-elements/PlacesSearch'

interface Places {
    name: string
    lat: number
    lng: number
    address: string
    mapLocation: string
}

/**
 * Example usage of PlacesSearch component
 * This file demonstrates different ways to use the PlacesSearch component
 */
const PlacesSearchExample: React.FC = () => {
    const [selectedPlace, setSelectedPlace] = useState<Places | null>(null)
    const [selectedOffice, setSelectedOffice] = useState<Places | null>(null)
    const [selectedLandmark, setSelectedLandmark] = useState<Places | null>(null)

    const handleSubmit = () => {
        console.log('Selected Place:', selectedPlace)
        console.log('Selected Office:', selectedOffice)
        console.log('Selected Landmark:', selectedLandmark)
    }

    return (
        <div className='p-6 max-w-2xl mx-auto space-y-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-6'>PlacesSearch Component Examples</h1>

            {/* Basic Usage */}
            <div className='bg-white p-4 rounded-lg border'>
                <h2 className='text-lg font-semibold mb-4'>Basic Usage</h2>
                <PlacesSearch
                    selectedPlace={selectedPlace}
                    setSelectedPlace={setSelectedPlace}
                    placeholder='Search for a location...'
                    label='Location'
                    required={true}
                />
                {selectedPlace && (
                    <div className='mt-2 p-2 bg-gray-50 rounded text-sm'>
                        <strong>Selected:</strong> {selectedPlace.name}
                        <br />
                        <strong>Address:</strong> {selectedPlace.address}
                        <br />
                        <strong>Coordinates:</strong> {selectedPlace.lat}, {selectedPlace.lng}
                    </div>
                )}
            </div>

            {/* Office Location */}
            <div className='bg-white p-4 rounded-lg border'>
                <h2 className='text-lg font-semibold mb-4'>Office Location</h2>
                <PlacesSearch
                    selectedPlace={selectedOffice}
                    setSelectedPlace={setSelectedOffice}
                    placeholder='Search for office location...'
                    label='Office Address'
                    required={false}
                />
            </div>

            {/* Nearby Landmark */}
            <div className='bg-white p-4 rounded-lg border'>
                <h2 className='text-lg font-semibold mb-4'>Nearby Landmark</h2>
                <PlacesSearch
                    selectedPlace={selectedLandmark}
                    setSelectedPlace={setSelectedLandmark}
                    placeholder='Search for nearby landmark...'
                    label='Nearby Landmark'
                    required={true}
                />
            </div>

            {/* Disabled State */}
            <div className='bg-white p-4 rounded-lg border'>
                <h2 className='text-lg font-semibold mb-4'>Disabled State</h2>
                <PlacesSearch
                    selectedPlace={null}
                    setSelectedPlace={() => {}}
                    placeholder='This is disabled...'
                    label='Disabled Field'
                    disabled={true}
                />
            </div>

            {/* With Error */}
            <div className='bg-white p-4 rounded-lg border'>
                <h2 className='text-lg font-semibold mb-4'>With Error</h2>
                <PlacesSearch
                    selectedPlace={null}
                    setSelectedPlace={() => {}}
                    placeholder='This has an error...'
                    label='Error Field'
                    error='This field has an error message'
                />
            </div>

            {/* Submit Button */}
            <div className='flex justify-end'>
                <button
                    onClick={handleSubmit}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                    Submit
                </button>
            </div>

            {/* Instructions */}
            <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <h3 className='text-lg font-semibold text-blue-900 mb-2'>Setup Instructions</h3>
                <ol className='list-decimal list-inside space-y-1 text-sm text-blue-800'>
                    <li>Add your Google Places API key to your .env file:</li>
                    <li className='ml-4 font-mono bg-blue-100 px-2 py-1 rounded'>
                        VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
                    </li>
                    <li>Import the PlacesSearch component</li>
                    <li>Create state for selected place</li>
                    <li>Use the component with required props</li>
                </ol>
            </div>
        </div>
    )
}

export default PlacesSearchExample
