// Complete project details types covering all 85 headers from the image

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

export interface FloorPlan {
    id: string
    url: string
}

export interface MapsPlan {
    id: string
    type: string
    name: string
    url: string
}

export interface ProjectOverview {
    projectNameAsPerRERA: string
    projectDescription: string
    projectSize: string
    projectSubType: string
    projectStatus: string
}

export interface DeveloperDetails {
    promoterName: string
    legalStatus: string
}

export interface ProjectAddress {
    projectAddress: string
    district: string
    subDistrict: string
    village: string
    pinCode: string
    telephone: string
    northBoundary: string
    southBoundary: string
    eastBoundary: string
    westBoundary: string
    latitude: string
    longitude: string
    zone: string
}

export interface PlanDetails {
    sanctioningAuthority: string
    sanctionedPlanNumber: string
    planApprovalDate: string
    revisedPlanNumber: string
    commencementCertificateKhataBuildingLicense: string
    validRegistrationApplicationCertNo: string
    odiNumberOfTowersFloorsPlotType: string
    noOfOpenParking: string
    noOfCoveredParking: string
    noOfStacked: string
    no: string
}

export interface AreaDetails {
    totalOpenAreaSqMtr: string
    totalClosedAreaSqMtr: string
    totalBuiltUpLandSqMtr: string
    totalBuiltUpAreaAsOfTheProjectSqMtr: string
    totalCarpetAreaSqMtr: string
    totalConstructedAreaSqMtr: string
    totalStiltAreaSqMtr: string
    areaOfCoveredParkingSqMtr: string
    areaOfGarageSqMtr: string
    specificDensityPerAcre: string
}

export interface PriceDetails {
    pricePerSqftMIN: string
    totalProject: string
    developedCostEMI: string
    costSheet: string
}

export interface SourceOfWater {
    source: string
}

export interface DevelopmentDetail {
    id: string
    slNo: string
    typeOfInventory: string
    noOfInventory: string
    coverageAreaSqMtr: string
    areaOfAmenitiesSqMtrNos: string
    areaOfParkingNo: string
}

export interface DevelopmentDetailsExtra {
    firstInvestment: string
    numberOfTowers: string
}

export interface FloorPlanDetail {
    id: string
    floorNo: string
    noOfUnits: string
}

export interface UnitDetail {
    id: string
    slNo: string
    floorNo: string
    unitNo: string
    unitType: string
    carpetArea: string
    exclusiveArea: string
    associationArea: string
    uds: string
    parking: string
}

export interface TowerDetail {
    id: string
    tower: string
    type: string
    noOfFloors: string
    totalUnits: string
    saleType: string
    booking: string
    basement: string
    parking: string
    heightFeet: string
    floorPlans: string
    stilts: string
    slabs: string
    floorPlanDetails: FloorPlanDetail[]
    unitDetails: UnitDetail[]
}

export interface GroundFloor {
    findOutTheTypeOfLaunchPerYearWill: string
    typologyUnitPlan: string
    vehiclePlan: string
    groundFloorArea: string
    floor: string
}

export interface ClubhouseDetail {
    id: string
    name: string
    sizeSqft: string
    floor: string
}

export interface LitigationStatusAndComplaints {
    litigationStatus: string
    appealRevision: string
    complaints: string
    affidavitLink: string
}

export interface Documents {
    saleDeed: string
    viewDocument: string
}

export interface CompleteProjectDetails {
    // Main title
    projectTitle: string

    // Project Overview
    projectOverview: ProjectOverview

    // Developer Details
    developerDetails: DeveloperDetails

    // Project Address
    projectAddress: ProjectAddress

    // Plan Details
    planDetails: PlanDetails

    // Area Details
    areaDetails: AreaDetails

    // Price Details
    priceDetails: PriceDetails

    // Source of Water
    sourceOfWater: SourceOfWater

    // Development Details
    developmentDetails: DevelopmentDetail[]
    developmentDetailsExtra: DevelopmentDetailsExtra

    // Tower Details
    towerDetails: TowerDetail[]

    // Ground Floor
    groundFloor: GroundFloor

