# Post-RERA Properties in Stock Schema

This document describes the comprehensive data schema for post-RERA properties in stock, covering all major fields, phase-wise development details, configurations, and regulatory compliance information.

---

## Schema Overview

The **post-RERA properties in stock** collection stores detailed information about real estate projects that are RERA-approved and have available inventory for sale. This includes multi-phase projects, comprehensive specifications, regulatory compliance, and detailed configurations.

---

## restack_post_rera_properties (Collection Name - restack_post_rera_properties)

Stores comprehensive information about RERA-approved real estate projects with available inventory, including phase-wise development tracking and detailed unit configurations.

### Basic Project Information

| Field            | Type          | Options / Enum                            | Example                      |
| ---------------- | ------------- | ----------------------------------------- | ---------------------------- |
| projectId\*      | string        | –                                         | "PA001"                      |
| projectName\*    | string        | –                                         | "shobha daffodil"            |
| projectType      | string (enum) | Residential, Commercial, Mixed,plotted    | "Residential"                |
| description      | string        | –                                         | "Luxury residential complex" |
| projectSubType   | string (enum) | apartments, villa, flat, plot, commercial | "apartments"                 |
| projectStatus    | string (enum) | active, inactive, completed, on-hold      | "active"                     |
| projectStartDate | number (TS)   | –                                         | 1749518450                   |
| handoverDate     | number (TS)   | –                                         | 1749518450                   |

### RERA and Regulatory Information

| Field                | Type          | Options / Enum                            | Example             |
| -------------------- | ------------- | ----------------------------------------- | ------------------- |
| reraId\*             | string        | –                                         | "RERA-KA-2024-XXXX" |
| acknowledgeNumber\*  | string        | –                                         | "ACK-2024-001"      |
| reraStatus\*         | string (enum) | Approved, Pending, Rejected, Not Required | "Approved"          |
| localAuthority\*     | string        | –                                         | "BBMP"              |
| approvingAuthority\* | string        | –                                         | "BDA"               |
| planApprovalDate\*   | string        | –                                         | "2024-01-15"        |
| approvedPlanNumber\* | string        | –                                         | "PLAN-2024-001"     |

### Developer and Promoter Details

| Field                | Type          | Options / Enum | Example                   |
| -------------------- | ------------- | -------------- | ------------------------- |
| developerName        | string        | –              | "Sobha Limited"           |
| promoterName         | string        | –              | "Sobha Promoters"         |
| developerLegalName   | string        | –              | "Sobha Limited Pvt Ltd"   |
| promoterLegalName    | string        | –              | "Sobha Promoters Pvt Ltd" |
| developerTransferFee | number        | –              | 50000                     |
| developerTier        | string (enum) | A, B, C, D     | "A"                       |

### Location Details

| Field          | Type   | Options / Enum | Example                             |
| -------------- | ------ | -------------- | ----------------------------------- |
| address\*      | string | –              | "123 Oak Avenue, Pleasantville, CA" |
| Lat            | float  | –              | 34.0522                             |
| Long           | float  | –              | 118.2437                            |
| mapLink        | string | –              | "www.google.com"                    |
| district       | string | –              | "Bangalore Urban"                   |
| taluk          | string | –              | "Bangalore North"                   |
| microMarket    | string | –              | "Whitefield"                        |
| subMicromarket | string | –              | "ITPL Road"                         |
| zone           | string | –              | "East Zone"                         |
| pincode        | number | –              | 303005                              |
| northSchedule  | string | –              | "Survey No. 123"                    |
| southSchedule  | string | –              | "Survey No. 124"                    |
| eastSchedule   | string | –              | "Survey No. 125"                    |
| westSchedule   | string | –              | "Survey No. 126"                    |

### Phase Development Details

| Field                 | Type          | Options / Enum                                               | Example                     |
| --------------------- | ------------- | ------------------------------------------------------------ | --------------------------- |
| phaseDetails          | array<object> | –                                                            | –                           |
| ├─ phaseName          | string        | –                                                            | "Shobha Dream Acres Wing 2" |
| ├─ constructionUpdate | string (enum) | Ready to Move, Under Construction, Planning Stage, Completed | "Ready to Move"             |
| └─ primaryPropertyId  | string        | -                                                            | "PA001"                     |

### Area Details

| Field                 | Type   | Options / Enum | Example |
| --------------------- | ------ | -------------- | ------- |
| ├─ openArea           | number | –              | 5000    |
| ├─ coveredArea        | number | –              | 5000    |
| ├─ landArea           | number | –              | 10000   |
| ├─ builtUpArea        | number | –              | 8000    |
| ├─ carpetArea         | number | –              | 7000    |
| ├─ plinthArea         | number | –              | 6000    |
| ├─ openParkingArea    | number | –              | 500     |
| ├─ coveredParkingArea | number | –              | 1000    |
| ├─ garageArea         | number | –              | 200     |
| └─ projectDensity     | number | –              | 200     |

