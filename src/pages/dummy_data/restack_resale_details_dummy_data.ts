// restack_resale_dummy_details_data.ts
export interface PropertyImages {
    id: string
    url: string
    alt: string
    type: 'main' | 'floor_plan' | 'amenity' | 'exterior' | 'interior'
}

export interface BasicPropertyInfo {
    projectName: string
    propertyType: string
    subType: string
    configuration: string
    price: string
    pricePerSqFt: string
    projectSize: string
    superBuiltUpArea: string
    carpetArea: string
    reraId: string
    totalUnits: string
    developer: string
    possession: string
    ageOfProperty: string
    availability: string
    facing: string
    floorNumber: string
    furnishing: string
}

export interface LocationDetails {
    projectAddress: string
    micromarket: string
    area: string
    district: string
    pinCode: string
    coordinates: {
        latitude: string
        longitude: string
    }
    launchDate: string
    handoverDate: string
    mapLink: string
}

export interface AmenitiesAndFeatures {
    amenities: string[]
    clubhouseDetails: {
        name: string
        sizeSqft: string
        floor: string
    }[]
    parkingDetails: {
        openParking: string
        coveredParking: string
        stackedParking: string
    }
}

export interface ProjectDocuments {
    reraDocuments: {
        id: string
        name: string
        link: string
        uploadDate: string
        size: string
    }[]
    approvalDocuments: {
        id: string
        name: string
        link: string
        uploadDate: string
        size: string
    }[]
    nocDocuments: {
        id: string
        name: string
        link: string
        uploadDate: string
        size: string
    }[]
}

export interface FloorPlanDetails {
    id: string
    unitType: string
    carpetArea: string
    superBuiltUpArea: string
    imageUrl: string
    price: string
    pricePerSqft: string
}

export interface DeveloperInfo {
    name: string
    established: string
    totalProjects: string
    completedProjects: string
    ongoingProjects: string
    experience: string
    legalStatus: string
    description: string
}

export interface PropertyDetails {
    id: string
    title: string
    description: string
    status: 'Ready to Move' | 'Under Construction' | 'Upcoming'
    images: PropertyImages[]
    basicInfo: BasicPropertyInfo
    location: LocationDetails
    amenitiesAndFeatures: AmenitiesAndFeatures
    documents: ProjectDocuments
    floorPlans: FloorPlanDetails[]
    developer: DeveloperInfo
    projectOverview: {
        projectSize: string
        totalTowers: string
        totalFloors: string
        launchYear: string
        completionYear: string
        projectType: string
    }
    constructionDetails: {
        structureType: string
        elevatorBrand: string
        powerBackup: string
        waterSupply: string
        sewageTreatment: string
        rainwaterHarvesting: boolean
        earthquakeResistant: boolean
    }
    legalDetails: {
        approvedBy: string[]
        environmentalClearance: boolean
        fireNOC: boolean
        electricityConnection: boolean
        litigationStatus: string
    }
    investmentDetails: {
        expectedAppreciation: string
        rentalYield: string
        resaleValue: string
        mortgageApproval: string[]
    }
}

// Sample property images
export const samplePropertyImages: PropertyImages[] = [
    {
        id: 'img-001',
        url: '/api/placeholder/800/600',
        alt: 'Property main view',
        type: 'main',
    },
    {
        id: 'img-002',
        url: '/api/placeholder/800/600',
        alt: 'Property exterior',
        type: 'exterior',
    },
    {
        id: 'img-003',
        url: '/api/placeholder/800/600',
        alt: 'Property interior living room',
        type: 'interior',
    },
    {
        id: 'img-004',
        url: '/api/placeholder/800/600',
        alt: 'Property interior bedroom',
        type: 'interior',
    },
    {
        id: 'img-005',
        url: '/api/placeholder/800/600',
        alt: 'Swimming pool amenity',
        type: 'amenity',
    },
    {
        id: 'img-006',
        url: '/api/placeholder/800/600',
        alt: 'Clubhouse amenity',
        type: 'amenity',
    },
    {
        id: 'img-007',
        url: '/api/placeholder/600/800',
        alt: '2 BHK floor plan',
        type: 'floor_plan',
    },
    {
        id: 'img-008',
        url: '/api/placeholder/600/800',
        alt: '3 BHK floor plan',
        type: 'floor_plan',
    },
]