    // Amenities
    amenities: string[]

    // Clubhouse Details
    clubhouseDetails: ClubhouseDetail[]

    // Litigation Status and Complaints
    litigationStatusAndComplaints: LitigationStatusAndComplaints

    // Documents
    documents: Documents

    // Maps Plans
    mapsPlans: MapsPlan[]

    // Legacy fields for compatibility
    pId: string
    projectName: string
    projectType: string
    stage: string
    developerPromoter: string
    projectStartDate: string
    proposedCompletionDate: string
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
}

// Sample floor plans
export const sampleFloorPlans: FloorPlan[] = [
    { id: 'apt-fp-001', url: 'https://via.placeholder.com/400x300/e0f2f7/4dd0e1?text=Apartment+Floor+Plan+1' },
    { id: 'apt-fp-002', url: 'https://via.placeholder.com/400x300/e0f2f7/4dd0e1?text=Apartment+Floor+Plan+2' },
    { id: 'apt-fp-003', url: 'https://via.placeholder.com/400x300/e0f2f7/4dd0e1?text=Apartment+Floor+Plan+3' },
    { id: 'villa-fp-001', url: 'https://via.placeholder.com/400x300/e0f2f7/4dd0e1?text=Villa+Floor+Plan+1' },
    { id: 'villa-fp-002', url: 'https://via.placeholder.com/400x300/e0f2f7/4dd0e1?text=Villa+Floor+Plan+2' },
]

