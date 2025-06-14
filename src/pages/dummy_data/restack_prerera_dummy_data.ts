export interface StockProject {
    id: string
    projectName: string
    projectStartDate: string
    projectCompletionDate: string
    projectType: string
    ageOfBuilding: string
    // Detailed information
    sizes: string
    projectSize: string
    launchDate: string
    possessionStarts: string
    configurations: string
    reraId: string
    description: string
    images: string[]
    // Project Location
    address: string
    district: string
    micromarket: string
    zone: string
    latitude: string
    longitude: string
    // Project Timeline
    handoverDate: string
    ageOfBuildingYears: string
    // Project Configuration
    totalUnits: string
    towers: {
        name: string
        floors: string
    }[]
    // Project Resources
    brochure: string
    masterPlan: string
    unitsAndFloorPlan: string
    // Amenities
    amenities: string[]
    // Developer Details
    developerName: string
    legalName: string
    developerTier: string
    // Khata Details
    khataType: string
}

export const stockData: StockProject[] = [
    {
        id: '1',
        projectName: 'VR Shobha Meadows',
        projectStartDate: '2022-01-01',
        projectCompletionDate: '2024-12-31',
        projectType: 'Residential',
        ageOfBuilding: '2 years',
        sizes: '1200-1800 sqft',
        projectSize: '5 Acres',
        launchDate: '2022',
        possessionStarts: '2024',
        configurations: '2, 3 BHK',
        reraId: 'PRM/KA/R/2021/12/1234',
        description:
            'VR Shobha Meadows is a residential project located in the heart of the city, offering a blend of modern living and serene surroundings. The project features spacious apartments with contemporary designs and top-notch amenities, ensuring a comfortable and luxurious lifestyle for its residents.',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
        address: '123, MG Road, Bangalore',
        district: 'Bangalore Central',
        micromarket: 'Central Business District',
        zone: 'Central',
        latitude: '12.9716',
        longitude: '77.5946',
        handoverDate: '2024',
        ageOfBuildingYears: '2',
        totalUnits: '250',
        towers: [
            { name: 'Tower 1', floors: '12 floors' },
            { name: 'Tower 2', floors: '15 floors' },
        ],
        brochure: 'PDF Link',
        masterPlan: 'View',
        unitsAndFloorPlan: 'View',
        amenities: [
            'Electrification, Water supply and Sanitary Finishing',
            'Painting',
            'Fire prevention and fire fighting fitting and fixture with network',
            'Wardrobe, Showcase, Kitchen cabinet, Puja work',
            'Landscaping & Tree Planting',
        ],
        developerName: 'Shobha Developers',
        legalName: 'Shobha Limited',
        developerTier: 'Tier 1',
        khataType: 'A',
    },
    {
        id: '2',
        projectName: 'Mountain View Estates',
        projectStartDate: '2022-07-20',
        projectCompletionDate: '2023-06-15',
        projectType: 'Villa',
        ageOfBuilding: '1 year',
        sizes: '2500-3500 sqft',
        projectSize: '8 Acres',
        launchDate: '2022',
        possessionStarts: '2023',
        configurations: '3, 4 BHK',
        reraId: 'PRM/KA/R/2022/03/5678',
        description:
            'Mountain View Estates offers premium villas with stunning mountain views and world-class amenities.',
        images: ['https://example.com/villa1.jpg', 'https://example.com/villa2.jpg'],
        address: '456, Whitefield Road, Bangalore',
        district: 'Bangalore East',
        micromarket: 'Whitefield',
        zone: 'East',
        latitude: '12.9698',
        longitude: '77.7500',
        handoverDate: '2023',
        ageOfBuildingYears: '1',
        totalUnits: '120',
        towers: [
            { name: 'Phase 1', floors: '2 floors' },
            { name: 'Phase 2', floors: '3 floors' },
        ],
        brochure: 'PDF Link',
        masterPlan: 'View',
        unitsAndFloorPlan: 'View',
        amenities: ['Swimming Pool', 'Gymnasium', 'Landscaped Gardens', 'Security', 'Power Backup'],
        developerName: 'Mountain Developers',
        legalName: 'Mountain Limited',
        developerTier: 'Tier 1',
        khataType: 'A',
    },
    // Add more projects with similar detailed structure...
    {
        id: '3',
        projectName: 'Oceanfront Villas',
        projectStartDate: '2024-05-01',
        projectCompletionDate: '2025-03-20',
        projectType: 'Villa',
        ageOfBuilding: 'Under Construction',
        sizes: '3000-4000 sqft',
        projectSize: '12 Acres',
        launchDate: '2024',
        possessionStarts: '2025',
        configurations: '4, 5 BHK',
        reraId: 'PRM/KA/R/2024/05/9012',
        description: 'Luxury oceanfront villas with private beach access and premium amenities.',
        images: ['https://example.com/ocean1.jpg', 'https://example.com/ocean2.jpg'],
        address: '789, Coastal Highway, Mangalore',
        district: 'Mangalore',
        micromarket: 'Coastal Area',
        zone: 'Coastal',
        latitude: '12.9141',
        longitude: '74.8560',
        handoverDate: '2025',
        ageOfBuildingYears: '0',
        totalUnits: '80',
        towers: [
            { name: 'Sea View Block', floors: '3 floors' },
            { name: 'Garden Block', floors: '2 floors' },
        ],
        brochure: 'PDF Link',
        masterPlan: 'View',
        unitsAndFloorPlan: 'View',
        amenities: ['Private Beach Access', 'Infinity Pool', 'Spa & Wellness Center', 'Marina', 'Golf Course'],
        developerName: 'Coastal Developers',
        legalName: 'Coastal Properties Ltd',
        developerTier: 'Tier 1',
        khataType: 'B',
    },
]
