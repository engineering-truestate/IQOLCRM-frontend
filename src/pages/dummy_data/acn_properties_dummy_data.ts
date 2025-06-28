// types/properties.ts
export interface PropertyData {
    propertyId: string
    propertyName: string
    assetType: string
    price: string
    sbua: string
    plotSize: string
    facing: string
    enquiries: number
    micromarket: string
    status: 'Available' | 'Sold' | 'Hold' | 'De-Listed'
    lastCheck: string
    agentName: string
    selected?: boolean
}

// data/propertiesData.ts
export const generateProperties = (): PropertyData[] => {
    const assetTypes = ['Apartment', 'Villa', 'Townhouse', 'Studio', 'Penthouse']
    const statuses: ('Available' | 'Sold' | 'Hold' | 'De-Listed')[] = ['Available', 'Sold', 'Hold', 'De-Listed']
    const agents = ['Samarth Jangir', 'Sophia Bennett', 'John Smith', 'Sarah Wilson', 'Michael Brown']
    const prices = ['$1,200,000', '$800,000', '$1,500,000', '$2,300,000', '$900,000', '$1,800,000', '$650,000']
    const sbuaOptions = ['1500 sq ft', '1200 sq ft', '1800 sq ft', '2000 sq ft', '2500 sq ft', 'Na']
    const plotSizes = ['1500 sq ft', '1200 sq ft', '1800 sq ft', '2000 sq ft', '2500 sq ft', 'Na']
    const facings = ['East', 'West', 'North', 'South', 'North-East', 'South-West']
    const micromarkets = [
        'HSR Layout, Koramangala',
        'Banjara Hills, Central',
        'Gachibowli, West',
        'Jubilee Hills, Central',
        'Kondapur, West',
        'Hitech City, West',
        'Madhapur, West',
    ]

    const propertyNames = [
        'Independent Apartment in HSR Layout',
        'Luxury Villa in Banjara Hills',
        'Modern Townhouse in Gachibowli',
        'Premium Studio in Jubilee Hills',
        'Executive Penthouse in Kondapur',
        'Spacious Apartment in Hitech City',
        'Contemporary Villa in Madhapur',
        'Elegant Townhouse in HSR Layout',
        'Deluxe Studio in Koramangala',
        'Grand Penthouse in Financial District',
    ]

    return Array.from({ length: 100 }, (_, i) => ({
        propertyId: `PA${String(i + 1).padStart(5, '0')}`,
        propertyName: propertyNames[Math.floor(Math.random() * propertyNames.length)],
        assetType: assetTypes[Math.floor(Math.random() * assetTypes.length)],
        price: prices[Math.floor(Math.random() * prices.length)],
        sbua: sbuaOptions[Math.floor(Math.random() * sbuaOptions.length)],
        plotSize: plotSizes[Math.floor(Math.random() * plotSizes.length)],
        facing: facings[Math.floor(Math.random() * facings.length)],
        enquiries: Math.floor(Math.random() * 20),
        micromarket: micromarkets[Math.floor(Math.random() * micromarkets.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastCheck: `${Math.floor(1 + Math.random() * 30)} May 2025`,
        agentName: agents[Math.floor(Math.random() * agents.length)],
        selected: false,
    }))
}
