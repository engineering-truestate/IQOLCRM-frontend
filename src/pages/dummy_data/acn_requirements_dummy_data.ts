// types/requirements.ts
export interface RequirementData {
    reqId: string
    projectName: string
    assetType: string
    budget: string
    status: string
    intStatus: string
    lastUpdated: string
    agentName: string
    agentNumber: string
    type: 'resale' | 'rental'
    location: string
    creationDate: string
    size: string
    bedrooms: string
    bathrooms: string
    parking: string
    details: string
    matchedPropertyIds: string[]
    notes: Note[]
}

export interface Note {
    id: string
    author: string
    content: string
    timestamp: string
}

// data/requirementsData.ts
export const generateRequirements = (): RequirementData[] => {
    const assetTypes = ['Apartment', 'Villa', 'Townhouse', 'Studio', 'Penthouse']
    const requirementStatuses = ['Open', 'Close']
    const internalStatuses = ['Found', 'Not Found', 'Pending']
    const agents = ['Sophia Bennett', 'John Smith', 'Sarah Wilson', 'Michael Brown']
    const agentNumbers = ['8118823650', '9876543210', '8765432109', '7654321098']
    const budgets = ['1 cr to 2 cr', '70 Lakh', '50 Lakh to 1 cr', '2 cr to 3 cr', '3 cr+']
    const projects = [
        'The Grand Residences, Downtown',
        'Skyline Towers, Banjara Hills',
        'Green Valley Apartments, Gachibowli',
        'Royal Heights, Jubilee Hills',
        'Paradise Homes, Kondapur',
        'Luxury Villas at Banjara Hills with Premium Amenities and Modern Architecture',
        'Premium Apartments in the Heart of Financial District with World Class Facilities',
        'Executive Townhouses in Gachibowli Tech Hub Area',
        'Spacious 3BHK Apartments in Hitech City with Swimming Pool and Gym',
        'Modern Penthouses in Madhapur with Panoramic City Views',
        'Budget-Friendly 2BHK Flats in Miyapur with All Basic Amenities',
        'Ultra-Luxury Villas in Jubilee Hills with Private Gardens and Security',
    ]
    const locations = [
        'Whitefield',
        'Banjara Hills',
        'Gachibowli',
        'Jubilee Hills',
        'Kondapur',
        'Hitech City',
        'Madhapur',
        'Miyapur',
    ]
    const sizes = [
        '2,000 - 2,500 sq ft',
        '1,500 - 2,000 sq ft',
        '1,000 - 1,500 sq ft',
        '2,500 - 3,000 sq ft',
        '3,000+ sq ft',
    ]
    const bedrooms = ['2-3', '3-4', '1-2', '4-5']
    const bathrooms = ['2-3', '3-4', '1-2', '4-5']
    const parkingOptions = ['1-car garage', '2-car garage', 'No parking', 'Street parking']
    const types: ('resale' | 'rental')[] = ['resale', 'rental']

    return Array.from({ length: 200 }, (_, i) => {
        const reqId = `RQA${String(i + 1).padStart(3, '0')}`

        // Generate some matched property IDs for some requirements
        const hasMatchedProperties = Math.random() > 0.6
        const matchedPropertyIds = hasMatchedProperties
            ? Array.from(
                  { length: Math.floor(Math.random() * 4) + 1 },
                  (_, j) => `PA${String(Math.floor(Math.random() * 1000) + 1).padStart(5, '0')}`,
              )
            : []

        // Generate notes for some requirements
        const hasNotes = Math.random() > 0.7
        const notes: Note[] = hasNotes
            ? [
                  {
                      id: `note_${reqId}_1`,
                      author: 'Samarth',
                      content:
                          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it .....",
                      timestamp: '25 May',
                  },
                  {
                      id: `note_${reqId}_2`,
                      author: 'Siddharth',
                      content:
                          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it .....",
                      timestamp: '25 May',
                  },
              ]
            : []

        return {
            reqId,
            projectName: projects[Math.floor(Math.random() * projects.length)],
            assetType: assetTypes[Math.floor(Math.random() * assetTypes.length)],
            budget: budgets[Math.floor(Math.random() * budgets.length)],
            status: requirementStatuses[Math.floor(Math.random() * requirementStatuses.length)],
            intStatus: internalStatuses[Math.floor(Math.random() * internalStatuses.length)],
            lastUpdated: `2024-07-${String(Math.floor(1 + Math.random() * 31)).padStart(2, '0')}`,
            agentName: agents[Math.floor(Math.random() * agents.length)],
            agentNumber: agentNumbers[Math.floor(Math.random() * agentNumbers.length)],
            type: types[Math.floor(Math.random() * types.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            creationDate: `2024-07-${String(Math.floor(1 + Math.random() * 31)).padStart(2, '0')}`,
            size: sizes[Math.floor(Math.random() * sizes.length)],
            bedrooms: bedrooms[Math.floor(Math.random() * bedrooms.length)],
            bathrooms: bathrooms[Math.floor(Math.random() * bathrooms.length)],
            parking: parkingOptions[Math.floor(Math.random() * parkingOptions.length)],
            details:
                'Swimming pool, Landscaped yardSwimming pool, Landscaped yardSwimming pool, Landscaped yardSwimming pool, Landscaped yardSwimming pool, Landscaped yardSwimming pool, Landscaped yardSwimming pool, Landscaped yard',
            matchedPropertyIds,
            notes,
        }
    })
}
