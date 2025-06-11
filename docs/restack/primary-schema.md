# Restack Primary Properties Schema

This document describes the comprehensive data schema for the Restack real estate projects system, covering all major fields, configurations, and regulatory details.

---

## Schema Overview

The **primary properties** collection stores detailed information about real estate projects including apartments, villas, flats, and plots with comprehensive specifications, regulatory approvals, financial details, and development information.

---

## restack_primary_properties (Collection Name - restack_primary_properties)

Stores comprehensive information about real estate projects with detailed configurations, regulatory compliance, and development specifications.

### Basic Project Information

| Field              | Type          | Options / Enum                             | Example                      |
| ------------------ | ------------- | ------------------------------------------ | ---------------------------- |
| projectName\*      | string        | –                                          | "shobha daffodil"            |
| projectType\*      | string (enum) | Residential, Commercial,plotted, Mixed-Use | "Residential"                |
| projectDescription | string        | –                                          | "Luxury residential complex" |
| projectSubType     | string (enum) | apartments, villa, flat, plot, commercial  | "apartments"                 |
| projectStatus\*    | string (enum) | active, inactive, completed, on-hold       | "active"                     |
| projectStartDate\* | number (TS)   | –                                          | 1749518450                   |
| handoverDate\*     | number (TS)   | –                                          | 1749518450                   |

### RERA and Regulatory Information

| Field                | Type          | Options / Enum                            | Example             |
| -------------------- | ------------- | ----------------------------------------- | ------------------- |
| reraId\*             | string        | –                                         | "RERA-KA-2024-XXXX" |
| acknowledgeNumber\*  | string        | –                                         | "ACK-2024-001"      |
| reraStatus\*         | string (enum) | Approved, Pending, Rejected, Not Required | "Approved"          |
| localAuthority\*     | string        | –                                         | "BBMP"              |
| approvingAuthority\* | string        | –                                         | "BDA"               |
| planApprovalDate     | string        | –                                         | "2024-01-15"        |
| approvedPlanNumber   | string        | –                                         | "PLAN-2024-001"     |

### Developer and Promoter Details

| Field                | Type          | Options / Enum | Example                   |
| -------------------- | ------------- | -------------- | ------------------------- |
| developerName        | string        | –              | "Sobha Limited"           |
| promoterName         | string        | –              | "Sobha Promoters"         |
| developerLegalName   | string        | –              | "Sobha Limited Pvt Ltd"   |
| promoterLegalName    | string        | –              | "Sobha Promoters Pvt Ltd" |
| developerTransferFee | number        | –              | 50000                     |
| developerTier        | string (enum) | A, B, C, D     | "A"                       |

### Pricing Information

| Field               | Type   | Options / Enum | Example |
| ------------------- | ------ | -------------- | ------- |
| currentPricePerSqft | number | –              | 2000    |
| launchPricePerSqft  | number | –              | 1800    |

### Location Details

| Field          | Type   | Options / Enum | Example                             |
| -------------- | ------ | -------------- | ----------------------------------- |
| address\*      | string | –              | "123 Oak Avenue, Pleasantville, CA" |
| Lat            | number | –              | 34.0522                             |
| Long           | number | –              | 118.2437                            |
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
| totalInventories | string        | –              | "250"                       |
| totalParking     | string        | –              | "300"                       |
| openParking      | string        | –              | "150"                       |
| coveredParking   | string        | –              | "150"                       |
| numberOfGarage   | string        | –              | "50"                        |
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

| Field                 | Type          | Options / Enum                             | Example           |
| --------------------- | ------------- | ------------------------------------------ | ----------------- |
| ConfingurationDetails | object        | –                                          | –                 |
| apartments            | array<object> | –                                          | –                 |
| ├─ apartmentType      | string (enum) | Simplex, Duplex, Triplex, Penthouse        | "Simplex"         |
| ├─ configuration      | string (enum) | Studio, 1 BHK, 2 BHK, 3 BHK, 4 BHK, 5+ BHK | "Studio"          |
| ├─ superBuiltUpArea   | number        | –                                          | 1200              |
| ├─ carpetArea         | number        | –                                          | 900               |
| ├─ pricePerSqft       | number        | –                                          | 2000              |
| ├─ floorPlan          | string        | –                                          | "studio_plan.pdf" |

#### Villa Configuration

| Field             | Type          | Options / Enum               | Example           |
| ----------------- | ------------- | ---------------------------- | ----------------- |
| villa             | array<object> | –                            | –                 |
| ├─ villaType      | string (enum) | UDS, Plot, Independent Villa | "UDS"             |
| ├─ configuration  | string (enum) | 2 BHK, 3 BHK, 4 BHK, 5+ BHK  | "3 BHK"           |
| ├─ plotSize       | number        | –                            | 1200              |
| ├─ builtUpArea    | number        | –                            | 1800              |
| ├─ uds            | string        | –                            | "25% (450 sq ft)" |
| ├─ udsPercentage  | number        | –                            | 25                |
| ├─ udsArea        | number        | –                            | 450               |
| ├─ numberOfFloors | number        | –                            | 2                 |
| ├─ pricePerSqft   | number        | –                            | 15000             |
| ├─ carpetArea     | number        | –                            | 1400              |

#### Plot Configuration

| Field           | Type          | Options / Enum         | Example    |
| --------------- | ------------- | ---------------------- | ---------- |
| plot            | array<object> | –                      | –          |
| ├─ plotType     | string (enum) | ODD PLOT, "9.14x15.24" | "ODD PLOT" |
| ├─ plotArea     | number        | –                      | 456.51     |
| ├─ pricePerSqft | number        | –                      | 5000       |

