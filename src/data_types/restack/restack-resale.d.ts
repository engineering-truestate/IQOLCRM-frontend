export interface RestackResaleProperty {
    propertyId: string
    projectName: string
    propertyType: string
    subType: string
    configuration: string
    price: string
    pricePerSqft: number
    acres: number
    superBuiltUpArea: number
    totalUnits: number
    carpetArea: string
    reraId: string
    developer: string
    projectSize: string
    ageOfProperty: string
    projectAddress: string
    micromarket: string
    area: string
    status: string
    handoverDate: string
    launchDate: string
    maplink: string
    lat: number
    long: number
    inventoryDetails: {
        availability: string
        ageOfInventory: string
        facing: string
        overlooking: string
        url: string
        floorNumber: number
    }
    amenities: string[]
    aboutProject: {
        configuration: string
        towersandunits: string
        description: string
    }
    extraDetails: {
        beds: number
        baths: number
        balconies: number
        furnishing: string
    }
    priceHistory: {
        date: string
        price: number
    }[]
}
