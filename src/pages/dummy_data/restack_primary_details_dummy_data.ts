// Pre-launch project details types
export interface ApartmentUnit {
    id: string
    aptType: string
    typology: string
    superBuiltUpArea: string
    carpetArea: string
    pricePerSqft: string
    totalPrice: string
    floorPlan: string // URL to image
}

export interface VillaUnit {
    id: string
    villaType: string
    typology: string
    plotSize: string
    builtUpArea: string
    carpetArea: string
    pricePerSqft: string
    totalPrice: string
    uds: string
    noOfFloors: string
    floorPlan: string
}

export interface PlotUnit {
    id: string
    plotType: string
    plotArea: string
    pricePerSqft: string
    totalPrice: string
}

export interface MapsPlan {
    id: string
    type: string
    name: string
    url: string
}

export interface ProjectDetails {
    pId: string
    projectName: string
    projectType: string
    stage: string
    developerPromoter: string
    projectSize: string
    pricePerSqft: string
    projectStartDate: string
    proposedCompletionDate: string
    address: string
    latitude: string
    longitude: string
    googleMap: string
    totalUnits: string
    eoiAmount: string
    noOfFloors: string
    noOfTowers: string
    carParking: string
    openSpace: string
    apartmentUnits: ApartmentUnit[]
    villaUnits: VillaUnit[]
    plotUnits: PlotUnit[]
    mapsPlans: MapsPlan[]
}

// Sample floor plan images (placeholder URLs)
const sampleFloorPlans = [
    'https://via.placeholder.com/400x300/e3f2fd/1976d2?text=2BHK+Floor+Plan',
    'https://via.placeholder.com/400x300/f3e5f5/7b1fa2?text=3BHK+Floor+Plan',
    'https://via.placeholder.com/400x300/e8f5e8/388e3c?text=4BHK+Floor+Plan',
    'https://via.placeholder.com/400x300/fff3e0/f57c00?text=Villa+Type+A',
    'https://via.placeholder.com/400x300/fce4ec/c2185b?text=Villa+Type+B',
]

// Generate sample project details
export const generateProjectDetails = (pId: string): ProjectDetails => {
    const projects: { [key: string]: ProjectDetails } = {
        P0001: {
            pId: 'P0001',
            projectName: 'Golden Hills Residences',
            projectType: 'Residential',
            stage: 'Pre Launch',
            developerPromoter: 'Bennett Development Inc.',
            projectSize: '20 Acres',
            pricePerSqft: '₹ 12,000',
            projectStartDate: '2024-06-01',
            proposedCompletionDate: '2027-06-01',
            address: '456 Maple Avenue, Golden Hills, CA 90210',
            latitude: '34.0522° N',
            longitude: '118.2437° W',
            googleMap: 'Open in Google Maps',
            totalUnits: '150',
            eoiAmount: '₹ 50,000',
            noOfFloors: '10',
            noOfTowers: '2',
            carParking: '200',
            openSpace: '35%',
            apartmentUnits: [
                {
                    id: 'apt1',
                    aptType: '2 BHK',
                    typology: 'Standard',
                    superBuiltUpArea: '1200 sqft',
                    carpetArea: '900 sqft',
                    pricePerSqft: '₹ 11,000',
                    totalPrice: '₹ 1,32,00,000',
                    floorPlan: sampleFloorPlans[0],
                },
                {
                    id: 'apt2',
                    aptType: '3 BHK',
                    typology: 'Premium',
                    superBuiltUpArea: '1600 sqft',
                    carpetArea: '1200 sqft',
                    pricePerSqft: '₹ 12,000',
                    totalPrice: '₹ 1,92,00,000',
                    floorPlan: sampleFloorPlans[1],
                },
            ],
            villaUnits: [
                {
                    id: 'villa1',
                    villaType: 'Type A',
                    typology: 'Luxury',
                    plotSize: '4000 sqft',
                    builtUpArea: '2500 sqft',
                    carpetArea: '2200 sqft',
                    pricePerSqft: '₹ 18,000',
                    totalPrice: '₹ 4,50,00,000',
                    uds: '1500 sqft',
                    noOfFloors: '2',
                    floorPlan: sampleFloorPlans[3],
                },
            ],
            plotUnits: [
                {
                    id: 'plot1',
                    plotType: 'Standard',
                    plotArea: '1500 sqft',
                    pricePerSqft: '₹ 10,000',
                    totalPrice: '₹ 1,50,00,000',
                },
            ],
            mapsPlans: [
                {
                    id: 'map1',
                    type: 'Master Plan',
                    name: 'Master Plan',
                    url: 'https://example.com/master-plan',
                },
                {
                    id: 'map2',
                    type: 'CDP Map',
                    name: 'CDP Map',
                    url: 'https://example.com/cdp-map',
                },
            ],
        },
    }

    // Return the specific project or a default one
    return (
        projects[pId] || {
            ...projects['P0001'],
            pId: pId,
            projectName: `Project ${pId}`,
        }
    )
}

// Example usage for generating project details:
const projectDetails = generateProjectDetails('P0001')
console.log(projectDetails)
