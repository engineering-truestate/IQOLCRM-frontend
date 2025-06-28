// src/pages/dummy_data/restack_resale_dummy_data.ts

// Restack resale data types
export type ListedByType = 'Owner' | 'Broker'
export type AssetType = 'Apartment' | 'Villa' | 'Plot'
export type StatusType = 'Available' | 'Sold Out'

export interface RestackResaleProperty {
    id: string
    projectName: string
    projectId: string
    assetType: AssetType
    inventoryDate: string
    status: StatusType
    listedBy: ListedByType
}

// Extended sample data that matches the UI exactly
export const sampleResaleProperties: RestackResaleProperty[] = [
    {
        id: 'RSL-001',
        projectName: 'Lakeside Residences',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Sold Out',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-002',
        projectName: 'Mountain View Estates',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-003',
        projectName: 'Oceanfront Villas',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-004',
        projectName: 'Riverbend Apartments',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Sold Out',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-005',
        projectName: 'Lakeside Residences',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-006',
        projectName: 'Mountain View Estates',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-007',
        projectName: 'Oceanfront Villas',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-008',
        projectName: 'Riverbend Apartments',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Sold Out',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-009',
        projectName: 'Skyline Towers',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-010',
        projectName: 'Heritage Gardens',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-011',
        projectName: 'Coastal Breeze',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Sold Out',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-012',
        projectName: 'Pine Valley Homes',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-013',
        projectName: 'Metro Square',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-014',
        projectName: 'Golden Gate Residency',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-015',
        projectName: 'Silver Oak Apartments',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    // Additional rows for pagination testing
    {
        id: 'RSL-016',
        projectName: 'Royal Palms',
        projectId: '2024-01-15',
        assetType: 'Villa',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-017',
        projectName: 'Crystal Bay',
        projectId: '2024-01-15',
        assetType: 'Plot',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-018',
        projectName: 'Grand Vista',
        projectId: '2024-01-15',
        assetType: 'Villa',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
    {
        id: 'RSL-019',
        projectName: 'Emerald Heights',
        projectId: '2024-01-15',
        assetType: 'Apartment',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Broker',
    },
    {
        id: 'RSL-020',
        projectName: 'Sunrise Villas',
        projectId: '2024-01-15',
        assetType: 'Villa',
        inventoryDate: '2024-12-31',
        status: 'Available',
        listedBy: 'Owner',
    },
]

// Filter functions
export const filterByListedBy = (
    properties: RestackResaleProperty[],
    filterType: ListedByType,
): RestackResaleProperty[] => {
    return properties.filter((property) => property.listedBy === filterType)
}

export const filterByOwner = (properties: RestackResaleProperty[]): RestackResaleProperty[] => {
    return filterByListedBy(properties, 'Owner')
}

export const filterByBroker = (properties: RestackResaleProperty[]): RestackResaleProperty[] => {
    return filterByListedBy(properties, 'Broker')
}

// Search function
export const searchProperties = (properties: RestackResaleProperty[], searchTerm: string): RestackResaleProperty[] => {
    if (!searchTerm.trim()) return properties

    const lowerSearchTerm = searchTerm.toLowerCase()
    return properties.filter(
        (property) =>
            property.projectName.toLowerCase().includes(lowerSearchTerm) ||
            property.projectId.toLowerCase().includes(lowerSearchTerm) ||
            property.assetType.toLowerCase().includes(lowerSearchTerm) ||
            property.status.toLowerCase().includes(lowerSearchTerm) ||
            property.listedBy.toLowerCase().includes(lowerSearchTerm),
    )
}
