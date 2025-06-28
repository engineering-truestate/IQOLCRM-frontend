export type FieldType =
    | 'text'
    | 'dropdown'
    | 'upload'
    | 'multiChoice'
    | 'singleChoice'
    | 'tabs'
    | 'number'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'projectName'

export interface FormField {
    id: string
    label: string
    type: FieldType
    required?: boolean
    placeholder?: string
    options?: { label: string; value: string }[]
    validation?: {
        min?: number
        max?: number
        pattern?: RegExp
        message?: string
    }
    gridCols?: 1 | 2 // For layout
    group?: string
}

export interface FormSection {
    title: string
    fields: FormField[]
}

export type PropertyType = 'apartments' | 'villa' | 'plot' | 'rowhouse' | 'villament' | 'independent'

// Common fields used across property types
const commonFields: FormField[] = [
    {
        id: 'communityType',
        label: 'Community Type',
        type: 'radio',
        required: true,
        options: [
            { label: 'Gated', value: 'gated' },
            { label: 'Independent', value: 'independent' },
        ],
    },
    {
        id: 'projectName',
        label: 'Project Name',
        type: 'projectName',
        required: true,
        placeholder: 'Search Project Name',
    },
    {
        id: 'sbua',
        label: 'SBUA',
        type: 'number',
        required: true,
        placeholder: '1500',
        gridCols: 1,
    },
    {
        id: 'carpetArea',
        label: 'Carpet Area',
        type: 'number',
        placeholder: '1500',
        gridCols: 1,
    },
    {
        id: 'floorNo',
        label: 'Floor No.',
        type: 'number',
        required: true,
        placeholder: '0000',
        gridCols: 1,
    },
    {
        id: 'doorFacing',
        label: 'Door Facing',
        type: 'dropdown',
        required: true,
        placeholder: 'Select',
        gridCols: 1,
        options: [
            { label: 'North', value: 'north' },
            { label: 'South', value: 'south' },
            { label: 'East', value: 'east' },
            { label: 'West', value: 'west' },
            { label: 'North-East', value: 'northeast' },
            { label: 'North-West', value: 'northwest' },
            { label: 'South-East', value: 'southeast' },
            { label: 'South-West', value: 'southwest' },
        ],
    },
    {
        id: 'unitNo',
        label: 'Unit No.',
        gridCols: 1,
        type: 'text',
        placeholder: 'A1234',
    },
    {
        id: 'furnishing',
        label: 'Furnishing',
        type: 'dropdown',
        gridCols: 1,
        placeholder: 'Select',
        options: [
            { label: 'Fully Furnished', value: 'fully' },
            { label: 'Semi Furnished', value: 'semi' },
            { label: 'Unfurnished', value: 'unfurnished' },
        ],
    },
    {
        id: 'totalAskPrice',
        label: 'Total Ask Price',
        type: 'number',
        required: true,
        placeholder: 'Rs 2700 /Sq ft',
    },
    {
        id: 'handoverDate',
        label: 'Handover Date',
        type: 'text',
        placeholder: 'MM/YYYY',
    },
    {
        id: 'readyToMove',
        label: 'Ready-to-move',
        type: 'checkbox',
    },
    {
        id: 'balconyFacing',
        label: 'Balcony Facing',
        type: 'radio',
        options: [
            { label: 'Inside', value: 'inside' },
            { label: 'Outside', value: 'outside' },
        ],
    },
    {
        id: 'ageOfBuilding',
        label: 'Age of the Building',
        gridCols: 1,
        type: 'dropdown',
        placeholder: '0000',
        options: [
            { label: 'Under Construction', value: 'under_construction' },
            { label: '0-1 years', value: '0-1' },
            { label: '1-5 years', value: '1-5' },
            { label: '5-10 years', value: '5-10' },
            { label: '10+ years', value: '10+' },
        ],
    },
    {
        id: 'insideOutsideFacing',
        label: 'Inside or Outside Facing',
        gridCols: 1,
        type: 'dropdown',
        placeholder: 'Select',
        options: [
            { label: 'Inside Facing', value: 'inside' },
            { label: 'Outside Facing', value: 'outside' },
        ],
    },
    {
        id: 'furnishingDetails',
        label: 'Furnishing',
        gridCols: 1,
        type: 'dropdown',
        placeholder: 'Select',
        options: [
            { label: 'Fully Furnished', value: 'fully' },
            { label: 'Semi Furnished', value: 'semi' },
            { label: 'Unfurnished', value: 'unfurnished' },
        ],
    },
    {
        id: 'ups',
        gridCols: 1,
        label: 'UPS',
        type: 'text',
        placeholder: '0000',
    },
    {
        id: 'carPark',
        label: 'Car Park',
        gridCols: 1,
        type: 'text',
        placeholder: '0000',
    },
    {
        id: 'cornerUnit',
        label: 'Corner Unit',
        type: 'checkbox',
    },
    {
        id: 'ocReceived',
        label: 'OC received',
        type: 'checkbox',
    },
    {
        id: 'tenanted',
        label: 'Tenanted',
        type: 'checkbox',
    },
    {
        id: 'rentalIncome',
        label: 'Rental Income',
        type: 'text',
        placeholder: 'Type here',
    },
    {
        id: 'exclusive',
        label: 'Exclusive',
        type: 'checkbox',
    },
    {
        id: 'buildingKhata',
        gridCols: 1,
        label: 'Building Khata',
        type: 'dropdown',
        placeholder: 'Select',
        options: [
            { label: 'A Khata', value: 'a_khata' },
            { label: 'B Khata', value: 'b_khata' },
            { label: 'Khata Conversion in Progress', value: 'conversion' },
        ],
    },
    {
        id: 'landKhata',
        gridCols: 1,
        label: 'Land Khata',
        type: 'dropdown',
        placeholder: 'Select',
        options: [
            { label: 'A Khata', value: 'a_khata' },
            { label: 'B Khata', value: 'b_khata' },
            { label: 'Khata Conversion in Progress', value: 'conversion' },
        ],
    },
    {
        id: 'eKhata',
        label: 'E-Khata',
        type: 'checkbox',
    },
    {
        id: 'biappaApprovedKhata',
        label: 'BIAPPA approved khata',
        type: 'checkbox',
    },
    {
        id: 'bdaApprovedKhata',
        label: 'BDA approved khata',
        type: 'checkbox',
    },
    {
        id: 'fileUpload',
        label: 'Upload Files',
        type: 'upload',
    },
    {
        id: 'extraDetails',
        label: 'Extra Details',
        type: 'textarea',
        placeholder: 'Type here',
    },
]