// Sample complete project details
export const sampleCompleteProjectDetails: CompleteProjectDetails[] = [
    {
        projectTitle: 'Sample Project 1',
        projectOverview: {
            projectNameAsPerRERA: 'Sample Project 1',
            projectDescription: 'A sample residential project',
            projectSize: 'Large',
            projectSubType: 'Apartments',
            projectStatus: 'Active',
        },
        developerDetails: {
            promoterName: 'Sample Developer',
            legalStatus: 'Pvt. Ltd.',
        },
        projectAddress: {
            projectAddress: '123 Sample Street, City',
            district: 'Sample District',
            subDistrict: 'Sample Sub-District',
            village: 'Sample Village',
            pinCode: '123456',
            telephone: '+91-1234567890',
            northBoundary: 'North Boundary',
            southBoundary: 'South Boundary',
            eastBoundary: 'East Boundary',
            westBoundary: 'West Boundary',
            latitude: '12.9716',
            longitude: '77.5946',
            zone: 'Sample Zone',
        },
        planDetails: {
            sanctioningAuthority: 'Sample Authority',
            sanctionedPlanNumber: 'SPN/001/23',
            planApprovalDate: '2023-01-01',
            revisedPlanNumber: 'RPN/001/23',
            commencementCertificateKhataBuildingLicense: 'CCBL/001/23',
            validRegistrationApplicationCertNo: 'VRC/001/23',
            odiNumberOfTowersFloorsPlotType: '5/20/Apartment',
            noOfOpenParking: '100',
            noOfCoveredParking: '200',
            noOfStacked: '50',
            no: '100',
        },
        areaDetails: {
            totalOpenAreaSqMtr: '20000',
            totalClosedAreaSqMtr: '10000',
            totalBuiltUpLandSqMtr: '30000',
            totalBuiltUpAreaAsOfTheProjectSqMtr: '40000',
            totalCarpetAreaSqMtr: '24000',
            totalConstructedAreaSqMtr: '36000',
            totalStiltAreaSqMtr: '4000',
            areaOfCoveredParkingSqMtr: '3000',
            areaOfGarageSqMtr: '1000',
            specificDensityPerAcre: '200',
        },
        priceDetails: {
            pricePerSqftMIN: '8000',
            totalProject: '1000 Cr',
            developedCostEMI: '4 Cr',
            costSheet: 'link_to_cost_sheet.pdf',
        },
        sourceOfWater: {
            source: 'Municipal Water Supply + Borewell',
        },
        developmentDetails: [
            {
                id: 'dd1',
                slNo: '1',
                typeOfInventory: 'Apartment',
                noOfInventory: '200',
                coverageAreaSqMtr: '2000',
                areaOfAmenitiesSqMtrNos: '400',
                areaOfParkingNo: '300',
            },
        ],
        developmentDetailsExtra: {
            firstInvestment: '20 Cr',
            numberOfTowers: '5',
        },
        towerDetails: [
            {
                id: 't1',
                tower: 'Tower A',
                type: 'Residential',
                noOfFloors: '20',
                totalUnits: '100',
                saleType: 'Outright',
                booking: 'Open',
                basement: '2',
                parking: '120',
                heightFeet: '60',
                floorPlans: sampleFloorPlans[0].id,
                stilts: '2',
                slabs: '22',
                floorPlanDetails: [
                    { id: 'f1', floorNo: '1', noOfUnits: '10' },
                    { id: 'f2', floorNo: '2', noOfUnits: '10' },
                ],
                unitDetails: [
                    {
                        id: 'u1',
                        slNo: '1',
                        floorNo: '1',
                        unitNo: '101',
                        unitType: '2 BHK',
                        carpetArea: '70',
                        exclusiveArea: '10',
                        associationArea: '5',
                        uds: '0.01',
                        parking: '1',
                    },
                ],
            },
        ],
        groundFloor: {
            findOutTheTypeOfLaunchPerYearWill: '400 Units/Year',
            typologyUnitPlan: 'Open',
            vehiclePlan: 'Basement + Ground',
            groundFloorArea: '3000 SqMtr',
            floor: 'Ground',
        },
        amenities: [
            'Swimming Pool',
            'Gym',
            'Clubhouse',
            "Children's Play Area",
            'Landscaped Gardens',
            'Tennis Court',
            'Basketball Court',
        ],
        clubhouseDetails: [
            {
                id: 'ch1',
                name: 'Main Clubhouse',
                sizeSqft: '10000',
                floor: 'Ground',
            },
        ],
        litigationStatusAndComplaints: {
            litigationStatus: 'No Litigation',
            appealRevision: 'None',
            complaints: 'None',
            affidavitLink: 'link_to_affidavit.pdf',
        },
        documents: {
            saleDeed: 'Sale Deed Document',
            viewDocument: 'link_to_document.pdf',
        },
        mapsPlans: [
            {
                id: 'mp1',
                type: 'Master Plan',
                name: 'Master Plan',
                url: 'https://via.placeholder.com/400x300/e0f2f7/4dd0e1?text=Master+Plan',
            },
        ],
        pId: 'P0001',
        projectName: 'Sample Project 1',
        projectType: 'Residential',
        stage: 'Active',
        developerPromoter: 'Sample Developer',
        projectStartDate: '2023-01-01',
        proposedCompletionDate: '2024-12-31',
        googleMap: 'https://maps.google.com/?q=Sample+Address',
        totalUnits: '200',
        eoiAmount: '200000',
        noOfFloors: '20',
        noOfTowers: '5',
        carParking: '300',
        openSpace: '10000',
        apartmentUnits: [
            {
                id: 'apt-001',
                aptType: '1 BHK',
                typology: '1BHK',
                superBuiltUpArea: '600 Sq.ft.',
                carpetArea: '450 Sq.ft.',
                pricePerSqft: '7500',
                totalPrice: '45,00,000',
                floorPlan: sampleFloorPlans[0].id,
            },
            {
                id: 'apt-002',
                aptType: '2 BHK',
                typology: '2BHK',
                superBuiltUpArea: '900 Sq.ft.',
                carpetArea: '675 Sq.ft.',
                pricePerSqft: '8000',
                totalPrice: '72,00,000',
                floorPlan: sampleFloorPlans[1].id,
            },
        ],
        villaUnits: [
            {
                id: 'villa-001',
                villaType: '3 BHK',
                typology: '3BHK',
                plotSize: '2400 Sq.ft.',
                builtUpArea: '1800 Sq.ft.',
                carpetArea: '1350 Sq.ft.',
                pricePerSqft: '10000',
                totalPrice: '1,80,00,000',
                uds: '2400',
                noOfFloors: '2',
                floorPlan: sampleFloorPlans[3].id,
            },
        ],
        plotUnits: [
            {
                id: 'plot-001',
                plotType: 'Residential Plot',
                plotArea: '2400 Sq.ft.',
                pricePerSqft: '5000',
                totalPrice: '1,20,00,000',
            },
        ],
    },
]