### Project Specifications

| Field            | Type          | Options / Enum | Example                     |
| ---------------- | ------------- | -------------- | --------------------------- |
| totalInventories | number        | –              | 250                         |
| totalParking     | number        | –              | 300                         |
| openParking      | number        | –              | 150                         |
| coveredParking   | number        | –              | 150                         |
| numberOfGarage   | number        | –              | 50                          |
| totalTowers      | number        | –              | 2                           |
| floorAreaRatio   | number        | –              | 1.5                         |
| waterSource      | array<string> | –              | ["Borewell", "Corporation"] |

### Development Details

| Field                   | Type   | Options / Enum | Example |
| ----------------------- | ------ | -------------- | ------- |
| DevelopmentDetails      | object | –              | –       |
| ├─ typeOfInventory      | string | –              | "2 BHK" |
| ├─ numberOfInventory    | number | –              | 50      |
| ├─ carpetAreaSqMtr      | number | –              | 150     |
| ├─ balconyVerandahSqMtr | number | –              | 20      |
| └─ openTerraceSqMtr     | number | –              | 10      |

### Configuration Details

#### Apartments Configuration

| Field                 | Type          | Options / Enum                        | Example |
| --------------------- | ------------- | ------------------------------------- | ------- |
| ConfingurationDetails | object        | –                                     | –       |
| apartments            | array<object> | –                                     | –       |
| ├─ configuration      | string (enum) | 1BHK, 2BHK, 3BHK, 4BHK, 5+BHK, Studio | "2BHK"  |
| ├─ pricePerSqft       | number        | –                                     | 2000    |
| ├─ builtUpArea        | number        | –                                     | 1200    |
| ├─ sbua               | number        | –                                     | 1200    |
| ├─ carpetArea         | number        | –                                     | 900     |
| └─ totalAreasqft      | number        | –                                     | 2000    |

#### Villa Configuration

| Field            | Type          | Options / Enum               | Example |
| ---------------- | ------------- | ---------------------------- | ------- |
| villa            | array<object> | –                            | []      |
| ├─ configuration | string (enum) | 2BHK, 3BHK, 4BHK, 5+BHK      | "3BHK"  |
| ├─ villaType     | string (enum) | UDS, Plot, Independent Villa | "UDS"   |
| ├─ plotSize      | number        | –                            | 4000    |
| ├─ builtUpArea   | number        | –                            | 2500    |
| ├─ sbua          | number        | –                            | 1200    |
| ├─ carpetArea    | number        | –                            | 2000    |
| ├─ pricePerSqft  | number        | –                            | 15000   |

#### Flat Configuration

| Field            | Type          | Options / Enum                        | Example  |
| ---------------- | ------------- | ------------------------------------- | -------- |
| flat             | array<object> | –                                     | []       |
| ├─ configuration | string (enum) | 1BHK, 2BHK, 3BHK, 4BHK, 5+BHK, Studio | "2BHK"   |
| ├─ flatType      | string (enum) | Regular, Corner, Penthouse, Studio    | "Corner" |
| ├─ builtUpArea   | number        | –                                     | 1200     |
| ├─ carpetArea    | number        | –                                     | 900      |
| ├─ pricePerSqft  | number        | –                                     | 8000     |

#### Plot Configuration

| Field           | Type          | Options / Enum       | Example    |
| --------------- | ------------- | -------------------- | ---------- | --- |
| plot            | array<object> | –                    | []         |
| ├─ plotType     | string (enum) | ODD PLOT, 9.14x15.24 | "ODD PLOT" |     |
| ├─ plotArea     | number        | –                    | 456.51     |
| ├─ pricePerSqft | number        | –                    | 5000       |

### Tower Details

| Field                  | Type          | Options / Enum | Example            |
| ---------------------- | ------------- | -------------- | ------------------ |
| TowerDetails           | array<object> | –              | –                  |
| ├─ towerName           | string        | –              | "Tower A"          |
| ├─ typeOfTower         | string        | –              | "Residential"      |
| ├─ floors              | number        | –              | 2                  |
| ├─ units               | number        | –              | 20                 |
| ├─ stilts              | number        | –              | 12                 |
| ├─ slabs               | number        | –              | 9                  |
| ├─ basements           | number        | –              | 2                  |
| ├─ totalParking        | number        | –              | 20                 |
| ├─ towerHeightInMeters | number        | –              | 213                |
| └─ floorplan           | string        | –              | "floorPlanurl.pdf" |