// Apartment specific fields
const apartmentFields: FormField[] = [
    {
        id: 'apartmentType',
        label: 'Apartment Type',
        type: 'tabs',
        required: true,
        options: [
            { label: 'Simplex', value: 'simplex' },
            { label: 'Duplex', value: 'duplex' },
            { label: 'Triplex', value: 'triplex' },
            { label: 'Penthouse', value: 'penthouse' },
        ],
    },
    {
        id: 'bedrooms',
        label: 'No. of Bedrooms',
        type: 'tabs',
        required: true,
        options: [
            { label: '1 BHK', value: '1' },
            { label: '2 BHK', value: '2' },
            { label: '3 BHK', value: '3' },
            { label: '4 BHK', value: '4' },
            { label: '5 BHK', value: '5' },
            { label: '1 BHK', value: '6' },
        ],
    },
    {
        id: 'extraRoom',
        label: 'Extra Room',
        type: 'multiChoice',
        options: [
            { label: 'Servant Room', value: 'servant' },
            { label: 'Study Room', value: 'study' },
        ],
    },
    {
        id: 'bathrooms',
        label: 'No. of Bathrooms',
        type: 'tabs',
        options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
            { label: '7', value: '7' },
            { label: '8', value: '8' },
            { label: '9', value: '9' },
        ],
    },
    {
        id: 'balconies',
        label: 'No. of Balconies',
        type: 'tabs',
        options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6', value: '6' },
            { label: '7', value: '7' },
            { label: '8', value: '8' },
            { label: '9', value: '9' },
        ],
    },
]