### Tower Details

| Field                  | Type          | Options / Enum | Example       |
| ---------------------- | ------------- | -------------- | ------------- |
| TowerDetails           | array<object> | –              | –             |
| ├─ TowerName           | string        | –              | "Tower A"     |
| ├─ TypeOfTower         | string        | –              | "Residential" |
| ├─ floors              | number        | –              | 2             |
| ├─ units               | number        | –              | 20            |
| ├─ stilts              | number        | –              | 12            |
| ├─ slabs               | number        | –              | 9             |
| ├─ basements           | number        | –              | 2             |
| ├─ TotalParking        | number        | –              | 20            |
| ├─ TowerHeightInMeters | number        | –              | 213           |
| └─ floorplan           | object        | –              | –             |
| ├─ FloorNo             | number        | –              | 10            |
| └─ Units               | number        | –              | 10            |

### Banking Details

| Field              | Type   | Options / Enum | Example               |
| ------------------ | ------ | -------------- | --------------------- |
| projectBankDetails | object | –              | –                     |
| ├─ BankName        | string | –              | "State Bank of India" |
| ├─ Branch          | string | –              | "Koramangala Branch"  |
| ├─ IFSCCode        | string | –              | "SBIN0001234"         |
| ├─ AccountNo       | string | –              | "1234567890"          |
| ├─ BankState       | string | –              | "Karnataka"           |
| └─ BankDistrict    | string | –              | "Bangalore Urban"     |

### Media and Documents

| Field            | Type          | Options / Enum | Example                    |
| ---------------- | ------------- | -------------- | -------------------------- |
| Images           | array<string> | –              | ["img1.jpg", "img2.jpg"]   |
| typology&UnitPan | array<string> | –              | ["plan1.pdf", "plan2.pdf"] |
| cdpMapURL        | array<string> | –              | ["CDP Map"]                |
| costSheetURL     | array<string> | –              | ["costsheet.pdf" ]         |
| brochureURL      | array<string> | –              | ["brochure.pdf"]           |

### Documents

| Field               | Type          | Options / Enum | Example                      |
| ------------------- | ------------- | -------------- | ---------------------------- |
| documents           | object        | –              | –                            |
| ├─ projectDocuments | array<string> | –              | ["doc1.pdf", "doc2.pdf"]     |
| ├─ nocDocuments     | array<string> | –              | ["noc1.pdf", "noc2.pdf"]     |
| └─ otherDocuments   | array<string> | –              | ["other1.pdf", "other2.pdf"] |

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

### Legal Information

| Field                   | Type          | Options / Enum | Example                    |
| ----------------------- | ------------- | -------------- | -------------------------- |
| litigation              | string (enum) | Yes, No        | "Yes"                      |
| affidavitLink           | string        | –              | "google/cno"               |
| Complaints              | object        | –              | –                          |
| ├─ complaintsOnProject  | array<object> | –              | –                          |
| │ ├─ registrationNo     | string        | –              | "REG123"                   |
| │ ├─ complaintNo        | string        | –              | "COMP001"                  |
| │ ├─ complaintBy        | string        | –              | "Sophia Clark"             |
| │ ├─ complaintDate      | string (ISO)  | –              | "2023-01-15"               |
| │ ├─ complaintSubject   | string        | –              | "Delay in possession"      |
| │ └─ projectName        | string        | –              | "Green Meadows"            |
| └─ complaintsOnPromoter | array<object> | –              | –                          |
| ├─ registrationNo       | string        | –              | "REG678"                   |
| ├─ complaintNo          | string        | –              | "COMP006"                  |
| ├─ complaintBy          | string        | –              | "Ethan Hayes"              |
| ├─ complaintDate        | string (ISO)  | –              | "2023-06-10"               |
| ├─ complaintSubject     | string        | –              | "Financial irregularities" |
| └─ projectName          | string        | –              | "Green Meadows"            |

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
- **plotted**: Subdivided land plots with basic infrastructure
- **Mixed-Use**: Combination of residential and commercial

### Project Sub Types

- **apartments**: Multi-story apartment complexes
- **villa**: Independent villa projects
- **flat**: Flat complexes
- **plot**: Land plot developments
- **commercial**: Commercial developments

### Project Status

- **active**: Project currently active and selling
- **inactive**: Project temporarily inactive
- **completed**: Project construction completed
- **on-hold**: Project temporarily on hold

### RERA Status

- **Approved**: RERA approval granted
- **Pending**: RERA application under review
- **Rejected**: RERA application rejected
- **Not Required**: RERA not applicable

### Developer Tier

- **A**: Top-tier developers
- **B**: Mid-tier developers
- **C**: Emerging developers
- **D**: New developers

### Unit Types

- **1BHK**: 1 Bedroom, Hall, Kitchen
- **2BHK**: 2 Bedroom, Hall, Kitchen
- **3BHK**: 3 Bedroom, Hall, Kitchen
- **4BHK**: 4 Bedroom, Hall, Kitchen
- **5+BHK**: 5 or more Bedroom, Hall, Kitchen

### Litigation Status

- **Yes**: Legal issues present
- **No**: No legal issues

---

**Notes:**

- All monetary values are in INR (Indian Rupees)
- Area measurements use the unit specified in `areaUnit` field
- Timestamps are Unix timestamps (seconds since epoch)
- Coordinates use decimal degrees format
- All arrays can be empty if no data is available
- RERA compliance is mandatory for projects above certain thresholds
- Bank details are required for escrow account management
