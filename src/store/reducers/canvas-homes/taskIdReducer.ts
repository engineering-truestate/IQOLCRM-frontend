import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    taskId: null,
    enquiryId: null,
    leadId: null,
}

const taskIdSlice = createSlice({
    name: 'taskId',
    initialState,
    reducers: {
        setTaskId: (state, action) => {
            state.taskId = action.payload
        },
        setEnquiryId: (state, action) => {
            state.enquiryId = action.payload
        },
        setLeadId: (state, action) => {
            state.leadId = action.payload || null
        },
        clearTaskId: (state) => {
            state.taskId = null
            state.enquiryId = null
            state.leadId = null
        },
    },
})

export const { setTaskId, setEnquiryId, setLeadId, clearTaskId } = taskIdSlice.actions

export default taskIdSlice.reducer