// Function to generate complete project details based on the PXXX ID
export const generateCompleteProjectDetails = (simplifiedPId: string): CompleteProjectDetails => {
    // Directly use the simplifiedPId to find the project in sampleCompleteProjectDetails
    const sampleData = sampleCompleteProjectDetails.find((project) => project.pId === simplifiedPId)

    if (sampleData) {
        return sampleData
    }

    // Fallback if no matching sample data is found (e.g., for generated projects)
    const defaultProject: CompleteProjectDetails = {
        projectTitle: `Project ${simplifiedPId} - Details`,
        projectOverview: {
            projectNameAsPerRERA: `Project ${simplifiedPId}`,
            projectDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            projectSize: 'Medium',
            projectSubType: 'Apartments',
            projectStatus: 'Active',
        },
        developerDetails: {
            promoterName: 'Default Developer',
            legalStatus: 'Pvt. Ltd.',
        },
        projectAddress: {
            projectAddress: 'Default Address, City, State',
            district: 'Default District',
            subDistrict: 'Default Sub-District',
            village: 'Default Village',
            pinCode: '000000',
            telephone: '+91-0000000000',
            northBoundary: 'North Boundary Default',
            southBoundary: 'South Boundary Default',
            eastBoundary: 'East Boundary Default',
            westBoundary: 'West Boundary Default',
            latitude: '12.9716',
            longitude: '77.5946',
            zone: 'Default Zone',
        },
        planDetails: {
            sanctioningAuthority: 'Default Authority',
            sanctionedPlanNumber: 'SPN/000/00',
            planApprovalDate: '2023-01-01',
            revisedPlanNumber: 'RPN/000/00',
            commencementCertificateKhataBuildingLicense: 'CCBL/000/00',
            validRegistrationApplicationCertNo: 'VRC/000/00',
            odiNumberOfTowersFloorsPlotType: '10/5/Apartment',
            noOfOpenParking: '50',
            noOfCoveredParking: '100',
            noOfStacked: '20',
            no: '50',
        },
        areaDetails: {
            totalOpenAreaSqMtr: '10000',
            totalClosedAreaSqMtr: '5000',
            totalBuiltUpLandSqMtr: '15000',
            totalBuiltUpAreaAsOfTheProjectSqMtr: '20000',
            totalCarpetAreaSqMtr: '12000',
            totalConstructedAreaSqMtr: '18000',
            totalStiltAreaSqMtr: '2000',
            areaOfCoveredParkingSqMtr: '1500',
            areaOfGarageSqMtr: '500',
            specificDensityPerAcre: '100',
        },
        priceDetails: {
            pricePerSqftMIN: '6000',
            totalProject: '500 Cr',
            developedCostEMI: '2 Cr',
            costSheet: 'link_to_cost_sheet.pdf',
        },
        sourceOfWater: {
            source: 'Municipal Water Supply',
        },
        developmentDetails: [
            {
                id: 'dd1',
                slNo: '1',
                typeOfInventory: 'Apartment',
                noOfInventory: '100',
                coverageAreaSqMtr: '1000',
                areaOfAmenitiesSqMtrNos: '200',
                areaOfParkingNo: '150',
            },
        ],
        developmentDetailsExtra: {
            firstInvestment: '10 Cr',
            numberOfTowers: '2',
        },
        towerDetails: [
            {
                id: 't1',
                tower: 'Tower A',
                type: 'Residential',
                noOfFloors: '20',
                totalUnits: '50',
                saleType: 'Outright',
                booking: 'Open',
                basement: '1',
                parking: '60',
                heightFeet: '60',
                floorPlans: sampleFloorPlans[0].id,
                stilts: '2',
                slabs: '22',
                floorPlanDetails: [
                    { id: 'f1', floorNo: '1', noOfUnits: '5' },
                    { id: 'f2', floorNo: '2', noOfUnits: '5' },
                ],
                unitDetails: [
                    {
                        id: 'u1',
                        slNo: '1',
                        floorNo: '1',
                        unitNo: '101',
                        unitType: '2 BHK',
                        carpetArea: '70',
                        exclusiveArea: '10',
                        associationArea: '5',
                        uds: '0.01',
                        parking: '1',
                    },
                ],
            },
            {
                id: 't2',
                tower: 'Tower B',
                type: 'Residential',
                noOfFloors: '20',
                totalUnits: '50',
                saleType: 'Under Construction',
                booking: 'Open',
                basement: '1',
                parking: '60',
                heightFeet: '60',
                floorPlans: sampleFloorPlans[1].id,
                stilts: '2',
                slabs: '22',
                floorPlanDetails: [
                    { id: 'f3', floorNo: '1', noOfUnits: '5' },
                    { id: 'f4', floorNo: '2', noOfUnits: '5' },
                ],
                unitDetails: [
                    {
                        id: 'u2',
                        slNo: '1',
                        floorNo: '1',
                        unitNo: '101',
                        unitType: '2 BHK',
                        carpetArea: '70',
                        exclusiveArea: '10',
                        associationArea: '5',
                        uds: '0.01',
                        parking: '1',
                    },
                ],
            },
        ],
        groundFloor: {
            findOutTheTypeOfLaunchPerYearWill: '200 Units/Year',
            typologyUnitPlan: 'Open',
            vehiclePlan: 'Basement + Ground',
            groundFloorArea: '1500 SqMtr',
            floor: 'Ground',
        },
        amenities: ['Swimming Pool', 'Gym', 'Clubhouse', "Children's Play Area", 'Landscaped Gardens'],
        clubhouseDetails: [
            {
                id: 'ch1',
                name: 'Main Clubhouse',
                sizeSqft: '5000',
                floor: 'Ground',
            },
        ],
        litigationStatusAndComplaints: {
            litigationStatus: 'No Litigation',
            appealRevision: 'None',
            complaints: 'None',
            affidavitLink: 'link_to_affidavit.pdf',
        },
        documents: {
            saleDeed: 'Sale Deed Document',
            viewDocument: 'link_to_document.pdf',
        },
        mapsPlans: [
            {
                id: 'mp1',
                type: 'Master Plan',
                name: 'Master Plan',
                url: 'https://via.placeholder.com/400x300/e0f2f7/4dd0e1?text=Master+Plan',
            },
        ],
        // Legacy fields for compatibility
        pId: simplifiedPId,
        projectName: `Project ${simplifiedPId}`,
        projectType: 'Residential',
        stage: 'Active',
        developerPromoter: 'Default Developer',
        projectStartDate: '2023-01-01',
        proposedCompletionDate: '2024-12-31',
        googleMap: 'https://maps.google.com/?q=Default+Address',
        totalUnits: '100',
        eoiAmount: '100000',
        noOfFloors: '10',
        noOfTowers: '5',
        carParking: '150',
        openSpace: '5000',
        apartmentUnits: apartmentTypologies.map((t) => ({
            id: `apt-${t.typology}`,
            aptType: t.name,
            typology: t.typology,
            superBuiltUpArea: t.superBuiltUpArea || `${Math.floor(Math.random() * 500) + 500} Sq.ft.`,
            carpetArea: t.carpetArea || `${Math.floor(Math.random() * 400) + 400} Sq.ft.`,
            pricePerSqft: t.pricePerSqft || `${Math.floor(Math.random() * 2000) + 6000}`,
            totalPrice: t.totalPrice || `${Math.floor(Math.random() * 5000000) + 5000000}`,
            floorPlan: sampleFloorPlans[Math.floor(Math.random() * 3)].id, // Use random apartment floor plan
        })),
        villaUnits: villaTypologies.map((t) => ({
            id: `villa-${t.typology}`,
            villaType: t.name,
            typology: t.typology,
            plotSize: t.plotSize || `${Math.floor(Math.random() * 1000) + 1500} Sq.ft.`,
            builtUpArea: t.builtUpArea || `${Math.floor(Math.random() * 800) + 1200} Sq.ft.`,
            carpetArea: t.carpetArea || `${Math.floor(Math.random() * 700) + 1000} Sq.ft.`,
            pricePerSqft: t.pricePerSqft || `${Math.floor(Math.random() * 3000) + 8000}`,
            totalPrice: t.totalPrice || `${Math.floor(Math.random() * 10000000) + 10000000}`,
            uds: t.uds || `${Math.floor(Math.random() * 500) + 500} Sq.ft.`,
            noOfFloors: t.noOfFloors || `${Math.floor(Math.random() * 2) + 1}`,
            floorPlan: sampleFloorPlans[Math.floor(Math.random() * 2) + 3].id, // Use random villa floor plan
        })),
        plotUnits: plotTypes.map((t) => ({
            id: `plot-${t.type}`,
            plotType: t.type,
            plotArea: t.plotArea || `${Math.floor(Math.random() * 1000) + 1000} Sq.ft.`,
            pricePerSqft: t.pricePerSqft || `${Math.floor(Math.random() * 1000) + 3000}`,
            totalPrice: t.totalPrice || `${Math.floor(Math.random() * 3000000) + 3000000}`,
        })),
    }

    return defaultProject
}

