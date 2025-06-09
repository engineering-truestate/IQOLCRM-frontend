# ACN CRM Schema Design

This document describes the data schema for the ACN CRM system, covering all major collections and their fields.

---

## Collections Overview

- **agents**: Contains all Verified Agent related data and Lead data.
- **enquiries**: Property enquiry data and status.
- **requirements**: Buyer/renter requirements and preferences.
- **ACN123**: Property  inventory data which are qc vertified.
- **QC_Inventories**: Properties to be Quality-checked.
- **rental-inventories**: Rental property data.

---

## agents (collection Name - agents)

Stores detailed profiles of registered channel partners, including business activity, credit details, contact status, and system usage.

| Field                    | Type           | Options / Enum                                                                 | Example                       |
|--------------------------|----------------|--------------------------------------------------------------------------------|-------------------------------|
| cpId                     | string         | –                                                                              | "cp_001"                      |
| name                     | string         | –                                                                              | "Amit Sharma"                 |
| phoneNumber              | string         | –                                                                              | "+919888888888"               |
| emailAddress             | string         | –                                                                              | "amit@example.com"            |
| workAddress              | string         | –                                                                              | "HSR Layout, Bangalore"       |
| reraId                   | string         | –                                                                              | "RERA-KA-2024-XXXX"           |
| firmName                 | string         | –                                                                              | "Sharma Realty"               |
| firmSize                 | number         | –                                                                              | 5                             |
| areaOfOperation          | array<string>  | north/south/east/west/pan bangalore                                            | ["north bangalore"]           |
| businessCategory         | array<string>  | resale, rental, primary                                                        | ["resale", "rental"]          |
| activity                 | string         | active, nudge, no activity                                                     | "active"                      |
| userType                 | string         | basic, trial, premium                                                          | "premium"                     |
| planExpiry               | number (TS)    | –                                                                              | 1719878400000                 |
| credits                  | number         | –                                                                              | 100                           |
| contactStatus            | string         | connected, not contact, rnr-1 to rnr-6                                         | "connected"                   |
| lastSeen                 | number (TS)    | –                                                                              | 1719650000000                 |
| agentStatus              | string         | interested, not interested, not contact yet                                    | "interested"                  |
| payStatus                | string         | will pay, paid, will not, paid by team                                         | "paid"                        |
| paymentHistory           | array<object>  | paymentAmount, paymentDate (TS), paymentId, planId                             | –                             |
| kamName                  | string         | –                                                                              | "Neha Mehta"                  |
| kamId                    | string         | –                                                                              | "kam_202"                     |
| communityJoined          | boolean        | –                                                                              | true                          |
| onBroadcast              | boolean        | –                                                                              | false                         |
| verified                 | boolean        | –                                                                              | true                          |
| added                    | number (TS)    | –                                                                              | 1718000000000                 |
| lastModified             | number (TS)    | –                                                                              | 1719000000000                 |
| blackListed              | boolean        | –                                                                              | false                         |
| boosterCredits           | number         | –                                                                              | 20                            |
| extraDetails             | string         | –                                                                              | "Focuses on north Bangalore"  |
| inboundEnqCredits        | number         | –                                                                              | 10                            |
| inboundReqCredits        | number         | –                                                                              | 8                             |
| myInventories            | array<string>  | –                                                                              | ["inv_001", "inv_002"]        |
| monthlyCredits           | number         | –                                                                              | 30                            |
| nextRenewal              | number (TS)    | –                                                                              | 1720000000000                 |
| onboardingComplete       | boolean        | –                                                                              | true                          |
| preferedMicromarket      | string         | –                                                                              | "Whitefield"                  |
| trialStartedAt           | number (TS)    | –                                                                              | 1717000000000                 |
| trialUsed                | boolean        | –                                                                              | true                          |
| activeProperties         | boolean        | –                                                                              | true                          |
| delistedProperties       | boolean        | –                                                                              | false                         |
| appInstalled             | boolean        | –                                                                              | true                          |
| source                   | string         | whatsApp, instagram, facebook, referral, direct                                | "referral"                    |
| notes                    | array<object>  | timestamp (TS), kamId, source, note                                            | –                             |
| contactHistory           | array<object>  | timestamp (TS), contactResult (connected, not connected, etc.)                 | –                             |

