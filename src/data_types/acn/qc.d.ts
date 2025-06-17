export interface QCInventoryState {
    qcProperty: any // TODO: Replace with proper type when full shape is known
    loading: boolean
    error: string | null
}

// Note: This is a partial interface. The actual data shape has more properties.
export interface IQCInventory {
    [key: string]: any
}