// Dropdown options
export const projectTypes = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Mixed Use', value: 'Mixed Use' },
]

export const projectStages = [
    { label: 'Pre Launch', value: 'Pre Launch' },
    { label: 'Launched', value: 'Launched' },
    { label: 'Under Construction', value: 'Under Construction' },
    { label: 'Completed', value: 'Completed' },
]

export const apartmentTypologies = [
    {
        id: 'apt-001',
        name: '1 BHK',
        typology: '1BHK',
        superBuiltUpArea: '600 Sq.ft.',
        carpetArea: '450 Sq.ft.',
        pricePerSqft: '7500',
        totalPrice: '45,00,000',
        floorPlan: sampleFloorPlans[0].id,
    },
    {
        id: 'apt-002',
        name: '2 BHK',
        typology: '2BHK',
        superBuiltUpArea: '950 Sq.ft.',
        carpetArea: '700 Sq.ft.',
        pricePerSqft: '7200',
        totalPrice: '68,40,000',
        floorPlan: sampleFloorPlans[1].id,
    },
    {
        id: 'apt-003',
        name: '3 BHK',
        typology: '3BHK',
        superBuiltUpArea: '1400 Sq.ft.',
        carpetArea: '1050 Sq.ft.',
        pricePerSqft: '7000',
        totalPrice: '98,00,000',
        floorPlan: sampleFloorPlans[2].id,
    },
]