---

## leads (collection Name - agents)

Stores information about CRM leads, their contact status, interest level, and communication history.

| Field                        | Type         | Options / Enum                                                    | Example                     |
|------------------------------|--------------|-------------------------------------------------------------------|-----------------------------|
| leadId                       | string       | –                                                                 | "lead_001"                  |
| name                         | string       | –                                                                 | "Rohit Mehra"               |
| phonenumber                  | string       | –                                                                 | "+919999999999"             |
| emailAddress                 | string       | –                                                                 | "rohit@example.com"         |
| leadStatus                   | string       | interested, not interested, not contact yet                       | "interested"                |
| contactStatus                | string       | connected, not contact, rnr-1 to rnr-6                            | "rnr-2"                     |
| kamName                      | string       | –                                                                 | "Anjali Sinha"              |
| kamId                        | string       | –                                                                 | "kam_101"                   |
| source                       | string       | whatsApp, instagram, facebook, referral, direct                   | "instagram"                 |
| communityJoined              | boolean      | –                                                                 | true                        |
| onBroadcast                  | boolean      | –                                                                 | false                       |
| verified                     | boolean      | –                                                                 | true                        |
| added                        | number (TS)  | –                                                                 | 1717833600000               |
| lastModified                 | number (TS)  | –                                                                 | 1717916400000               |
| blackListed                  | boolean      | –                                                                 | false                       |
| extraDetails                 | string       | –                                                                 | "Prefers afternoon calls"   |
| notes                        | array        | Array of objects                                                  | –                           |
| ├─ notes[].timestamp         | number (TS)  | –                                                                 | 1717900000000               |
| ├─ notes[].kamId             | string       | –                                                                 | "kam_101"                   |
| ├─ notes[].source            | string       | –                                                                 | "direct"                    |
| └─ notes[].note              | string       | –                                                                 | "Interested in north zone"  |
| connectHistory               | array        | Array of objects                                                  | –                           |
| ├─ connectHistory[].timestamp| number (TS)  | –                                                                 | 1717905000000               |
| └─ connectHistory[].connectResult | string  | connected, not connected, on call, on whatsapp, out bound, in bound | "connected"               |

---

## enquiries (collection Name - enquiries)

Tracks inquiries made by channel partners (CPs) on properties, along with their current status and update timestamps.

| Field        | Type         | Options / Enum                                       | Example               |
|--------------|--------------|------------------------------------------------------|-----------------------|
| enquiryId    | string       | –                                                    | "enq_123"             |
| propertyId   | string       | –                                                    | "prop_456"            |
| cpId         | string       | –                                                    | "cp_789"              |
| status       | string       | site visit done, pending, not interested, interested | "site visit done"     |
| added        | number (TS)  | –                                                    | 1719676800000         |
| lastModified | number (TS)  | –                                                    | 1719763200000         |

---

## requirements (collection Name - requirements)

Stores property requirements shared by channel partners (CPs), including preferences like asset type, budget, and configuration.

| Field              | Type         | Options / Enum                                              | Example                        |
|--------------------|--------------|-------------------------------------------------------------|--------------------------------|
| requirementId      | string       | –                                                           | "req_001"                      |
| cpId               | string       | –                                                           | "cp_123"                       |
| location           | string       | –                                                           | "Whitefield"                   |
| assetType          | string       | villa, apartment, plot, commercial, warehouse, office       | "apartment"                    |
| configuration      | string       | 1 bhk, 2 bhk, 3 bhk, 4 bhk, 5+ bhk                          | "3 bhk"                        |
| budget.from        | number       | –                                                           | 6000000                        |
| budget.to          | number       | –                                                           | 9000000                        |
| area.from          | number       | –                                                           | 1000                           |
| area.to            | number       | –                                                           | 1500                           |
| bedrooms           | string       | –                                                           | "3"                            |
| bathrooms          | string       | –                                                           | "2"                            |
| parking            | string       | –                                                           | "1"                            |
| propertyName       | string       | –                                                           | "Prestige Lakeside"            |
| requirementDetails | string       | –                                                           | "Looking for lake-facing flat" |
| marketValue        | string       | –                                                           | "Above 1 Cr"                   |
| requirementStatus  | string       | open, close                                                 | "open"                         |
| details            | string       | –                                                           | "Urgent requirement"           |
| internalStatus     | string       | found, not found, pending                                   | "pending"                      |
| added              | number (TS)  | –                                                           | 1719700000000                  |
| lastModified       | number (TS)  | –                                                           | 1719786400000                  |
| matchingProperties | array        | Array of property IDs                                       | ["prop_001", "prop_002"]       |

