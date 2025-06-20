import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    taskId: null,
    enquiryId: null,
    leadId: null,
    taskState: null,
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
        setTaskState: (state, action) => {
            state.taskState = action.payload || null
        },
        clearTaskId: (state) => {
            state.taskId = null
            state.enquiryId = null
            state.leadId = null
            state.taskState = null
        },
    },
})

export const { setTaskId, setEnquiryId, setLeadId, clearTaskId, setTaskState } = taskIdSlice.actions

export default taskIdSlice.reducer
