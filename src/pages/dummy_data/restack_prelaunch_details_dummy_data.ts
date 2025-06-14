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
            projectName: 'Green Valley Residences',
            projectType: 'Residential',
            stage: 'EC',
            developerPromoter: 'Sunrise Developers',
            projectSize: '15',
            pricePerSqft: '₹ 12,000',
            projectStartDate: '2024-03-15',
            proposedCompletionDate: '2027-03-15',
            address: '123 Oak Avenue, Pleasantville, CA 90210',
            latitude: '34.0522° N',
            longitude: '118.2437° W',
            googleMap: 'Open in Google Maps',
            totalUnits: '250',
            eoiAmount: '₹ 50,000',
            noOfFloors: '20',
            noOfTowers: '2',
            carParking: '300',
            openSpace: '40%',
            apartmentUnits: [
                {
                    id: 'apt1',
                    aptType: '2 BHK',
                    typology: 'Standard',
                    superBuiltUpArea: '1200 sqft',
                    carpetArea: '900 sqft',
                    pricePerSqft: '₹ 10,000',
                    totalPrice: '₹ 1,20,00,000',
                    floorPlan: sampleFloorPlans[0],
                },
                {
                    id: 'apt2',
                    aptType: '3 BHK',
                    typology: 'Premium',
                    superBuiltUpArea: '1500 sqft',
                    carpetArea: '1200 sqft',
                    pricePerSqft: '₹ 11,000',
                    totalPrice: '₹ 1,65,00,000',
                    floorPlan: sampleFloorPlans[1],
                },
                {
                    id: 'apt3',
                    aptType: '4 BHK',
                    typology: 'Luxury',
                    superBuiltUpArea: '2000 sqft',
                    carpetArea: '1600 sqft',
                    pricePerSqft: '₹ 12,000',
                    totalPrice: '₹ 2,40,00,000',
                    floorPlan: sampleFloorPlans[2],
                },
            ],
            villaUnits: [
                {
                    id: 'villa1',
                    villaType: 'Type A',
                    typology: 'Standard',
                    plotSize: '4000 sqft',
                    builtUpArea: '2500 sqft',
                    carpetArea: '2000 sqft',
                    pricePerSqft: '₹ 15,000',
                    totalPrice: '₹ 4,50,00,000',
                    uds: '1500 sqft',
                    noOfFloors: '2',
                    floorPlan: sampleFloorPlans[3],
                },
                {
                    id: 'villa2',
                    villaType: 'Type B',
                    typology: 'Premium',
                    plotSize: '4000 sqft',
                    builtUpArea: '3500 sqft',
                    carpetArea: '3000 sqft',
                    pricePerSqft: '₹ 18,000',
                    totalPrice: '₹ 7,20,00,000',
                    uds: '2000 sqft',
                    noOfFloors: '3',
                    floorPlan: sampleFloorPlans[4],
                },
            ],
            plotUnits: [
                {
                    id: 'plot1',
                    plotType: 'Standard',
                    plotArea: '1500 sqft',
                    pricePerSqft: '₹ 8,000',
                    totalPrice: '₹ 1,20,00,000',
                },
                {
                    id: 'plot2',
                    plotType: 'Premium',
                    plotArea: '2000 sqft',
                    pricePerSqft: '₹ 10,000',
                    totalPrice: '₹ 2,00,00,000',
                },
            ],
            mapsPlans: [
                {
                    id: 'map1',
                    type: 'Village Map',
                    name: 'Village Map',
                    url: 'https://example.com/village-map',
                },
                {
                    id: 'map2',
                    type: 'CDP Map',
                    name: 'CDP Map',
                    url: 'https://example.com/cdp-map',
                },
                {
                    id: 'map3',
                    type: 'Master Plan',
                    name: 'Master Plan',
                    url: 'https://example.com/master-plan',
                },
                {
                    id: 'map4',
                    type: 'Project Layout Plan',
                    name: 'Project Layout Plan',
                    url: 'https://example.com/project-layout',
                },
                {
                    id: 'map5',
                    type: 'Brochure',
                    name: 'Brochure',
                    url: 'https://example.com/brochure',
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

// Default project types for dropdown
export const projectTypes = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Mixed Use', value: 'Mixed Use' },
    { label: 'Industrial', value: 'Industrial' },
]

// Default stages for dropdown
export const projectStages = [
    { label: 'Pre Launch', value: 'Pre Launch' },
    { label: 'EC', value: 'EC' },
    { label: 'Under Construction', value: 'Under Construction' },
    { label: 'Ready to Move', value: 'Ready to Move' },
    { label: 'Launched', value: 'Launched' },
]

// Apartment typologies
export const apartmentTypologies = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Premium', value: 'Premium' },
    { label: 'Luxury', value: 'Luxury' },
]

// Villa typologies
export const villaTypologies = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Premium', value: 'Premium' },
    { label: 'Luxury', value: 'Luxury' },
]

// Plot types
export const plotTypes = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Premium', value: 'Premium' },
    { label: 'Corner', value: 'Corner' },
    { label: 'Park Facing', value: 'Park Facing' },
]
