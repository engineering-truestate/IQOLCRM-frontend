export type QCReviewStatus = 'pending' | 'approved' | 'duplicate' | 'primary' | 'reject'

export interface QCProperty {
    id: string
    projectName: string
    assetType: string
    phoneNumber: string
    agent: string
    sbua: string
    plotSize: string
    price: string
    micromarket: string
    kamReviewed: QCReviewStatus
    dataReviewed: QCReviewStatus
    kam: string
    kamReviewDate?: string
    dataReviewDate?: string
    createdDate: string
}

const projectNames = [
    'Row House In HSR Layout',
    'Prestige Lakeside Habitat',
    'Brigade Cornerstone Utopia',
    'Sobha City',
    'Godrej Woodsman Estate',
    'Purva Panorama',
    'Mantri Espana',
    'Embassy Boulevard',
    'Salarpuria Sattva Park Cubix',
    'Shriram Chirping Woods',
]

const assetTypes = ['Apartment Simplex', 'Apartment Duplex', 'Villa', 'Rowhouse', 'Plot', 'Penthouse']

const agents = ['Rajan Jain', 'Priya Sharma', 'Amit Kumar', 'Sneha Patel', 'Rajesh Singh', 'Kavya Reddy']

const micromarkets = [
    'HSR Layout, Kormangala',
    'Whitefield, Bangalore',
    'Electronic City, Bangalore',
    'Marathahalli, Bangalore',
    'Koramangala, Bangalore',
    'Indiranagar, Bangalore',
    'Jayanagar, Bangalore',
    'BTM Layout, Bangalore',
]

const kams = ['Samarth', 'Priya', 'Raj', 'Sneha']

const generatePhoneNumber = (): string => {
    return `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`
}

const generateSBUA = (): string => {
    const area = Math.floor(800 + Math.random() * 2200)
    return `${area} Sqft`
}

const generatePlotSize = (): string => {
    if (Math.random() > 0.3) {
        const area = Math.floor(1000 + Math.random() * 2000)
        return `${area} Sqft`
    }
    return 'Na'
}

const generatePrice = (): string => {
    const price = (Math.random() * 4 + 1).toFixed(1)
    return `${price} Cr.`
}

const getRandomDate = (daysBack: number): string => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export const generateQCProperties = (count: number): QCProperty[] => {
    const properties: QCProperty[] = []

    for (let i = 0; i < count; i++) {
        const kamStatus = Math.random()
        const dataStatus = Math.random()

        let kamReviewed: QCReviewStatus
        let dataReviewed: QCReviewStatus

        // 40% pending kam review
        if (kamStatus < 0.4) {
            kamReviewed = 'pending'
            dataReviewed = 'pending' // Data must be pending if kam is pending
        }
        // 30% approved by kam
        else if (kamStatus < 0.7) {
            kamReviewed = 'approved'

            // If kam approved, data can be various statuses
            if (dataStatus < 0.5) {
                dataReviewed = 'pending' // Still pending data review
            } else if (dataStatus < 0.7) {
                dataReviewed = 'approved' // Fully approved (won't show in any table)
            } else if (dataStatus < 0.8) {
                dataReviewed = 'duplicate'
            } else if (dataStatus < 0.9) {
                dataReviewed = 'primary'
            } else {
                dataReviewed = 'reject'
            }
        }
        // 30% rejected/duplicate/primary by kam
        else {
            if (kamStatus < 0.8) {
                kamReviewed = 'duplicate'
            } else if (kamStatus < 0.9) {
                kamReviewed = 'primary'
            } else {
                kamReviewed = 'reject'
            }
            dataReviewed = 'pending' // Data review doesn't matter if kam didn't approve
        }

        const property: QCProperty = {
            id: `QC${(i + 1).toString().padStart(4, '0')}`,
            projectName: projectNames[Math.floor(Math.random() * projectNames.length)],
            assetType: assetTypes[Math.floor(Math.random() * assetTypes.length)],
            phoneNumber: generatePhoneNumber(),
            agent: agents[Math.floor(Math.random() * agents.length)],
            sbua: generateSBUA(),
            plotSize: generatePlotSize(),
            price: generatePrice(),
            micromarket: micromarkets[Math.floor(Math.random() * micromarkets.length)],
            kamReviewed,
            dataReviewed,
            kam: kams[Math.floor(Math.random() * kams.length)],
            kamReviewDate: kamReviewed !== 'pending' ? getRandomDate(30) : undefined,
            dataReviewDate: dataReviewed !== 'pending' && kamReviewed === 'approved' ? getRandomDate(15) : undefined,
            createdDate: getRandomDate(60),
        }

        properties.push(property)
    }

    return properties
}

// Filter functions for different tabs
export const getKamPendingProperties = (properties: QCProperty[]): QCProperty[] => {
    return properties.filter((p) => p.kamReviewed === 'pending')
}

export const getDataPendingProperties = (properties: QCProperty[]): QCProperty[] => {
    return properties.filter((p) => p.kamReviewed === 'approved' && p.dataReviewed === 'pending')
}

export const getNotApprovedProperties = (properties: QCProperty[]): QCProperty[] => {
    return properties.filter(
        (p) =>
            (p.kamReviewed !== 'pending' && p.kamReviewed !== 'approved') ||
            (p.kamReviewed === 'approved' && p.dataReviewed !== 'pending' && p.dataReviewed !== 'approved'),
    )
}
