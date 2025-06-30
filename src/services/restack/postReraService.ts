import { db } from '../../firebase'
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where } from 'firebase/firestore'
import type { PostReraProperty, PostReraPropertyFilters } from '../../store/reducers/restack/postReraTypes'

const COLLECTION_NAME = 'restackPostReraProperties'

const PostReraService = {
    async fetchProperties(filters?: PostReraPropertyFilters): Promise<PostReraProperty[]> {
        try {
            const collectionRef = collection(db, COLLECTION_NAME)

            let q = filters ? query(collectionRef) : collectionRef

            if (filters) {
                // Apply filters to the query
                if (filters.projectType) {
                    q = query(q, where('projectType', '==', filters.projectType))
                }
                // Add more filters as needed based on your data structure
            }

            const querySnapshot = await getDocs(q as any)
            const properties: PostReraProperty[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data() as any // Explicitly cast to any
                const property: PostReraProperty = {
                    projectId: doc.id,
                    projectName: data.projectName,
                    projectType: data.projectType,
                    projectDescription: data.projectDescription,
                    projectSubType: data.projectSubType,
                    projectStatus: data.projectStatus,
                    projectStartDate: data.projectStartDate,
                    handoverDate: data.handoverDate,
                    reraID: data.reraID,
                    acknowledgeNumber: data.acknowledgeNumber,
                    reraStatus: data.reraStatus,
                    developerName: data.developerName,
                    promoterName: data.promoterName,
                    developerLegalName: data.developerLegalName,
                    promoterLegalName: data.promoterLegalName,
                    developerTransferFee: data.developerTransferFee,
                    developerTier: data.developerTier,
                    currentPricePerSqft: data.currentPricePerSqft,
                    address: data.address,
                    lat: data.lat,
                    long: data.long,
                    mapLink: data.mapLink,
                    district: data.district,
                    taluk: data.taluk,
                    microMarket: data.microMarket,
                    subMicromarket: data.subMicromarket,
                    zone: data.zone,
                    pincode: data.pincode,
                    northSchedule: data.northSchedule,
                    southSchedule: data.southSchedule,
                    eastSchedule: data.eastSchedule,
                    westSchedule: data.westSchedule,
                    phaseDetails: data.phaseDetails,
                    totalOpenArea: data.totalOpenArea,
                    totalCoveredArea: data.totalCoveredArea,
                    totalLandArea: data.totalLandArea,
                    totalBuiltUpArea: data.totalBuiltUpArea,
                    totalCarpetArea: data.totalCarpetArea,
                    totalPlinthArea: data.totalPlinthArea,
                    openParkingArea: data.openParkingArea,
                    coveredParkingArea: data.coveredParkingArea,
                    garageArea: data.garageArea,
                    projectDensity: data.projectDensity,
                    localAuthority: data.localAuthority,
                    approvingAuthority: data.approvingAuthority,
                    planApprovalDate: data.planApprovalDate,
                    approvedPlanNumber: data.approvedPlanNumber,
                    totalInventories: data.totalInventories,
                    totalParking: data.totalParking,
                    openParking: data.openParking,
                    coveredParking: data.coveredParking,
                    numberOfGarage: data.numberOfGarage,
                    waterSource: data.waterSource,
                    developmentDetails: data.developmentDetails,
                    configurationDetails: data.configurationDetails,
                    totalTowers: data.totalTowers,
                    floorAreaRatio: data.floorAreaRatio,
                    towerDetails: data.towerDetails,
                    launchPricePerSqft: data.launchPricePerSqft,
                    Images: data.Images,
                    CDPMapURL: data.CDPMapURL,
                    costSheet: data.costSheet,
                    brochure: data.brochure,
                    masterPlanURL: data.masterPlanURL,
                    projectAmenities: data.projectAmenities,
                    clubHouseDetails: data.clubHouseDetails,
                    litigation: data.litigation,
                    affidavitLink: data.affidavitLink,
                    Complaints: data.Complaints,
                    documents: data.documents,
                    areaUnit: data.areaUnit,
                    lastUpdated: data.lastUpdated,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    sizes: data.sizes,
                    stockType: data.stockType,
                }
                properties.push(property)
            })
            return properties
        } catch (error: any) {
            throw new Error(`Failed to fetch post-rera properties: ${error.message}`)
        }
    },

    async addProperty(
        propertyData: Omit<PostReraProperty, 'projectId' | 'createdAt' | 'updatedAt'>,
    ): Promise<PostReraProperty> {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), propertyData)
            const docSnapshot = await getDoc(doc(db, COLLECTION_NAME, docRef.id))
            if (docSnapshot.exists()) {
                const data = docSnapshot.data() as any // Explicitly cast to any
                const property: PostReraProperty = {
                    projectId: docSnapshot.id,
                    projectName: data.projectName,
                    projectType: data.projectType,
                    projectDescription: data.projectDescription,
                    projectSubType: data.projectSubType,
                    projectStatus: data.projectStatus,
                    projectStartDate: data.projectStartDate,
                    handoverDate: data.handoverDate,
                    reraID: data.reraID,
                    acknowledgeNumber: data.acknowledgeNumber,
                    reraStatus: data.reraStatus,
                    developerName: data.developerName,
                    promoterName: data.promoterName,
                    developerLegalName: data.developerLegalName,
                    promoterLegalName: data.promoterLegalName,
                    developerTransferFee: data.developerTransferFee,
                    developerTier: data.developerTier,
                    currentPricePerSqft: data.currentPricePerSqft,
                    address: data.address,
                    lat: data.lat,
                    long: data.long,
                    mapLink: data.mapLink,
                    district: data.district,
                    taluk: data.taluk,
                    microMarket: data.microMarket,
                    subMicromarket: data.subMicromarket,
                    zone: data.zone,
                    pincode: data.pincode,
                    northSchedule: data.northSchedule,
                    southSchedule: data.southSchedule,
                    eastSchedule: data.eastSchedule,
                    westSchedule: data.westSchedule,
                    phaseDetails: data.phaseDetails,
                    totalOpenArea: data.totalOpenArea,
                    totalCoveredArea: data.totalCoveredArea,
                    totalLandArea: data.totalLandArea,
                    totalBuiltUpArea: data.totalBuiltUpArea,
                    totalCarpetArea: data.totalCarpetArea,
                    totalPlinthArea: data.totalPlinthArea,
                    openParkingArea: data.openParkingArea,
                    coveredParkingArea: data.coveredParkingArea,
                    garageArea: data.garageArea,
                    projectDensity: data.projectDensity,
                    localAuthority: data.localAuthority,
                    approvingAuthority: data.approvingAuthority,
                    planApprovalDate: data.planApprovalDate,
                    approvedPlanNumber: data.approvedPlanNumber,
                    totalInventories: data.totalInventories,
                    totalParking: data.totalParking,
                    openParking: data.openParking,
                    coveredParking: data.coveredParking,
                    numberOfGarage: data.numberOfGarage,
                    waterSource: data.waterSource,
                    developmentDetails: data.developmentDetails,
                    configurationDetails: data.configurationDetails,
                    totalTowers: data.totalTowers,
                    floorAreaRatio: data.floorAreaRatio,
                    towerDetails: data.towerDetails,
                    launchPricePerSqft: data.launchPricePerSqft,
                    Images: data.Images,
                    CDPMapURL: data.CDPMapURL,
                    costSheet: data.costSheet,
                    brochure: data.brochure,
                    masterPlanURL: data.masterPlanURL,
                    stockType: data.stockType,
                    projectAmenities: data.projectAmenities,
                    clubHouseDetails: data.clubHouseDetails,
                    litigation: data.litigation,
                    affidavitLink: data.affidavitLink,
                    Complaints: data.Complaints,
                    documents: data.documents,
                    areaUnit: data.areaUnit,
                    lastUpdated: data.lastUpdated,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    sizes: data.sizes,
                }
                return property
            } else {
                throw new Error('Failed to add post-rera property: Could not retrieve document after creation')
            }
        } catch (error: any) {
            throw new Error(`Failed to add post-rera property: ${error.message}`)
        }
    },

    async updateProperty(projectId: string, updates: Partial<PostReraProperty>): Promise<PostReraProperty> {
        try {
            const propertyDocRef = doc(db, COLLECTION_NAME, projectId)
            await updateDoc(propertyDocRef, updates)
            const docSnapshot = await getDoc(propertyDocRef)
            if (docSnapshot.exists()) {
                const data = docSnapshot.data() as any // Explicitly cast to any
                const property: PostReraProperty = {
                    projectId: docSnapshot.id,
                    projectName: data.projectName,
                    projectType: data.projectType,
                    projectDescription: data.projectDescription,
                    projectSubType: data.projectSubType,
                    projectStatus: data.projectStatus,
                    projectStartDate: data.projectStartDate,
                    handoverDate: data.handoverDate,
                    reraID: data.reraID,
                    acknowledgeNumber: data.acknowledgeNumber,
                    reraStatus: data.reraStatus,
                    developerName: data.developerName,
                    promoterName: data.promoterName,
                    developerLegalName: data.developerLegalName,
                    promoterLegalName: data.promoterLegalName,
                    developerTransferFee: data.developerTransferFee,
                    developerTier: data.developerTier,
                    currentPricePerSqft: data.currentPricePerSqft,
                    address: data.address,
                    lat: data.lat,
                    long: data.long,
                    mapLink: data.mapLink,
                    district: data.district,
                    taluk: data.taluk,
                    microMarket: data.microMarket,
                    subMicromarket: data.subMicromarket,
                    zone: data.zone,
                    pincode: data.pincode,
                    northSchedule: data.northSchedule,
                    southSchedule: data.southSchedule,
                    eastSchedule: data.eastSchedule,
                    westSchedule: data.westSchedule,
                    phaseDetails: data.phaseDetails,
                    totalOpenArea: data.totalOpenArea,
                    totalCoveredArea: data.totalCoveredArea,
                    totalLandArea: data.totalLandArea,
                    totalBuiltUpArea: data.totalBuiltUpArea,
                    totalCarpetArea: data.totalCarpetArea,
                    totalPlinthArea: data.totalPlinthArea,
                    openParkingArea: data.openParkingArea,
                    coveredParkingArea: data.coveredParkingArea,
                    garageArea: data.garageArea,
                    projectDensity: data.projectDensity,
                    localAuthority: data.localAuthority,
                    approvingAuthority: data.approvingAuthority,
                    planApprovalDate: data.planApprovalDate,
                    approvedPlanNumber: data.approvedPlanNumber,
                    totalInventories: data.totalInventories,
                    totalParking: data.totalParking,
                    openParking: data.openParking,
                    coveredParking: data.coveredParking,
                    numberOfGarage: data.numberOfGarage,
                    waterSource: data.waterSource,
                    developmentDetails: data.developmentDetails,
                    configurationDetails: data.configurationDetails,
                    totalTowers: data.totalTowers,
                    floorAreaRatio: data.floorAreaRatio,
                    towerDetails: data.towerDetails,
                    launchPricePerSqft: data.launchPricePerSqft,
                    Images: data.Images,
                    CDPMapURL: data.CDPMapURL,
                    costSheet: data.costSheet,
                    brochure: data.brochure,
                    projectAmenities: data.projectAmenities,
                    clubHouseDetails: data.clubHouseDetails,
                    litigation: data.litigation,
                    affidavitLink: data.affidavitLink,
                    Complaints: data.Complaints,
                    documents: data.documents,
                    areaUnit: data.areaUnit,
                    lastUpdated: data.lastUpdated,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    sizes: data.sizes,
                    masterPlanURL: data.masterPlanURL,
                    stockType: data.stockType,
                }
                return property
            } else {
                throw new Error('Failed to update post-rera property: Could not retrieve document after update')
            }
        } catch (error: any) {
            throw new Error(`Failed to update post-rera property: ${error.message}`)
        }
    },

    async getPropertyById(projectId: string): Promise<PostReraProperty> {
        try {
            const propertyDocRef = doc(db, COLLECTION_NAME, projectId)
            const docSnapshot = await getDoc(propertyDocRef)

            if (docSnapshot.exists()) {
                const data = docSnapshot.data() as any // Explicitly cast to any
                const property: PostReraProperty = {
                    projectId: docSnapshot.id,
                    projectName: data.projectName,
                    projectType: data.projectType,
                    projectDescription: data.projectDescription,
                    projectSubType: data.projectSubType,
                    projectStatus: data.projectStatus,
                    projectStartDate: data.projectStartDate,
                    handoverDate: data.handoverDate,
                    reraID: data.reraID,
                    acknowledgeNumber: data.acknowledgeNumber,
                    reraStatus: data.reraStatus,
                    developerName: data.developerName,
                    promoterName: data.promoterName,
                    developerLegalName: data.developerLegalName,
                    promoterLegalName: data.promoterLegalName,
                    developerTransferFee: data.developerTransferFee,
                    developerTier: data.developerTier,
                    currentPricePerSqft: data.currentPricePerSqft,
                    address: data.address,
                    lat: data.lat,
                    long: data.long,
                    mapLink: data.mapLink,
                    district: data.district,
                    taluk: data.taluk,
                    microMarket: data.microMarket,
                    subMicromarket: data.subMicromarket,
                    zone: data.zone,
                    pincode: data.pincode,
                    northSchedule: data.northSchedule,
                    southSchedule: data.southSchedule,
                    eastSchedule: data.eastSchedule,
                    westSchedule: data.westSchedule,
                    phaseDetails: data.phaseDetails,
                    totalOpenArea: data.totalOpenArea,
                    totalCoveredArea: data.totalCoveredArea,
                    totalLandArea: data.totalLandArea,
                    totalBuiltUpArea: data.totalBuiltUpArea,
                    totalCarpetArea: data.totalCarpetArea,
                    totalPlinthArea: data.totalPlinthArea,
                    openParkingArea: data.openParkingArea,
                    coveredParkingArea: data.coveredParkingArea,
                    garageArea: data.garageArea,
                    projectDensity: data.projectDensity,
                    localAuthority: data.localAuthority,
                    approvingAuthority: data.approvingAuthority,
                    planApprovalDate: data.planApprovalDate,
                    approvedPlanNumber: data.approvedPlanNumber,
                    totalInventories: data.totalInventories,
                    totalParking: data.totalParking,
                    openParking: data.openParking,
                    coveredParking: data.coveredParking,
                    numberOfGarage: data.numberOfGarage,
                    waterSource: data.waterSource,
                    developmentDetails: data.developmentDetails,
                    configurationDetails: data.configurationDetails,
                    totalTowers: data.totalTowers,
                    floorAreaRatio: data.floorAreaRatio,
                    towerDetails: data.towerDetails,
                    launchPricePerSqft: data.launchPricePerSqft,
                    Images: data.Images,
                    CDPMapURL: data.CDPMapURL,
                    costSheet: data.costSheet,
                    brochure: data.brochure,
                    projectAmenities: data.projectAmenities,
                    clubHouseDetails: data.clubHouseDetails,
                    litigation: data.litigation,
                    affidavitLink: data.affidavitLink,
                    Complaints: data.Complaints,
                    documents: data.documents,
                    areaUnit: data.areaUnit,
                    lastUpdated: data.lastUpdated,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    sizes: data.sizes,
                    masterPlanURL: data.masterPlanURL,
                    stockType: data.stockType,
                }
                console.log('Fetched post-rera property:', property)
                return property
            } else {
                throw new Error('Failed to fetch post-rera property: Document does not exist')
            }
        } catch (error: any) {
            throw new Error(`Failed to fetch post-rera property: ${error.message}`)
        }
    },

    // Removed searchProperties as it's not directly supported in Firestore without additional indexing
}

export default PostReraService