// Sample floor plans
export const sampleFloorPlans: FloorPlanDetails[] = [
    {
        id: 'fp-001',
        unitType: '1 BHK',
        carpetArea: '450 sq ft',
        superBuiltUpArea: '600 sq ft',
        imageUrl: '/api/placeholder/400/600',
        price: '₹45,00,000',
        pricePerSqft: '₹7,500',
    },
    {
        id: 'fp-002',
        unitType: '2 BHK',
        carpetArea: '675 sq ft',
        superBuiltUpArea: '900 sq ft',
        imageUrl: '/api/placeholder/400/600',
        price: '₹72,00,000',
        pricePerSqft: '₹8,000',
    },
    {
        id: 'fp-003',
        unitType: '3 BHK',
        carpetArea: '1050 sq ft',
        superBuiltUpArea: '1400 sq ft',
        imageUrl: '/api/placeholder/400/600',
        price: '₹1,12,00,000',
        pricePerSqft: '₹8,000',
    },
    {
        id: 'fp-004',
        unitType: '3 BHK Premium',
        carpetArea: '1200 sq ft',
        superBuiltUpArea: '1600 sq ft',
        imageUrl: '/api/placeholder/400/600',
        price: '₹1,44,00,000',
        pricePerSqft: '₹9,000',
    },
]