---

## inventories (collection Name - ACN123)

Stores live property listings that have successfully passed quality control and are available for customer enquiries and transactions.

| Field                    | Type                | Example                           | Enum Options                                                      |
|--------------------------|---------------------|-----------------------------------|-------------------------------------------------------------------|
| id                       | string              | "P009"                            |                                                                   |
| propertyId               | string              | "P009"                            |                                                                   |
| _geoloc                  | object              | {lat: 12.972, lng: 77.762}        |                                                                   |
| ageOfInventory           | number              | 318                               |                                                                   |
| ageOfStatus              | number              | 318                               |                                                                   |
| area                     | string              | "East Bangalore"                  |                                                                   |
| askPricePerSqft          | number              | 13759                             |                                                                   |
| assetType                | string (enum)       | "apartment"                       | villa, apartment, plot, commercial, warehouse, office             |
| builder_name             | string              | "Sobha Limited"                   |                                                                   |
| buildingAge              | number              | 5                                 |                                                                   |
| buildingKhata            | string              | "BK123456"                        |                                                                   |
| carpet                   | number              | 1216                              |                                                                   |
| cpId                     | string              | "CPA001"                          |                                                                   |
| currentStatus            | string (enum)       | "under construction"              | ready to move, under construction, new launch                     |
| dateOfInventoryAdded     | number (TS)         | 1721865600                        |                                                                   |
| dateOfStatusLastChecked  | number (TS)         | 1721891863                        |                                                                   |
| kamName                  | string              | "John Doe"                        |                                                                   |
| driveLink                | string              | "https://drive.google.com/..."    |                                                                   |
| extraDetails             | string              | "3 BHK premium apartment"         |                                                                   |
| facing                   | string (enum)       | "west"                            | north, south, east, west, northeast, northwest, southeast, southwest |
| floorNo                  | number              | 15                                |                                                                   |
| handoverDate             | number (TS)         | 1735689600                        |                                                                   |
| landKhata                | string              | "LKT456"                          |                                                                   |
| listingScore             | string              | "8.5"                             |                                                                   |
| mapLocation              | string              | "https://www.google.com/maps/..." |                                                                   |
| micromarket              | string              | "Hagadur, Whitefield"             |                                                                   |
| nameOfTheProperty        | string              | "Sobha Windsor"                   |                                                                   |
| ocReceived               | boolean             | true                              |                                                                   |
| plotSize                 | number              | 2400                              |                                                                   |
| sbua                     | number              | 1817                              |                                                                   |
| status                   | string (enum)       | "sold"                            | listed, delisted, sold, pending                                   |
| subType                  | string (enum)       | "simplex"                         | simplex, duplex, penthouse                                        |
| tenanted                 | boolean             | false                             |                                                                   |
| totalAskPrice            | number              | 250                               |                                                                   |
| unitType                 | string (enum)       | "3 bhk"                           | 1 bhk, 2 bhk, 3 bhk, 4 bhk, 5+ bhk                                |
| soldPrice                | number              | 2400                              |                                                                   |
| soldPlatform             | string              | "ANC"                             |                                                                   |
| priceHistory             | array               | Array of objects                  |                                                                   |
| photo                    | array               | ["img1.jpg", "img2.jpg"]          |                                                                   |
| ├─ priceHistory[].timestamp| number (TS)       | 1717905000000                     |                                                                   | 
| └─ priceHistory[].totalAskPrice | number       | "connected"                       |                                                                   |

---

## qc_inventories (collection Name - QC_Inventories)

Stores quality review records for property listings, including approval status, reviewer comments, and validation by both KAM and data teams.

