# Restack Pre-Launch Properties Schema

This document describes the data schema for the Restack pre-launch properties system, covering all major fields and their configurations.

---

## Schema Overview

The **pre-launch properties** collection stores comprehensive information about real estate projects in their pre-launch phase, including project details, configurations, amenities, regulatory approvals, and unit specifications.

---

## pre_launch_properties (Collection Name - pre_launch_properties)

Stores detailed information about pre-launch real estate projects, including apartments, villas, and plots with their specifications, pricing, and regulatory details.

### Basic Project Information

| Field                  | Type                   | Options / Enum                                  | Example                   |
| ---------------------- | ---------------------- | ----------------------------------------------- | ------------------------- |
| projectName            | string                 | –                                               | "Green Valley Residences" |
| projectType            | string (enum)          | Residential, Commercial, Mixed-Use              | "Residential"             |
| stage                  | string (enum)          | EC, Pre-Launch                                  | "EC"                      |
| status                 | string (enum)          | Pre-Launch, Launched, Under Construction, Ready | "Pre-Launch"              |
| developerName          | string                 | –                                               | "Sunrise Developers"      |
| projectSize            | number                 | –                                               | 15                        |
| projectSizeUnit        | string (enum)          | acres, hectares, sqft, sqm                      | "acres"                   |
| pricePerSqft           | number                 | –                                               | 12000                     |
| projectStartDate       | string (unixTimeStamp) | –                                               | "1749518450"              |
| proposedCompletionDate | string (unixTimeStamp) | –                                               | "1749518450"              |

### Location Details

| Field   | Type   | Options / Enum | Example                             |
| ------- | ------ | -------------- | ----------------------------------- |
| address | string | –              | "123 Oak Avenue, Pleasantville, CA" |
| Lag     | string | –              | "34.0522° N"                        |
| Long    | string | –              | "118.2437° W"                       |
| mapLink | string | –              | ""https://www.google.com/maps/..."  |

### Project Specifications

| Field          | Type   | Options / Enum | Example |
| -------------- | ------ | -------------- | ------- |
| totalUnits     | number | –              | 250     |
| eoiAmount      | number | –              | 50000   |
| numberOfFloors | number | –              | 20      |
| numberOfTowers | number | –              | 2       |
| totalParking   | number | –              | 300     |
| openParking    | number | –              | 150     |
| coveredParking | number | –              | 150     |
| openArea       | string | –              | "40%"   |

### Regulatory Information

| Field                  | Type          | Options / Enum                            | Example        |
| ---------------------- | ------------- | ----------------------------------------- | -------------- |
| reraId                 | string        | –                                         | "RERA12345678" |
| reraStatus             | string (enum) | Approved, Pending, Rejected, Not Required | "Approved"     |
| isReraApproved         | string (enum) | Approved, Pending, Rejected, Not Required | "Approved"     |
| environmentalClearance | string (enum) | Approved, Pending, Rejected, Not Required | "Approved"     |
| buildingPermission     | string (enum) | Approved, Pending, Rejected, Not Required | "Approved"     |

### Configurations

#### Apartments Configuration

| Field            | Type          | Options / Enum                     | Example              |
| ---------------- | ------------- | ---------------------------------- | -------------------- |
| apartments       | array<object> | –                                  | –                    |
| ├─ Configuration | string (enum) | 1 BHK, 2 BHK, 3 BHK, 4 BHK, 5+ BHK | "2 BHK"              |
| ├─ apartmentType | string (enum) | simplex, duplex, penthouse         | "simplex"            |
| ├─ sbua          | number        | –                                  | 1200                 |
| ├─ carpetArea    | number        | –                                  | 900                  |
| ├─ pricePerSqft  | number        | –                                  | 10000                |
| ├─ totalPrice    | number        | –                                  | 12000000             |
| └─ floorPlan     | string        | –                                  | "2bhk_floorplan.pdf" |

#### Villas Configuration

| Field             | Type          | Options / Enum          | Example  |
| ----------------- | ------------- | ----------------------- | -------- |
| villas            | array<object> | –                       | –        |
| ├─ Configuration  | string (enum) | 2BHK, 3BHK, 4BHK, 5+BHK | "3BHK"   |
| ├─ VillaType      | string (enum) | UDS, Plot, Independent  | "UDS"    |
| ├─ plotSize       | number        | –                       | 4000     |
| ├─ builtUpArea    | number        | –                       | 2500     |
| ├─ carpetArea     | number        | –                       | 2000     |
| ├─ pricePerSqft   | number        | –                       | 15000    |
| ├─ totalPrice     | number        | –                       | 45000000 |
| ├─ uds            | number        | –                       | 1500     |
| └─ numberOfFloors | number        | –                       | 2        |

#### Plots Configuration

| Field           | Type          | Options / Enum | Example    |
| --------------- | ------------- | -------------- | ---------- |
| plots           | array<object> | –              | –          |
| ├─ plotType     | string        | –              | "ODD Plot" |
| ├─ plotArea     | number        | –              | 1500       |
| ├─ pricePerSqft | number        | –              | 8000       |
| └─ totalPrice   | number        | –              | 12000000   |

### Amenities and Features

| Field     | Type          | Options / Enum | Example                                     |
| --------- | ------------- | -------------- | ------------------------------------------- |
| amenities | array<string> | –              | ["Swimming Pool", "Gymnasium", "Clubhouse"] |

### Documentation

| Field                | Type          | Options / Enum | Example               |
| -------------------- | ------------- | -------------- | --------------------- |
| documents            | object        | –              | –                     |
| ├─ villageMaps       | array<string> | –              | ["Village Map"]       |
| ├─ cdpMaps           | array<string> | –              | ["CDP Map"]           |
| ├─ masterPlan        | string        | –              | "Master Plan"         |
| ├─ projectLayoutPlan | string        | –              | "Project Layout Plan" |
| └─ brochure          | string        | –              | "Brochure"            |

### Metadata

| Field       | Type          | Options / Enum             | Example      |
| ----------- | ------------- | -------------------------- | ------------ |
| areaUnit    | string (enum) | sqft, sqm, acres, hectares | "sqft"       |
| lastUpdated | string (ISO)  | –                          | "2024-06-07" |
| createdAt   | string (ISO)  | –                          | "2024-06-07" |

---

## Common Enum Values

### Project Types

- **Residential**: Primarily residential units (apartments, villas, plots)
- **Commercial**: Office spaces, retail, warehouses
- **Mixed-Use**: Combination of residential and commercial

### Project Stages

- **EC**: Environmental Clearance
- **pre-Launch**: Project announced but not officially launched

### Project Status

- **Pre-Launch**: Project announced but not officially launched
- **Launched**: Project officially launched for sales
- **Under Construction**: Construction in progress
- **Ready**: Project completed and ready for possession

### Apartment Types

- **simplex**: Single-floor apartments
- **duplex**: Two-floor apartments
- **penthouse**: Top-floor luxury apartments

### Villa Types

- **UDS**: Undivided Share of Land
- **Plot**: Independent plot with villa
- **Independent**: Standalone villa

### Approval Status

- **Approved**: Clearance/permission granted
- **Pending**: Application under review
- **Rejected**: Application denied
- **Not Required**: Clearance not applicable

---

**Notes:**

- All monetary values are in INR (Indian Rupees)
- Area measurements default to square feet unless specified otherwise
- Dates follow (unixTimeStamp) format ("1749518450")
- Coordinates use decimal degrees format(float)
- All arrays can be empty if no data is available
