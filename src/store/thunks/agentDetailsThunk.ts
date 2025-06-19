import { createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAgentDetailsStart, fetchAgentDetailsSuccess, fetchAgentDetailsFailure } from '../slices/agentDetailsSlice'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

interface FetchAgentDetailsParams {
    agentId: string
}

export const fetchAgentInfo = createAsyncThunk(
    'agentDetails/fetchAgentInfo',
    async ({ agentId }: FetchAgentDetailsParams, { dispatch }) => {
        try {
            dispatch(fetchAgentDetailsStart())

            // Fetch agent details from Firebase
            const agentsRef = collection(db, 'agents')
            const agentQuery = query(agentsRef, where('cpId', '==', agentId))
            const agentSnapshot = await getDocs(agentQuery)

            if (agentSnapshot.empty) {
                throw new Error('Agent not found')
            }

            const agentData = agentSnapshot.docs[0].data()
            const agentDetails = {
                id: agentSnapshot.docs[0].id,
                name: agentData.name || '',
                email: agentData.email || '',
                phone: agentData.phone || '',
                status: agentData.status || '',
                createdAt: agentData.createdAt || Date.now(),
                updatedAt: agentData.updatedAt || Date.now(),
            }

            dispatch(fetchAgentDetailsSuccess(agentDetails))
            return agentDetails
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch agent details'
            dispatch(fetchAgentDetailsFailure(errorMessage))
            throw error
        }
    },
)
