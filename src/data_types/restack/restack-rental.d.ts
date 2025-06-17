export interface RentalProperty {
    id: string
    projectName: string
    configuration: string
    propertyType: string
    builtUpArea: number
    carpetArea: number
    micromarket: string
    address: string
    price: number
    furnishingStatus: string
    ageOfProperty: string
    postedOn: number
    postedBy: string
    propertyId: string
    url: string
    description: string
    amenities: string[]
    images: string[]
    contactDetails: {
        name: string
        phone: string
        email: string
    }
    listingStatus: string
    deposit: number
    maintenance: number
    availableFrom: number
    preferredTenant: string
    parkingAvailable: boolean
    petsAllowed: boolean
    listedBy: string
}
