// RERA project types
export type ProjectStatus = 'Active' | 'Completed' | 'Planning'
export type DistrictType = 'Urban' | 'Rural'
export type ProjectType = 'Residential' | 'Commercial'

export interface RERAProject {
    id: string
    projectName: string
    registrationNumber: string
    district: DistrictType
    status: ProjectStatus
    projectStartDate: string
    proposedCompletionDate: string
    projectType: ProjectType
}

// Sample project names
const projectNames = [
    'Lakeside Residences',
    'Mountain View Estates',
    'Oceanfront Villas',
    'Riverbend Apartments',
    'Sunset Heights',
    'Greenfield Townhouses',
    'Valley View Condos',
    'Meadowbrook Estates',
    'Hillside Homes',
    'Garden City Plaza',
    'Skyline Towers',
    'Heritage Gardens',
    'Coastal Breeze',
    'Pine Valley Homes',
    'Metro Square',
    'Golden Gate Residency',
    'Silver Oak Apartments',
    'Royal Palms',
    'Crystal Bay',
    'Grand Vista',
]

// Function to generate RERA registration number
const generateRegistrationNumber = (): string => {
    const year = 2017 + Math.floor(Math.random() * 8) // 2017-2024
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    const randomId = Math.floor(Math.random() * 999999)
        .toString()
        .padStart(6, '0')
    const subCodes = ['125/1/446', '125/1/310', '125/1/309']
    const subCode = subCodes[Math.floor(Math.random() * subCodes.length)]

    const formattedDate = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`

    return `PRM/KA/RERA/${subCode}/PR/${formattedDate}/${randomId}`
}

// Function to generate random date
const generateRandomDate = (startYear: number, endYear: number): string => {
    const start = new Date(startYear, 0, 1)
    const end = new Date(endYear, 11, 31)
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
    return new Date(randomTime).toISOString().split('T')[0]
}

// Function to generate completion date based on start date
const generateCompletionDate = (startDate: string, status: ProjectStatus): string => {
    const start = new Date(startDate)
    let monthsToAdd: number

    switch (status) {
        case 'Completed':
            monthsToAdd = 8 + Math.floor(Math.random() * 12) // 8-20 months for completed
            break
        case 'Active':
            monthsToAdd = 12 + Math.floor(Math.random() * 18) // 12-30 months for active
            break
        case 'Planning':
            monthsToAdd = 18 + Math.floor(Math.random() * 24) // 18-42 months for planning
            break
        default:
            monthsToAdd = 12
    }

    const completion = new Date(start)
    completion.setMonth(completion.getMonth() + monthsToAdd)
    return completion.toISOString().split('T')[0]
}

// Function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
}

// Function to generate a single RERA project
export const generateProject = (id: number): RERAProject => {
    const statuses: ProjectStatus[] = ['Active', 'Completed', 'Planning']
    const districts: DistrictType[] = ['Urban', 'Rural']
    const projectTypes: ProjectType[] = ['Residential', 'Commercial']

    const status = getRandomItem(statuses)
    const startDate =
        status === 'Completed'
            ? generateRandomDate(2022, 2023)
            : status === 'Active'
              ? generateRandomDate(2023, 2024)
              : generateRandomDate(2024, 2024)

    return {
        id: `RERA-${id.toString().padStart(3, '0')}`,
        projectName: getRandomItem(projectNames),
        registrationNumber: generateRegistrationNumber(),
        district: getRandomItem(districts),
        status,
        projectStartDate: startDate,
        proposedCompletionDate: generateCompletionDate(startDate, status),
        projectType: getRandomItem(projectTypes),
    }
}

// Function to generate multiple RERA projects
export const generateRERAProjects = (count: number): RERAProject[] => {
    return Array.from({ length: count }, (_, index) => generateProject(index + 1))
}

// Default sample data that matches the image
export const sampleRERAProjects: RERAProject[] = [
    {
        id: 'RERA-001',
        projectName: 'Lakeside Residences',
        registrationNumber: 'PRM/KA/RERA/125/1/446/PR/171015/000268',
        district: 'Urban',
        status: 'Active',
        projectStartDate: '2024-01-15',
        proposedCompletionDate: '2024-12-31',
        projectType: 'Residential',
    },
    {
        id: 'RERA-002',
        projectName: 'Mountain View Estates',
        registrationNumber: 'PRM/KA/RERA/125/1/310/PR/171021/001028',
        district: 'Rural',
        status: 'Completed',
        projectStartDate: '2022-07-20',
        proposedCompletionDate: '2023-06-15',
        projectType: 'Commercial',
    },
    {
        id: 'RERA-003',
        projectName: 'Oceanfront Villas',
        registrationNumber: 'PRM/KA/RERA/125/1/309/PR/170913/000144',
        district: 'Urban',
        status: 'Planning',
        projectStartDate: '2024-05-01',
        proposedCompletionDate: '2025-03-20',
        projectType: 'Residential',
    },
    {
        id: 'RERA-004',
        projectName: 'Riverbend Apartments',
        registrationNumber: 'PRM/KA/RERA/125/1/446/PR/171014/000301',
        district: 'Urban',
        status: 'Active',
        projectStartDate: '2023-11-01',
        proposedCompletionDate: '2024-09-01',
        projectType: 'Residential',
    },
    {
        id: 'RERA-005',
        projectName: 'Sunset Heights',
        registrationNumber: 'PRM/KA/RERA/125/1/310/PR/171014/000192',
        district: 'Rural',
        status: 'Completed',
        projectStartDate: '2022-12-01',
        proposedCompletionDate: '2023-11-10',
        projectType: 'Commercial',
    },
    {
        id: 'RERA-006',
        projectName: 'Greenfield Townhouses',
        registrationNumber: 'PRM/KA/RERA/125/1/309/PR/171019/000051',
        district: 'Urban',
        status: 'Planning',
        projectStartDate: '2024-03-10',
        proposedCompletionDate: '2025-01-05',
        projectType: 'Residential',
    },
    {
        id: 'RERA-007',
        projectName: 'Valley View Condos',
        registrationNumber: 'PRM/KA/RERA/125/1/310/PR/170824/000032',
        district: 'Rural',
        status: 'Active',
        projectStartDate: '2023-09-20',
        proposedCompletionDate: '2024-11-15',
        projectType: 'Residential',
    },
    {
        id: 'RERA-008',
        projectName: 'Meadowbrook Estates',
        registrationNumber: 'PRM/KA/RERA/125/1/446/PR/171010/000003',
        district: 'Urban',
        status: 'Completed',
        projectStartDate: '2022-08-15',
        proposedCompletionDate: '2023-07-20',
        projectType: 'Commercial',
    },
    {
        id: 'RERA-009',
        projectName: 'Hillside Homes',
        registrationNumber: 'PRM/KA/RERA/125/1/446/PR/170819/000006',
        district: 'Rural',
        status: 'Completed',
        projectStartDate: '2022-10-15',
        proposedCompletionDate: '2023-08-22',
        projectType: 'Commercial',
    },
    {
        id: 'RERA-010',
        projectName: 'Garden City Plaza',
        registrationNumber: 'PRM/KA/RERA/125/1/309/PR/171205/000445',
        district: 'Urban',
        status: 'Active',
        projectStartDate: '2024-02-28',
        proposedCompletionDate: '2025-04-15',
        projectType: 'Commercial',
    },
    {
        id: 'RERA-011',
        projectName: 'Skyline Towers',
        registrationNumber: 'PRM/KA/RERA/125/1/446/PR/171118/000789',
        district: 'Urban',
        status: 'Planning',
        projectStartDate: '2024-06-10',
        proposedCompletionDate: '2026-01-20',
        projectType: 'Residential',
    },
    {
        id: 'RERA-012',
        projectName: 'Heritage Gardens',
        registrationNumber: 'PRM/KA/RERA/125/1/310/PR/170925/000156',
        district: 'Rural',
        status: 'Active',
        projectStartDate: '2023-12-05',
        proposedCompletionDate: '2024-10-30',
        projectType: 'Residential',
    },
]