| Field                    | Type                | Example                           | Enum Options                                                      |
|--------------------------|---------------------|-----------------------------------|-------------------------------------------------------------------|
| propertyId               | string              | "PA3565"                          |                                                                   |
| _geoloc                  | object              | {lat: 12.97, lng: 77.76}         |                                                                   |
| address                  | string              | "123 Main Street, Bangalore"     |                                                                   |
| ageOfInventory           | number              | 30                                |                                                                   |
| ageOfStatus              | number              | 5                                 |                                                                   |
| area                     | string              | "East Bangalore"                  |                                                                   |
| askPricePerSqft          | number              | 8500                              |                                                                   |
| priceHistory             | array               | [{timestamp: 1234567890, price: 8000}] |                                                             |
| assetType                | string (enum)       | "apartment"                       | villa, apartment, plot, commercial, warehouse, office             |
| balconyFacing            | string (enum)       | "east"                            | north, south, east, west, outside                                 |
| bdaApproved              | boolean             | true                              |                                                                   |
| biappaApproved           | boolean             | false                             |                                                                   |
| buildingAge              | number              | 5                                 |                                                                   |
| buildingKhata            | string              | "BK123456"                        |                                                                   |
| capPark                  | number              | 2                                 |                                                                   |
| carPark                  | number              | 1                                 |                                                                   |
| carpet                   | number              | 1200                              |                                                                   |
| catrpet                  | number              | 1150                              |                                                                   |
| communityType            | string (enum)       | "gated"                           | gated, open, independent                                          |
| cornerUnit               | boolean             | true                              |                                                                   |
| currentStatus            | string (enum)       | "ready to move"                   | ready to move, under construction, new launch                     |
| dateOfInventoryAdded     | number (TS)         | 1721865600                        |                                                                   |
| dateOfStatusLastChecked  | number (TS)         | 1721891863                        |                                                                   |
| document                 | array               | ["doc1.pdf", "doc2.pdf"]          |                                                                   |
| driveLink                | string              | "https://drive.google.com/..."    |                                                                   |
| eKhata                   | boolean             | true                              |                                                                   |
| noOfEnquiries            | number              | 5                                 |                                                                   |
| exactFloor               | number              | 15                                |                                                                   |
| exclusive                | boolean             | true                              |                                                                   |
| extraDetails             | string              | "Prime location with amenities"   |                                                                   |
| extraRoom                | array (enum)        | ["study room"]                    | servent room, study room                                          |
| facing                   | string (enum)       | "west"                            | north, south, east, west, northeast, northwest, southeast, southwest |
| floorNo                  | number              | 12                                |                                                                   |
| furnishing               | string (enum)       | "semiFurnished"                   | fullFurnished, semiFurnished, unfurnished                        |
| handoverDate             | number (TS)         | 1735689600                        |                                                                   |
| cpId                     | string              | "CPA001"                          |                                                                   |
| kamName                  | string              | "John Doe"                        |                                                                   |
| kamStatus                | string (enum)       | "approved"                        | approved, pending, rejected                                       |
| landKhata                | string              | "LK789456"                        |                                                                   |
| mapLocation              | string              | "https://maps.google.com/..."     |                                                                   |
| micromarket              | string              | "HSR Layout, Sector 1"            |                                                                   |
| nameOfTheProperty        | string              | "Prestige Lakeside Heights"       |                                                                   |
| noOfBalconies            | string              | "2"                               |                                                                   |
| noOfBathrooms            | string              | "3"                               |                                                                   |
| ocReceived               | boolean             | true                              |                                                                   |
| path                     | string              | "properties/PA3565"               |                                                                   |
| photo                    | array               | ["img1.jpg", "img2.jpg"]          |                                                                   |
| plotFacing               | string (enum)       | "north"                           | north, south, east, west                                          |
| plotSize                 | number              | 2400                              |                                                                   |
| qcStatus                 | string (enum)       | "approved"                        | approved, pending, reject, duplicate, primary                     |
| rentalIncome             | number              | 25000                             |                                                                   |
| sbua                     | number              | 1350                              |                                                                   |
| stage                    | string (enum)       | "live"                            | kam, data, live                                                   |
| status                   | string (enum)       | "available"                       | available, delisted, sold, hold                                   |
| structure                | number              | 2                                 |                                                                   |
| subType                  | string              | "duplex"                          |                                                                   |
| tenanted                 | boolean             | false                             |                                                                   |
| totalAskPrice            | number              | 115                               |                                                                   |
| uds                      | number              | 850                               |                                                                   |
| unitNo                   | string              | "A-1504"                          |                                                                   |
| unitType                 | string (enum)       | "3 bhk"                           | 1 bhk, 2 bhk, 3 bhk, 4 bhk, 5+ bhk                                |
| qcReview                 | object              | {type: "rejected", reason: "..."} |                                                                   |
| video                    | array               | ["video1.mp4", "video2.mp4"]      |                                                                   |
| __position2              | number              | 1                                 |                                                                   |
| _highlightResult         | object              | {assetType: {...}}                |                                                                   |
| priceHistory             | array               | Array of objects                  |                                                                   |
| ├─ priceHistory[].timestamp| number (TS)       | 1717905000000                     |                                                                   | 
| └─ priceHistory[].totalAskPrice | number       | "connected"                       |                                                                   |

