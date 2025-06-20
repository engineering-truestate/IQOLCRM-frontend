export type PropertyStatus = 'Available' | 'Sold' | 'Hold' | 'De-listed'

export type AssetType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial'

export type Facing = 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West'

export type PropertyType = 'Resale' | 'Rental'

export interface Property {
    id: string
    propertyId: string
    propertyName: string
    projectName: string
    location: string
    assetType: AssetType
    price: string
    priceValue: number
    sbua: string
    plotSize: string
    facing: Facing
    enquiries: number
    micromarket: string
    status: PropertyStatus
    lastCheck: string
    agentName: string
    invScore: number
    imgVid: boolean
    configuration: string
    totalAskPrice: string
    propertyType: PropertyType
    // Different fields for resale vs rental
    monthlyRent?: string
    securityDeposit?: string
    salePrice?: string
    possessionDate?: string
}

const resalePropertyNames = [
    'Independent Apartment in HSR Layout',
    'Luxury Villa in Whitefield',
    'Commercial Space in Koramangala',
    'Independent House in Indiranagar',
    'Apartment in Spectra Palmwoods',
    'Villa in Prestige High Fields',
    'Plot in Sarjapur Road',
    'Apartment in Brigade Cornerstone',
    'Independent Villa in Electronic City',
    'Commercial Plot in Outer Ring Road',
]

const rentalPropertyNames = [
    '2 BHK for Rent in HSR Layout',
    'Furnished Villa for Rent in Whitefield',
    'Office Space for Lease in Koramangala',
    'Independent House for Rent in Indiranagar',
    'Serviced Apartment in Spectra Palmwoods',
    'Villa for Rent in Prestige High Fields',
    'Warehouse for Lease in Sarjapur Road',
    'Furnished Apartment in Brigade Cornerstone',
    'Villa for Rent in Electronic City',
    'Commercial Space for Lease in Outer Ring Road',
]

const projectNames = [
    'Spectra Palmwoods',
    'Prestige High Fields',
    'Brigade Cornerstone',
    'Sobha City',
    'Godrej Reflections',
    'Mantri Serenity',
    'Purva Panorama',
    'Salarpuria Sattva',
    'Embassy Springs',
    'Phoenix One',
]

const locations = [
    'HSR Layout',
    'Koramangala',
    'Whitefield',
    'Indiranagar',
    'Electronic City',
    'Sarjapur Road',
    'Brookefield',
    'Marathahalli',
    'BTM Layout',
    'JP Nagar',
]

const micromarkets = [
    'HSR Layout, Koramangala',
    'Whitefield, Brookefield',
    'Electronic City, Sarjapur',
    'Indiranagar, Koramangala',
    'BTM Layout, JP Nagar',
    'Marathahalli, Whitefield',
    'Outer Ring Road, Sarjapur',
    'Old Airport Road, Indiranagar',
]

const agentNames = ['Samarth Jangir', 'Priya Sharma', 'Raj Kumar', 'Anita Singh', 'Vikram Patel', 'Sneha Reddy']

const configurations = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', 'Studio']

const assetTypes: AssetType[] = ['Apartment', 'Villa', 'Plot', 'Commercial']
const facings: Facing[] = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
const statuses: PropertyStatus[] = ['Available', 'Sold', 'Hold', 'De-listed']

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomResalePrice(): { display: string; value: number } {
    const price = getRandomNumber(50, 500) * 100000 // 50L to 5Cr
    const crores = price / 10000000
    const lakhs = (price % 10000000) / 100000

    let display = ''
    if (crores >= 1) {
        display = `₹${crores.toFixed(2)} Cr`
    } else {
        display = `₹${lakhs.toFixed(0)} L`
    }

    return { display, value: price }
}

function getRandomRentalPrice(): { monthly: string; deposit: string; value: number } {
    const monthlyRent = getRandomNumber(15, 150) * 1000 // 15K to 150K
    const deposit = monthlyRent * getRandomNumber(6, 12) // 6-12 months deposit

    const monthlyDisplay = `₹${(monthlyRent / 1000).toFixed(0)}K`
    const depositDisplay = deposit >= 100000 ? `₹${(deposit / 100000).toFixed(1)}L` : `₹${(deposit / 1000).toFixed(0)}K`

    return {
        monthly: monthlyDisplay,
        deposit: depositDisplay,
        value: monthlyRent,
    }
}

function getRandomDate(): string {
    const dates = ['15 May 2025', '14 May 2025', '13 May 2025', '12 May 2025', '11 May 2025', '10 May 2025']
    return getRandomElement(dates)
}

function getRandomPossessionDate(): string {
    const dates = [
        'Immediate',
        'Within 1 Month',
        'Within 3 Months',
        'Within 6 Months',
        'Under Construction',
        'Ready to Move',
    ]
    return getRandomElement(dates)
}

export function generateProperties(count: number, type: PropertyType): Property[] {
    const properties: Property[] = []
    const propertyNames = type === 'Resale' ? resalePropertyNames : rentalPropertyNames

    for (let i = 0; i < count; i++) {
        const assetType = getRandomElement(assetTypes)
        const sbua = assetType === 'Plot' ? 'Na' : `${getRandomNumber(500, 3000)} sq ft`
        const plotSize =
            assetType === 'Plot'
                ? `${getRandomNumber(1000, 5000)} sq ft`
                : assetType === 'Villa'
                  ? `${getRandomNumber(1500, 4000)} sq ft`
                  : `${getRandomNumber(1000, 2500)} sq ft`

        let price: { display: string; value: number }
        let monthlyRent: string | undefined
        let securityDeposit: string | undefined
        let salePrice: string | undefined
        let possessionDate: string | undefined

        if (type === 'Resale') {
            price = getRandomResalePrice()
            salePrice = price.display
            possessionDate = getRandomPossessionDate()
        } else {
            const rentalPrice = getRandomRentalPrice()
            price = { display: rentalPrice.monthly, value: rentalPrice.value }
            monthlyRent = rentalPrice.monthly
            securityDeposit = rentalPrice.deposit
        }

        const property: Property = {
            id: `${type.toLowerCase()}_${i + 1}`,
            propertyId: `${type === 'Resale' ? 'PS' : 'PR'}${10000 + i}`,
            propertyName: getRandomElement(propertyNames),
            projectName: getRandomElement(projectNames),
            location: getRandomElement(locations),
            assetType,
            price: price.display,
            priceValue: price.value,
            sbua,
            plotSize: assetType === 'Apartment' && Math.random() > 0.5 ? 'Na' : plotSize,
            facing: getRandomElement(facings),
            enquiries: getRandomNumber(0, 50),
            micromarket: getRandomElement(micromarkets),
            status: getRandomElement(statuses),
            lastCheck: getRandomDate(),
            agentName: getRandomElement(agentNames),
            invScore: getRandomNumber(20, 100),
            imgVid: Math.random() > 0.3,
            configuration: getRandomElement(configurations),
            totalAskPrice: price.display,
            propertyType: type,
            monthlyRent,
            securityDeposit,
            salePrice,
            possessionDate,
        }

        properties.push(property)
    }

    return properties
}