### Media and Documents

| Field            | Type          | Options / Enum | Example                    |
| ---------------- | ------------- | -------------- | -------------------------- |
| Images           | array<string> | –              | ["img1.jpg", "img2.jpg"]   |
| typology&UnitPan | array<string> | –              | ["plan1.pdf", "plan2.pdf"] |
| cdpMapURL        | string        | –              | "ggoogg.pdf"               |
| costSheet        | string        | –              | "costsheet.pdf"            |
| brochure         | string        | –              | "brochure.pdf"             |

### Documents

| Field                      | Type          | Options / Enum | Example                       |
| -------------------------- | ------------- | -------------- | ----------------------------- |
| documents                  | array<object> | –              | –                             |
| ├─ phaseName               | string        | –              | "Wing 2"                      |
| ├─ commencementCertificate | string        | –              | "CommencementCertificate.pdf" |
| ├─ approvalCertificate     | string        | –              | "ApprovalCertificate.pdf"     |
| ├─ occupancyCertificate    | string        | –              | "OccupancyCertificate.pdf"    |
| ├─ approvedBuildingPlan    | string        | –              | "ApprovedBuildingPlan.pdf"    |
| ├─ environmentalClearance  | string        | –              | "EnvironmentalClearance.pdf"  |

### Amenities and Facilities

| Field            | Type          | Options / Enum | Example                                     |
| ---------------- | ------------- | -------------- | ------------------------------------------- |
| projectAmenities | array<string> | –              | ["Swimming Pool", "Gymnasium", "Clubhouse"] |

### Club House Details

| Field            | Type          | Options / Enum | Example        |
| ---------------- | ------------- | -------------- | -------------- |
| clubHouseDetails | array<object> | –              | –              |
| ├─ name          | string        | –              | "Sports Club"  |
| ├─ sizeSqft      | number        | –              | 12000          |
| └─ floor         | string        | –              | "Ground Floor" |

### Metadata

| Field       | Type          | Options / Enum               | Example      |
| ----------- | ------------- | ---------------------------- | ------------ |
| areaUnit    | string (enum) | sqMtr, sqft, acres, hectares | "sqMtr"      |
| lastUpdated | string (TS)   | –                            | "1749518450" |
| createdAt   | string (TS)   | –                            | "1749518450" |

---

## Common Enum Values

### Project Types

- **Residential**: Primarily residential units (apartments, villas, plots)
- **Commercial**: Office spaces, retail, warehouses
- **Mixed**: Combination of residential and commercial
- **plotted**: Subdivided land plots with basic infrastructure

### Project Sub Types

- **apartments**: Multi-story apartment complexes
- **villa**: Independent villa projects
- **flat**: Flat complexes
- **plot**: Land plot developments
- **commercial**: Commercial developments

### Project Status

- **active**: Project currently active with available inventory
- **inactive**: Project temporarily inactive
- **completed**: Project construction completed
- **on-hold**: Project temporarily on hold

### Construction Update Status

- **Ready to Move**: Phase completed and ready for possession
- **Under Construction**: Phase currently under construction
- **Planning Stage**: Phase in planning/approval stage
- **Completed**: Phase fully completed and handed over

### RERA Status

- **Approved**: RERA approval granted
- **Pending**: RERA application under review
- **Rejected**: RERA application rejected
- **Not Required**: RERA not applicable

### Developer Tier

- **A**: Top-tier developers with excellent track record
- **B**: Mid-tier developers with good reputation
- **C**: Emerging developers with growing portfolio
- **D**: New developers in the market

### Unit Types

- **1BHK**: 1 Bedroom, Hall, Kitchen
- **2BHK**: 2 Bedroom, Hall, Kitchen
- **3BHK**: 3 Bedroom, Hall, Kitchen
- **4BHK**: 4 Bedroom, Hall, Kitchen
- **5+BHK**: 5 or more Bedroom, Hall, Kitchen
- **Studio**: Studio apartment

---

## Key Features

### Phase Management

The `phaseDetails` array allows tracking of multiple development phases within a single project, each with its own construction status and timeline.

### RERA Compliance

Comprehensive RERA-related fields ensure full regulatory compliance and transparency for buyers.

### Flexible Configuration

Support for apartments, villas, flats, and plots within the same project structure.

### Media Management

Organized storage of project images, floor plans, brochures, and regulatory documents.

---

**Notes:**

- All monetary values are in INR (Indian Rupees)
- Area measurements use the unit specified in `areaUnit` field
- Timestamps are Unix timestamps (seconds since epoch)
- All arrays can be empty if no data is available
- RERA compliance is mandatory for properties in this schema
- Phase-wise tracking enables better project management and customer communication