export const villaTypologies = [
    {
        id: 'villa-001',
        name: 'Villa Type A',
        typology: '3BHK',
        plotSize: '1200 Sq.ft.',
        builtUpArea: '1800 Sq.ft.',
        carpetArea: '1500 Sq.ft.',
        pricePerSqft: '8000',
        totalPrice: '1,44,00,000',
        uds: '500 Sq.ft.',
        noOfFloors: '2',
        floorPlan: sampleFloorPlans[3].id,
    },
    {
        id: 'villa-002',
        name: 'Villa Type B',
        typology: '4BHK',
        plotSize: '2000 Sq.ft.',
        builtUpArea: '2800 Sq.ft.',
        carpetArea: '2400 Sq.ft.',
        pricePerSqft: '8500',
        totalPrice: '2,38,00,000',
        uds: '800 Sq.ft.',
        noOfFloors: '3',
        floorPlan: sampleFloorPlans[4].id,
    },
]

export const plotTypes = [
    {
        id: 'plot-001',
        type: 'Residential Plot',
        plotArea: '1500 Sq.ft.',
        pricePerSqft: '5000',
        totalPrice: '75,00,000',
    },
    {
        id: 'plot-002',
        type: 'Commercial Plot',
        plotArea: '2500 Sq.ft.',
        pricePerSqft: '6000',
        totalPrice: '1,50,00,000',
    },
]

// Example usage
const completeProjectDetails = generateCompleteProjectDetails('P0001')
console.log(completeProjectDetails)