---

## rental_inventories

Inventories available for rent.

| Field                    | Type                | Example                           | Enum Options                                                      |
|--------------------------|---------------------|-----------------------------------|-------------------------------------------------------------------|
| propertyId               | string              | "RN005"                           |                                                                   |
| propertyName             | string              | "Halcyon Defence Enclave"         |                                                                   |
| propertyType             | string (enum)       | "villa"                           | villa, apartment, plot, commercial, warehouse, office             |
| configuration            | string (enum)       | "4 bhk"                           | 1 bhk, 2 bhk, 3 bhk, 4 bhk, 5+ bhk                               |
| rentPerMonthInLakhs      | string              | "1.08"                            |                                                                   |
| securityDeposit          | string              | "5.0"                             |                                                                   |
| maintenanceCharges       | string              | "Included"                        |                                                                   |
| leasePeriod              | string              | "11 months"                       |                                                                   |
| lockInPeriod             | string              | "6 months"                        |                                                                   |
| availableFrom            | string              | "Ready-to-move"                   |                                                                   |
| furnishingStatus         | string (enum)       | "semi furnished"                  | fully furnished, semi furnished, unfurnished                     |
| cpId                     | string              | "CPA036"                          |                                                                   |
| kamName                  | string              | "Akhil"                           |                                                                   |
| _geoloc                  | object              | {lat: 13.124, lng: 77.641}       |                                                                   |
| coordinates              | string              | "13.124032, 77.641165"            |                                                                   |
| area                     | string              | "North Bangalore"                 |                                                                   |
| micromarket              | string              | "Thanisandra"                     |                                                                   |
| facing                   | string (enum)       | "east"                            | north, south, east, west, northeast, northwest, southeast, southwest |
| exactFloor               | string              | "Ground Floor"                    |                                                                   |
| floorNumber              | string              | "G+1"                             |                                                                   |
| SBUA                     | string              | "7000"                            |                                                                   |
| plotSize                 | string              | "4000"                            |                                                                   |
| amenities                | string              | "Swimming pool, Gym, Garden"      |                                                                   |
| extraDetails             | string              | "Semi Beautiful Villa with..."    |                                                                   |
| listingScore             | number              | 8.5                               |                                                                   |
| petFriendly              | string              | "Yes"                             |                                                                   |
| vegNonVeg                | string              | "Veg only"                        |                                                                   |
| restrictions             | string              | "No smoking, No parties"          |                                                                   |
| photos                   | array               | ["photo1.jpg", "photo2.jpg"]      |                                                                   |
| videos                   | array               | ["video1.mp4"]                    |                                                                   |
| documents                | array               | ["lease.pdf", "noc.pdf"]          |                                                                   |
| driveFileLinks           | array               | ["https://drive.google.com/..."]  |                                                                   |
| driveLink                | string              | "https://drive.google.com/..."    |                                                                   |
| mapLocation              | string              | "https://maps.app.goo.gl/..."     |                                                                   |
| dateOfInventoryAdded     | number (TS)         | 1739887305                        |                                                                   |
| dateOfStatusLastChecked  | number (TS)         | 1739887305                        |                                                                   |

---

**Timestamps** are stored as numbers (milliseconds since epoch).  
**Arrays** and **objects** are described in detail in each schema file.