// Villa specific fields
const villaFields: FormField[] = [
    {
        id: 'villaType',
        label: 'Villa Type',
        type: 'tabs',
        required: true,
        options: [
            { label: 'Independent', value: 'independent' },
            { label: 'Row Villa', value: 'row' },
            { label: 'Twin Villa', value: 'twin' },
        ],
    },
    {
        id: 'plotSize',
        label: 'Plot Size',
        type: 'number',
        placeholder: '2400',
        gridCols: 1,
    },
    {
        id: 'builtUpArea',
        label: 'Built-up Area',
        type: 'number',
        placeholder: '1800',
        gridCols: 1,
    },
    {
        id: 'bedrooms',
        label: 'No. of Bedrooms',
        type: 'tabs',
        required: true,
        options: [
            { label: '2 BHK', value: '2' },
            { label: '3 BHK', value: '3' },
            { label: '4 BHK', value: '4' },
            { label: '5 BHK', value: '5' },
            { label: '6+ BHK', value: '6+' },
        ],
    },
    {
        id: 'bathrooms',
        label: 'No. of Bathrooms',
        type: 'tabs',
        options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '6+', value: '6+' },
        ],
    },
    {
        id: 'parking',
        label: 'Parking',
        type: 'tabs',
        options: [
            { label: '1 Car', value: '1' },
            { label: '2 Cars', value: '2' },
            { label: '3+ Cars', value: '3+' },
        ],
    },
    {
        id: 'garden',
        label: 'Garden',
        type: 'checkbox',
    },
    {
        id: 'swimmingPool',
        label: 'Swimming Pool',
        type: 'checkbox',
    },
]

// Plot specific fields
const plotFields: FormField[] = [
    {
        id: 'plotType',
        label: 'Plot Type',
        type: 'tabs',
        required: true,
        options: [
            { label: 'Residential', value: 'residential' },
            { label: 'Commercial', value: 'commercial' },
            { label: 'Industrial', value: 'industrial' },
            { label: 'Agricultural', value: 'agricultural' },
        ],
    },
    {
        id: 'plotSize',
        label: 'Plot Size',
        type: 'number',
        required: true,
        placeholder: '1200',
        gridCols: 1,
    },
    {
        id: 'plotDimensions',
        label: 'Plot Dimensions',
        type: 'text',
        placeholder: '30x40',
        gridCols: 1,
    },
    {
        id: 'roadWidth',
        label: 'Road Width',
        type: 'number',
        placeholder: '30',
        gridCols: 1,
    },
    {
        id: 'cornerPlot',
        label: 'Corner Plot',
        type: 'checkbox',
    },
    {
        id: 'boundaryWall',
        label: 'Boundary Wall',
        type: 'checkbox',
    },
]

// Row House specific fields
const rowhouseFields: FormField[] = [
    {
        id: 'rowhouseType',
        label: 'Row House Type',
        type: 'tabs',
        required: true,
        options: [
            { label: 'End Unit', value: 'end' },
            { label: 'Middle Unit', value: 'middle' },
            { label: 'Corner Unit', value: 'corner' },
        ],
    },
    {
        id: 'bedrooms',
        label: 'No. of Bedrooms',
        type: 'tabs',
        required: true,
        options: [
            { label: '2 BHK', value: '2' },
            { label: '3 BHK', value: '3' },
            { label: '4 BHK', value: '4' },
            { label: '5 BHK', value: '5' },
        ],
    },
    {
        id: 'floors',
        label: 'No. of Floors',
        type: 'tabs',
        options: [
            { label: '1 Floor', value: '1' },
            { label: '2 Floors', value: '2' },
            { label: '3 Floors', value: '3' },
        ],
    },
    {
        id: 'terrace',
        label: 'Terrace',
        type: 'checkbox',
    },
    {
        id: 'parking',
        label: 'Parking',
        type: 'tabs',
        options: [
            { label: '1 Car', value: '1' },
            { label: '2 Cars', value: '2' },
        ],
    },
]

