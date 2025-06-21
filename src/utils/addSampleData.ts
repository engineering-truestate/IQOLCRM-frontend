import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { PrimaryProperty } from '../data_types/restack/restack-primary'

const samplePrimaryProperties: Omit<PrimaryProperty, 'projectId'>[] = [
    {
        projectName: 'Sunrise Residency',
        projectDescription: 'Luxury residential complex with modern amenities',
        projectType: 'Residential',
        projectSubType: 'Apartment',
        projectStatus: 'Active',
        promoterName: 'Sunrise Developers Ltd',
        address: '123 Main Street, Downtown',
        district: 'Bangalore',
        lat: 12.9716,
        long: 77.5946,
        pincode: '560001',
        zone: 'Central',
        northSchedule: 'Residential Area',
        southSchedule: 'Commercial Zone',
        eastSchedule: 'Park',
        westSchedule: 'Highway',
        approvingAuthority: 'BBMP',
        approvedPlanNumber: 'BBMP/2024/001',
        planApprovalDate: '2024-01-15',
        reraStatus: 'Registered',
        reraId: 'KA-RERA-2024-001',
        totalInventories: 150,
        openParking: 50,
        coveredParking: 100,
        numberOfGarage: 25,
        openArea: 5000,
        coveredArea: 15000,
        landArea: 20000,
        builtUpArea: 18000,
        carpetArea: 12000,
        plinthArea: 16000,
        openParkingArea: 2000,
        coveredParkingArea: 4000,
        garageArea: 1000,
        waterSource: ['Municipal', 'Borewell'],
        floorAreaRatio: 2.5,
        totalTowers: 3,
        developmentDetails: [
            {
                id: 'dev_1',
                slNo: 1,
                typeOfInventory: '2 BHK',
                noOfInventory: 50,
                carpetAreaSqMtr: 1200,
                areaOfExclusiveBalconyVerandahSqMtr: 150,
                areaOfExclusiveOpenTerraceSqMtr: 200,
            },
        ],
        towerDetails: [
            {
                id: 'tower_1',
                towerName: 'Tower A',
                tower: 'Tower A',
                type: 'Residential',
                noOfFloors: 15,
                totalUnits: 50,
                stilts: 1,
                slabs: 15,
                basement: 1,
                parking: 25,
                heightFeet: 150,
                floorPlanDetails: [],
                unitDetails: [],
            },
        ],
        apartments: [
            {
                id: 'apt_1',
                aptType: 'Simplex',
                typology: '2 BHK',
                superBuiltUpArea: 1400,
                carpetArea: 1200,
                currentPricePerSqft: 8000,
                totalPrice: 11200000,
            },
        ],
        villas: [],
        plots: [],
        amenities: ['Swimming Pool', 'Gym', 'Garden', 'Security', 'Parking'],
        clubhouseDetails: [
            {
                id: 'club_1',
                name: 'Main Clubhouse',
                sizeSqft: '5000',
                floor: 'Ground',
            },
        ],
        groundFloor: {
            findOutTheTypeOfLaunchPerYearWill: '8000',
        },
        developerInfo: {
            promoterName: 'Sunrise Developers Ltd',
        },
        typologyAndUnitPlan: ['https://example.com/plan1.pdf', 'https://example.com/plan2.pdf'],
        brochureURL: ['https://example.com/brochure.pdf'],
        costSheetURL: ['https://example.com/costsheet.pdf'],
        litigation: 'https://example.com/litigation.pdf',
        projectStartDate: 1704067200, // Unix timestamp for 2024-01-01
        handoverDate: 1735689600, // Unix timestamp for 2025-01-01
    },
    {
        projectName: 'Green Valley Heights',
        projectDescription: 'Eco-friendly residential project with sustainable features',
        projectType: 'Residential',
        projectSubType: 'Villa',
        projectStatus: 'Planning',
        promoterName: 'Green Valley Developers',
        address: '456 Green Street, Suburb',
        district: 'Mumbai',
        lat: 19.076,
        long: 72.8777,
        pincode: '400001',
        zone: 'Western',
        northSchedule: 'Residential Area',
        southSchedule: 'Commercial Zone',
        eastSchedule: 'Park',
        westSchedule: 'Highway',
        approvingAuthority: 'MCGM',
        approvedPlanNumber: 'MCGM/2024/002',
        planApprovalDate: '2024-02-01',
        reraStatus: 'Pending',
        reraId: 'MH-RERA-2024-002',
        totalInventories: 75,
        openParking: 30,
        coveredParking: 45,
        numberOfGarage: 15,
        openArea: 3000,
        coveredArea: 8000,
        landArea: 12000,
        builtUpArea: 10000,
        carpetArea: 7000,
        plinthArea: 9000,
        openParkingArea: 1200,
        coveredParkingArea: 1800,
        garageArea: 600,
        waterSource: ['Municipal', 'Rainwater Harvesting'],
        floorAreaRatio: 2.0,
        totalTowers: 2,
        developmentDetails: [
            {
                id: 'dev_2',
                slNo: 1,
                typeOfInventory: '3 BHK Villa',
                noOfInventory: 25,
                carpetAreaSqMtr: 2000,
                areaOfExclusiveBalconyVerandahSqMtr: 300,
                areaOfExclusiveOpenTerraceSqMtr: 400,
            },
        ],
        towerDetails: [
            {
                id: 'tower_2',
                towerName: 'Villa Block A',
                tower: 'Villa Block A',
                type: 'Residential',
                noOfFloors: 3,
                totalUnits: 25,
                stilts: 0,
                slabs: 3,
                basement: 0,
                parking: 15,
                heightFeet: 30,
                floorPlanDetails: [],
                unitDetails: [],
            },
        ],
        apartments: [],
        villas: [
            {
                id: 'villa_1',
                villaType: 'UDS',
                typology: '3 BHK',
                plotSize: 2000,
                builtUpArea: 1800,
                carpetArea: 1500,
                currentPricePerSqft: 12000,
                totalPrice: 21600000,
                uds: 'Yes',
                udsPercentage: 60,
                udsArea: 1200,
                numberOfFloors: 3,
            },
        ],
        plots: [],
        amenities: ['Private Garden', 'Solar Panels', 'Rainwater Harvesting', 'Security', 'Parking'],
        clubhouseDetails: [
            {
                id: 'club_2',
                name: 'Villa Clubhouse',
                sizeSqft: '3000',
                floor: 'Ground',
            },
        ],
        groundFloor: {
            findOutTheTypeOfLaunchPerYearWill: '12000',
        },
        developerInfo: {
            promoterName: 'Green Valley Developers',
        },
        typologyAndUnitPlan: ['https://example.com/villa-plan1.pdf'],
        brochureURL: ['https://example.com/villa-brochure.pdf'],
        costSheetURL: ['https://example.com/villa-costsheet.pdf'],
        litigation: 'https://example.com/villa-litigation.pdf',
        projectStartDate: 1706745600, // Unix timestamp for 2024-02-01
        handoverDate: 1738368000, // Unix timestamp for 2025-02-01
    },
]

export const addSamplePrimaryData = async () => {
    try {
        const collectionRef = collection(db, 'restack_primary_properties')

        for (const property of samplePrimaryProperties) {
            await addDoc(collectionRef, property)
            console.log('Added sample property:', property.projectName)
        }

        console.log('Sample data added successfully!')
    } catch (error) {
        console.error('Error adding sample data:', error)
    }
}
