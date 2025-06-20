import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface PlatformState {
    selectedPlatform: string
    googlePlacesApiKey: string
}

const initialState: PlatformState = {
    selectedPlatform: 'truestate', // Default platform
    googlePlacesApiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY_HERE',
}

const platformSlice = createSlice({
    name: 'platform',
    initialState,
    reducers: {
        setSelectedPlatform: (state, action: PayloadAction<string>) => {
            state.selectedPlatform = action.payload
        },
        initializePlatform: (state, action: PayloadAction<string>) => {
            state.selectedPlatform = action.payload
        },
        setGooglePlacesApiKey: (state, action: PayloadAction<string>) => {
            state.googlePlacesApiKey = action.payload
        },
    },
})

export const { setSelectedPlatform, initializePlatform, setGooglePlacesApiKey } = platformSlice.actions
export default platformSlice.reducer
