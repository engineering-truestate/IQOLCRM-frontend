# pre Rera properties Schema

This document describes the simplified data schema for real estate project listings and summary views, covering essential project information, developer details, and key specifications.

---

## Schema Overview

The **pre Rera properties** collection stores essential information about real estate projects for listing views, search results, and summary displays. This schema focuses on key project details without the comprehensive regulatory and financial information.

---

## pre-rera-properties (Collection Name - pre-rera-properties)

Stores essential project information for public listings, search results, and summary views.

### Basic Project Information

| Field            | Type          | Options / Enum                             | Example                                         |
| ---------------- | ------------- | ------------------------------------------ | ----------------------------------------------- |
| projectId        | string        | –                                          | "PA001"                                         |
| projectName\*    | string        | –                                          | "VR Shobha Meadows"                             |
| projectType      | string (enum) | residential, commercial, mixed-use,plotted | "residential"                                   |
| sizes            | string        | –                                          | "1200-1800 sq ft"                               |
| projectSize      | string        | –                                          | "5 Acres"                                       |
| launchDate       | number (TS)   | –                                          | 1640995200                                      |
| possessionStarts | string        | –                                          | "2024"                                          |
| configurations   | string        | –                                          | "2, 3 BHK"                                      |
| reraId           | string        | –                                          | "PRM/KA/R/2021/12/234"                          |
| description      | string        | –                                          | "VR Shobha Meadows is a residential project..." |
| totalUnits       | number        | –                                          | 250                                             |

### Developer Information

| Field              | Type          | Options / Enum | Example             |
| ------------------ | ------------- | -------------- | ------------------- |
| developerName      | string        | –              | "Shobha Developers" |
| developerLegalName | string        | –              | "Shobha Limited"    |
| developerTier      | string (enum) | A, B, C, D     | "A"                 |

### Location Details

| Field       | Type   | Options / Enum | Example                   |
| ----------- | ------ | -------------- | ------------------------- |
| address     | string | –              | "123, MG Road, Bangalore" |
| district    | string | –              | "Bangalore Central"       |
| zone        | string | –              | "Central"                 |
| Lat         | number | –              | 12.9716                   |
| Long        | number | –              | 77.5946                   |
| micromarket | string | –              | "MG Road"                 |

### Project Timeline

| Field                | Type        | Options / Enum | Example    |
| -------------------- | ----------- | -------------- | ---------- |
| startDate            | number (TS) | –              | 1609459200 |
| handoverDate         | number (TS) | –              | 1735689600 |
| ageOfBuildinginYears | number      | –              | 2          |

### Tower Information

| Field        | Type          | Options / Enum | Example   |
| ------------ | ------------- | -------------- | --------- |
| TowerDetails | array<object> | –              | –         |
| ├─ name      | string        | –              | "Tower 1" |
| └─ floors    | number        | –              | 12        |

### Amenities and Features

| Field     | Type          | Options / Enum | Example                                                  |
| --------- | ------------- | -------------- | -------------------------------------------------------- |
| amenities | array<string> | –              | ["Electrification, Water supply and Sanitary Finishing"] |

### Documentation and Media

| Field         | Type          | Options / Enum | Example             |
| ------------- | ------------- | -------------- | ------------------- |
| brochureURL   | string        | –              | "brochureURL.pdf"   |
| masterPlanURL | string        | –              | "masterPlanURL.pdf" |
| unitandfloor  | array<string> | –              | []                  |

### Legal and Regulatory

| Field     | Type          | Options / Enum | Example |
| --------- | ------------- | -------------- | ------- |
| khataType | string (enum) | A, B           | "A"     |

### Project Status

| Field  | Type          | Options / Enum                                 | Example  |
| ------ | ------------- | ---------------------------------------------- | -------- |
| status | string (enum) | active, inactive, completed, on-hold, sold-out | "active" |

### Metadata

| Field     | Type        | Options / Enum | Example    |
| --------- | ----------- | -------------- | ---------- |
| createdAt | number (TS) | –              | 1640995200 |
| updatedAt | number (TS) | –              | 1640995200 |

---

## Common Enum Values

### Project Types

- **residential**: Residential projects (apartments, villas, plots)
- **commercial**: Commercial developments (offices, retail, warehouses)
- **mixed-use**: Projects with both residential and commercial components
- **plotted**: Subdivided land plots with basic infrastructure

### Project Status

- **active**: Project currently available for sale/booking
- **inactive**: Project temporarily not accepting bookings
- **completed**: Project construction completed
- **on-hold**: Project development temporarily paused
- **sold-out**: All units sold, no longer available

### Zones (Bangalore Context)

- **Central**: Central Bangalore area
- **North**: North Bangalore
- **South**: South Bangalore
- **East**: East Bangalore
- **West**: West Bangalore

---

## Field Descriptions

### Timeline Fields

- **launchDate**: When the project was officially launched for sales
- **startDate**: When construction/development began
- **handoverDate**: Expected/actual date of possession
- **possessionStarts**: Year when possession is expected to begin

### Size and Configuration

- **sizes**: Range of unit sizes available (e.g., "1200-1800 sq ft")
- **configurations**: Available BHK configurations (e.g., "2, 3 BHK")
- **projectSize**: Total project area (e.g., "5 Acres")

### Amenities Format

Amenities are stored as an array of strings, where each string can describe:

- Individual amenities (e.g., "Swimming Pool")
- Grouped amenities (e.g., "Electrification, Water supply and Sanitary Finishing")
- Infrastructure features (e.g., "Fire prevention and fire fighting")

---

**Notes:**

- All timestamps are Unix timestamps (seconds since epoch)
- Coordinates use decimal degrees format
- String fields can be empty if data is not available
- This schema prioritizes simplicity and performance over comprehensive data
- For detailed project information, refer to the comprehensive project schema