// Form configuration for each property type
export const formConfigs: Record<PropertyType, FormSection[]> = {
    apartments: [
        {
            title: 'Basic Information',
            fields: [
                ...commonFields.filter((field) =>
                    [
                        'communityType',
                        'projectName',
                        'sbua',
                        'carpetArea',
                        'floorNo',
                        'doorFacing',
                        'unitNo',
                        'furnishing',
                    ].includes(field.id),
                ),
                ...apartmentFields,
            ],
        },
        {
            title: 'Pricing & Availability',
            fields: commonFields.filter((field) => ['totalAskPrice', 'handoverDate', 'readyToMove'].includes(field.id)),
        },
        {
            title: 'Additional Details',
            fields: commonFields.filter((field) =>
                [
                    'balconyFacing',
                    'ageOfBuilding',
                    'insideOutsideFacing',
                    'ups',
                    'carPark',
                    'cornerUnit',
                    'ocReceived',
                    'tenanted',
                    'rentalIncome',
                    'exclusive',
                ].includes(field.id),
            ),
        },
        {
            title: 'Legal Documents',
            fields: commonFields.filter((field) =>
                ['buildingKhata', 'landKhata', 'eKhata', 'biappaApprovedKhata', 'bdaApprovedKhata'].includes(field.id),
            ),
        },
        {
            title: 'Files & Notes',
            fields: commonFields.filter((field) => ['fileUpload', 'extraDetails'].includes(field.id)),
        },
    ],
    villa: [
        {
            title: 'Basic Information',
            fields: [
                ...commonFields.filter((field) =>
                    ['communityType', 'projectName', 'sbua', 'carpetArea', 'doorFacing', 'furnishing'].includes(
                        field.id,
                    ),
                ),
                ...villaFields,
            ],
        },
        {
            title: 'Pricing & Availability',
            fields: commonFields.filter((field) => ['totalAskPrice', 'handoverDate', 'readyToMove'].includes(field.id)),
        },
        {
            title: 'Additional Details',
            fields: commonFields.filter((field) =>
                ['ageOfBuilding', 'ups', 'cornerUnit', 'ocReceived', 'tenanted', 'rentalIncome', 'exclusive'].includes(
                    field.id,
                ),
            ),
        },
        {
            title: 'Legal Documents',
            fields: commonFields.filter((field) =>
                ['buildingKhata', 'landKhata', 'eKhata', 'biappaApprovedKhata', 'bdaApprovedKhata'].includes(field.id),
            ),
        },
        {
            title: 'Files & Notes',
            fields: commonFields.filter((field) => ['fileUpload', 'extraDetails'].includes(field.id)),
        },
    ],
    plot: [
        {
            title: 'Basic Information',
            fields: [
                ...commonFields.filter((field) => ['communityType', 'projectName', 'doorFacing'].includes(field.id)),
                ...plotFields,
            ],
        },
        {
            title: 'Pricing & Availability',
            fields: commonFields.filter((field) => ['totalAskPrice', 'handoverDate', 'readyToMove'].includes(field.id)),
        },
        {
            title: 'Legal Documents',
            fields: commonFields.filter((field) =>
                ['buildingKhata', 'landKhata', 'eKhata', 'biappaApprovedKhata', 'bdaApprovedKhata'].includes(field.id),
            ),
        },
        {
            title: 'Files & Notes',
            fields: commonFields.filter((field) => ['fileUpload', 'extraDetails'].includes(field.id)),
        },
    ],
    rowhouse: [
        {
            title: 'Basic Information',
            fields: [
                ...commonFields.filter((field) =>
                    ['communityType', 'projectName', 'sbua', 'carpetArea', 'doorFacing', 'furnishing'].includes(
                        field.id,
                    ),
                ),
                ...rowhouseFields,
            ],
        },
        {
            title: 'Pricing & Availability',
            fields: commonFields.filter((field) => ['totalAskPrice', 'handoverDate', 'readyToMove'].includes(field.id)),
        },
        {
            title: 'Additional Details',
            fields: commonFields.filter((field) =>
                [
                    'ageOfBuilding',
                    'ups',
                    'carPark',
                    'cornerUnit',
                    'ocReceived',
                    'tenanted',
                    'rentalIncome',
                    'exclusive',
                ].includes(field.id),
            ),
        },
        {
            title: 'Legal Documents',
            fields: commonFields.filter((field) =>
                ['buildingKhata', 'landKhata', 'eKhata', 'biappaApprovedKhata', 'bdaApprovedKhata'].includes(field.id),
            ),
        },
        {
            title: 'Files & Notes',
            fields: commonFields.filter((field) => ['fileUpload', 'extraDetails'].includes(field.id)),
        },
    ],
    villament: [
        {
            title: 'Basic Information',
            fields: [
                ...commonFields.filter((field) =>
                    [
                        'communityType',
                        'projectName',
                        'sbua',
                        'carpetArea',
                        'floorNo',
                        'doorFacing',
                        'unitNo',
                        'furnishing',
                    ].includes(field.id),
                ),
                ...apartmentFields.filter((field) => field.id !== 'apartmentType'),
                {
                    id: 'villamentType',
                    label: 'Villament Type',
                    type: 'tabs',
                    required: true,
                    options: [
                        { label: 'Ground Floor', value: 'ground' },
                        { label: 'Upper Floor', value: 'upper' },
                        { label: 'Duplex', value: 'duplex' },
                    ],
                },
            ],
        },
        {
            title: 'Pricing & Availability',
            fields: commonFields.filter((field) => ['totalAskPrice', 'handoverDate', 'readyToMove'].includes(field.id)),
        },
        {
            title: 'Additional Details',
            fields: commonFields.filter((field) =>
                [
                    'balconyFacing',
                    'ageOfBuilding',
                    'ups',
                    'carPark',
                    'cornerUnit',
                    'ocReceived',
                    'tenanted',
                    'rentalIncome',
                    'exclusive',
                ].includes(field.id),
            ),
        },
        {
            title: 'Legal Documents',
            fields: commonFields.filter((field) =>
                ['buildingKhata', 'landKhata', 'eKhata', 'biappaApprovedKhata', 'bdaApprovedKhata'].includes(field.id),
            ),
        },
        {
            title: 'Files & Notes',
            fields: commonFields.filter((field) => ['fileUpload', 'extraDetails'].includes(field.id)),
        },
    ],
    independent: [
        {
            title: 'Basic Information',
            fields: [
                ...commonFields.filter((field) =>
                    ['communityType', 'projectName', 'sbua', 'carpetArea', 'doorFacing', 'furnishing'].includes(
                        field.id,
                    ),
                ),
                {
                    id: 'independentType',
                    label: 'Independent Building Type',
                    type: 'tabs',
                    required: true,
                    options: [
                        { label: 'House', value: 'house' },
                        { label: 'Building', value: 'building' },
                        { label: 'Commercial', value: 'commercial' },
                    ],
                },
            ],
        },
        {
            title: 'Pricing & Availability',
            fields: commonFields.filter((field) => ['totalAskPrice', 'handoverDate', 'readyToMove'].includes(field.id)),
        },
        {
            title: 'Additional Details',
            fields: commonFields.filter((field) =>
                [
                    'ageOfBuilding',
                    'ups',
                    'carPark',
                    'cornerUnit',
                    'ocReceived',
                    'tenanted',
                    'rentalIncome',
                    'exclusive',
                ].includes(field.id),
            ),
        },
        {
            title: 'Legal Documents',
            fields: commonFields.filter((field) =>
                ['buildingKhata', 'landKhata', 'eKhata', 'biappaApprovedKhata', 'bdaApprovedKhata'].includes(field.id),
            ),
        },
        {
            title: 'Files & Notes',
            fields: commonFields.filter((field) => ['fileUpload', 'extraDetails'].includes(field.id)),
        },
    ],
}