// Main property details data
export const propertyDetailsData: PropertyDetails = {
    id: 'PR7890',
    title: 'Sobha Sankey Apartments - Premium Residential Complex',
    description:
        'Sobha Sankey Apartments is a premium residential project located in the heart of the city, offering a perfect blend of modern living and serene surroundings. The project features spacious apartments with contemporary designs and top-notch amenities, ensuring a comfortable and luxurious lifestyle for its residents. With meticulously planned architecture and world-class facilities, this project represents the epitome of urban living.',
    status: 'Ready to Move',
    images: samplePropertyImages,
    basicInfo: {
        projectName: 'Sobha Sankey Apartments',
        propertyType: 'Residential',
        subType: 'Apartment',
        configuration: '2 BHK',
        price: '₹1.5 Cr',
        pricePerSqFt: '₹5,200',
        projectSize: '5.5 acres',
        superBuiltUpArea: '2,400 sq ft',
        carpetArea: '1,800 sq ft',
        reraId: 'PRM/KA/RERA/1251/308/PR/240723/006087',
        totalUnits: '520',
        developer: 'Sobha Limited',
        possession: 'Ready to Move',
        ageOfProperty: '2 years',
        availability: 'Immediate',
        facing: 'East',
        floorNumber: '24th Floor',
        furnishing: 'Semi-Furnished',
    },
    location: {
        projectAddress: 'HSR Layout 3rd Sector, Bangalore',
        micromarket: 'HSR Layout',
        area: 'South Bangalore',
        district: 'Bangalore Urban',
        pinCode: '560102',
        coordinates: {
            latitude: '12.9116',
            longitude: '77.6412',
        },
        launchDate: '24/11/2020',
        handoverDate: '24/11/2022',
        mapLink: 'https://maps.google.com/?q=12.9116,77.6412',
    },
    amenitiesAndFeatures: {
        amenities: [
            'Swimming Pool with Deck',
            'State-of-the-art Gymnasium',
            'Multi-purpose Clubhouse',
            "Children's Play Area",
            'Landscaped Gardens',
            'Tennis Court',
            'Basketball Court',
            'Jogging Track',
            'Yoga and Meditation Center',
            '24/7 Security with CCTV',
            'Power Backup (100%)',
            'Rainwater Harvesting',
            'Sewage Treatment Plant',
            'Fire Safety Systems',
            'Intercom Facility',
            'Visitor Parking',
            'Maintenance Office',
            'Party Hall',
            'Library and Reading Room',
            'Indoor Games Room',
        ],
        clubhouseDetails: [
            {
                name: 'Main Clubhouse',
                sizeSqft: '15,000',
                floor: 'Ground Floor',
            },
            {
                name: 'Recreation Center',
                sizeSqft: '8,000',
                floor: 'First Floor',
            },
        ],
        parkingDetails: {
            openParking: '200 slots',
            coveredParking: '320 slots',
            stackedParking: '50 slots',
        },
    },
    documents: {
        reraDocuments: [
            {
                id: 'rera-001',
                name: 'RERA Registration Certificate.pdf',
                link: 'https://example.com/documents/rera-registration.pdf',
                uploadDate: '2020-11-24',
                size: '1.2 MB',
            },
            {
                id: 'rera-002',
                name: 'Project Brochure RERA Approved.pdf',
                link: 'https://example.com/documents/project-brochure.pdf',
                uploadDate: '2020-11-24',
                size: '3.5 MB',
            },
        ],
        approvalDocuments: [
            {
                id: 'approval-001',
                name: 'Building Plan Approval.pdf',
                link: 'https://example.com/documents/building-plan.pdf',
                uploadDate: '2020-10-15',
                size: '2.8 MB',
            },
            {
                id: 'approval-002',
                name: 'Commencement Certificate.pdf',
                link: 'https://example.com/documents/commencement.pdf',
                uploadDate: '2020-11-01',
                size: '1.5 MB',
            },
            {
                id: 'approval-003',
                name: 'Occupancy Certificate.pdf',
                link: 'https://example.com/documents/occupancy.pdf',
                uploadDate: '2022-10-20',
                size: '1.8 MB',
            },
        ],
        nocDocuments: [
            {
                id: 'noc-001',
                name: 'Fire NOC Certificate.pdf',
                link: 'https://example.com/documents/fire-noc.pdf',
                uploadDate: '2020-09-10',
                size: '1.1 MB',
            },
            {
                id: 'noc-002',
                name: 'Environmental Clearance.pdf',
                link: 'https://example.com/documents/env-clearance.pdf',
                uploadDate: '2020-08-25',
                size: '2.2 MB',
            },
            {
                id: 'noc-003',
                name: 'Water Board NOC.pdf',
                link: 'https://example.com/documents/water-noc.pdf',
                uploadDate: '2020-09-05',
                size: '0.9 MB',
            },
        ],
    },
    floorPlans: sampleFloorPlans,
    developer: {
        name: 'Sobha Limited',
        established: '1995',
        totalProjects: '150+',
        completedProjects: '120+',
        ongoingProjects: '30+',
        experience: '28 years',
        legalStatus: 'Public Limited Company',
        description:
            "Sobha Limited is one of India's most trusted real estate developers, known for delivering high-quality residential and commercial projects. With over two decades of experience in the industry, Sobha has consistently maintained excellence in construction, design, and customer satisfaction.",
    },
    projectOverview: {
        projectSize: '5.5 acres',
        totalTowers: '6 towers',
        totalFloors: '25 floors each',
        launchYear: '2020',
        completionYear: '2022',
        projectType: 'High-rise Residential Complex',
    },
    constructionDetails: {
        structureType: 'RCC Frame Structure',
        elevatorBrand: 'Otis/Schindler',
        powerBackup: '100% DG Backup',
        waterSupply: '24x7 Cauvery + Borewell',
        sewageTreatment: 'In-house STP',
        rainwaterHarvesting: true,
        earthquakeResistant: true,
    },
    legalDetails: {
        approvedBy: ['BBMP', 'BDA', 'KIADB', 'RERA Karnataka'],
        environmentalClearance: true,
        fireNOC: true,
        electricityConnection: true,
        litigationStatus: 'Clear - No pending litigation',
    },
    investmentDetails: {
        expectedAppreciation: '8-12% annually',
        rentalYield: '3-4% annually',
        resaleValue: 'High liquidity market',
        mortgageApproval: ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'LIC Housing Finance'],
    },
}

