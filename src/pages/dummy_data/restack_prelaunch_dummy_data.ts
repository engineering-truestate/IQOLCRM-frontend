// Pre-launch project types
export type ProjectStage = 'Pre Launch' | 'EC' | 'Under Construction' | 'Ready to Move' | 'Launched'

export interface PreLaunchProject {
    id: string
    pId: string
    projectName: string
    stage: ProjectStage
    tentativeStartDate: string
    location?: string
    developer?: string
    projectType?: string
}

// Sample developers and locations for variety
const developers = [
    'Sunrise Developers',
    'Shobha Limited',
    'Godrej Properties',
    'Birla Estates',
    'Prestige Group',
    'Brigade Group',
    'Sobha Limited',
]

const locations = [
    'Whitefield',
    'Electronic City',
    'Hebbal',
    'Sarjapur Road',
    'Marathahalli',
    'Koramangala',
    'Indiranagar',
    'Banashankari',
    'Rajajinagar',
    'Yelahanka',
]

const projectTypes = [
    'Residential Apartment',
    'Villa Community',
    'Plotted Development',
    'Mixed Use',
    'Commercial Complex',
]

// Sample project names
const projectNames = [
    'Sunrise Enclave',
    'Sunrise Greens',
    'Sunrise Enclave Phase 2',
    'Shobha Limited Tower',
    'Birla Evara',
    'Godrej Garden City',
    'Godrej Platinum',
    'Godrej Reserve',
    'Godrej Aqua',
    'Godrej Summit',
    'Godrej Nest',
    'Godrej Elements',
    'Prestige Lakeside',
    'Brigade Meadows',
    'Sobha Dream Acres',
    'Sobha Forest Edge',
    'Sobha Silicon Oaks',
    'Prestige Shantiniketan',
    'Brigade Cornerstone',
    'Sobha Royal Pavilion',
]

// Function to generate random date around the tentative start period
const generateTentativeStartDate = (): string => {
    const baseDate = new Date('2024-10-01')
    const randomDays = Math.floor(Math.random() * 180) // Random days within 6 months
    const randomDate = new Date(baseDate.getTime() + randomDays * 24 * 60 * 60 * 1000)
    return randomDate.toISOString().split('T')[0]
}

// Function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
}

// Function to generate a single pre-launch project
export const generateProject = (id: number): PreLaunchProject => {
    const stages: ProjectStage[] = ['Pre Launch', 'EC', 'Under Construction']

    return {
        id: `PRE-${id.toString().padStart(3, '0')}`,
        pId: `P${id.toString().padStart(4, '0')}`,
        projectName: getRandomItem(projectNames),
        stage: getRandomItem(stages),
        tentativeStartDate: generateTentativeStartDate(),
        location: getRandomItem(locations),
        developer: getRandomItem(developers),
        projectType: getRandomItem(projectTypes),
    }
}

// Function to generate multiple pre-launch projects
export const generatePreLaunchProjects = (count: number): PreLaunchProject[] => {
    return Array.from({ length: count }, (_, index) => generateProject(index + 1))
}

// Default sample data that matches the image
export const samplePreLaunchProjects: PreLaunchProject[] = [
    {
        id: 'PRE-001',
        pId: 'P0001',
        projectName: 'Sunrise Enclave',
        stage: 'Pre Launch',
        tentativeStartDate: '2024-10-01',
        location: 'Whitefield',
        developer: 'Sunrise Developers',
        projectType: 'Residential Apartment',
    },
    {
        id: 'PRE-002',
        pId: 'P0002',
        projectName: 'Sunrise Greens',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Electronic City',
        developer: 'Sunrise Developers',
        projectType: 'Villa Community',
    },
    {
        id: 'PRE-003',
        pId: 'P0003',
        projectName: 'Sunrise Enclave',
        stage: 'Pre Launch',
        tentativeStartDate: '2024-10-01',
        location: 'Hebbal',
        developer: 'Sunrise Developers',
        projectType: 'Residential Apartment',
    },
    {
        id: 'PRE-004',
        pId: 'P0004',
        projectName: 'Shobha Limited',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Sarjapur Road',
        developer: 'Shobha Limited',
        projectType: 'Mixed Use',
    },
    {
        id: 'PRE-005',
        pId: 'P0005',
        projectName: 'Birla Evara',
        stage: 'Pre Launch',
        tentativeStartDate: '2024-10-01',
        location: 'Marathahalli',
        developer: 'Birla Estates',
        projectType: 'Residential Apartment',
    },
    {
        id: 'PRE-006',
        pId: 'P0006',
        projectName: 'Godrej',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Koramangala',
        developer: 'Godrej Properties',
        projectType: 'Residential Apartment',
    },
    {
        id: 'PRE-007',
        pId: 'P0007',
        projectName: 'Godrej',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Indiranagar',
        developer: 'Godrej Properties',
        projectType: 'Residential Apartment',
    },
    {
        id: 'PRE-008',
        pId: 'P0008',
        projectName: 'Godrej',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Banashankari',
        developer: 'Godrej Properties',
        projectType: 'Villa Community',
    },
    {
        id: 'PRE-009',
        pId: 'P0009',
        projectName: 'Godrej',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Rajajinagar',
        developer: 'Godrej Properties',
        projectType: 'Plotted Development',
    },
    {
        id: 'PRE-010',
        pId: 'P0010',
        projectName: 'Godrej',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Yelahanka',
        developer: 'Godrej Properties',
        projectType: 'Residential Apartment',
    },
    {
        id: 'PRE-011',
        pId: 'P0011',
        projectName: 'Godrej',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Whitefield',
        developer: 'Godrej Properties',
        projectType: 'Commercial Complex',
    },
    {
        id: 'PRE-012',
        pId: 'P0012',
        projectName: 'Godrej',
        stage: 'EC',
        tentativeStartDate: '2024-10-01',
        location: 'Electronic City',
        developer: 'Godrej Properties',
        projectType: 'Mixed Use',
    },
]
