export interface RestackRentalProperty {
    propertyId: string
    propertyName: string
    description: string
    configuration: string
    name?: string
    superBuiltUpArea: number
    carpetArea: number
    builtUpArea: number
    price: number
    micromarket: string
    location: string
    address: string
    furnishing: string
    ageOfProperty: number
    createdAt: string
    postedBy: string
    url: string
    about: string
    scrapedAt: string
    priceHistory: {
        date: string
        price: number
    }[]
}