// Additional properties for list view
export const allPropertiesData: PropertyDetails[] = [
    propertyDetailsData,
    {
        ...propertyDetailsData,
        id: 'PR7891',
        title: 'Prestige Green Valley - Luxury Villas',
        description:
            'Experience luxury     living at Prestige Green Valley, featuring premium villas with private gardens and world-class amenities in a gated community.',
        status: 'Under Construction',
        basicInfo: {
            ...propertyDetailsData.basicInfo,
            projectName: 'Prestige Green Valley',
            configuration: '4 BHK Villa',
            price: '₹2.8 Cr',
            pricePerSqFt: '₹6,500',
            superBuiltUpArea: '4,300 sq ft',
            carpetArea: '3,200 sq ft',
            possession: 'Dec 2025',
            ageOfProperty: 'New Launch',
            floorNumber: 'Ground + 2 Floors',
        },
        location: {
            ...propertyDetailsData.location,
            projectAddress: 'Whitefield Main Road, Bangalore',
            micromarket: 'Whitefield',
            area: 'East Bangalore',
        },
    },
    {
        ...propertyDetailsData,
        id: 'PR7892',
        title: 'Brigade Tech Park Residences - IT Corridor',
        description:
            'Modern apartments strategically located in the IT corridor with excellent connectivity and contemporary amenities for young professionals.',
        status: 'Ready to Move',
        basicInfo: {
            ...propertyDetailsData.basicInfo,
            projectName: 'Brigade Tech Park Residences',
            configuration: '1 BHK',
            price: '₹85 Lac',
            pricePerSqFt: '₹4,800',
            superBuiltUpArea: '1,770 sq ft',
            carpetArea: '1,200 sq ft',
            possession: 'Immediate',
            ageOfProperty: '1 year',
            floorNumber: '15th Floor',
        },
        location: {
            ...propertyDetailsData.location,
            projectAddress: 'Electronic City Phase 1, Bangalore',
            micromarket: 'Electronic City',
            area: 'South Bangalore',
        },
    },
    {
        ...propertyDetailsData,
        id: 'PR7893',
        title: 'Godrej Platinum Towers - Premium High-rise',
        description:
            'Iconic high-rise towers offering panoramic city views with premium finishes and smart home features in the heart of the business district.',
        status: 'Under Construction',
        basicInfo: {
            ...propertyDetailsData.basicInfo,
            projectName: 'Godrej Platinum Towers',
            configuration: '3 BHK',
            price: '₹1.95 Cr',
            pricePerSqFt: '₹7,200',
            superBuiltUpArea: '2,700 sq ft',
            carpetArea: '2,000 sq ft',
            possession: 'Jun 2026',
            ageOfProperty: 'New Launch',
            floorNumber: '32nd Floor',
        },
        location: {
            ...propertyDetailsData.location,
            projectAddress: 'UB City Mall Area, Bangalore',
            micromarket: 'UB City',
            area: 'Central Bangalore',
        },
    },
]

// Export functions to get property data
export const getPropertyById = (id: string): PropertyDetails | undefined => {
    return allPropertiesData.find((property) => property.id === id)
}

export const getAllProperties = (): PropertyDetails[] => {
    return allPropertiesData
}

export const getPropertiesByArea = (area: string): PropertyDetails[] => {
    return allPropertiesData.filter((property) => property.location.area.toLowerCase().includes(area.toLowerCase()))
}

export const getPropertiesByPriceRange = (minPrice: number, maxPrice: number): PropertyDetails[] => {
    return allPropertiesData.filter((property) => {
        const price = parseFloat(
            property.basicInfo.price
                .replace(/[₹,\s]/g, '')
                .replace('Cr', '0000000')
                .replace('Lac', '00000'),
        )
        return price >= minPrice && price <= maxPrice
    })
}

// Property search and filter utilities
export const searchProperties = (query: string): PropertyDetails[] => {
    const searchTerm = query.toLowerCase()
    return allPropertiesData.filter(
        (property) =>
            property.title.toLowerCase().includes(searchTerm) ||
            property.basicInfo.projectName.toLowerCase().includes(searchTerm) ||
            property.location.area.toLowerCase().includes(searchTerm) ||
            property.location.micromarket.toLowerCase().includes(searchTerm) ||
            property.developer.name.toLowerCase().includes(searchTerm),
    )
}
