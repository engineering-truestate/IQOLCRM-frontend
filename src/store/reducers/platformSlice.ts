import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface PlatformState {
    selectedPlatform: string
}

const initialState: PlatformState = {
    selectedPlatform: 'truestate', // Default platform
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
    },
})

export const { setSelectedPlatform, initializePlatform } = platformSlice.actions
export default platformSlice.reducer
