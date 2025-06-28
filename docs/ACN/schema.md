# ACN CRM Schema Design

This document describes the data schema for the ACN CRM system, covering all major collections and their fields.

---

## Collections Overview

- **acn-agents**: Contains all Verified Agent related data and Lead data.
- **acn-enquiries**: Property enquiry data and status.
- **acn-requirements**: Buyer/renter requirements and preferences.
- **acn-properties**: Property inventory data which are qc vertified.
- **acn-qc-inventories**: Properties to be Quality-checked.
- **acn-rental-inventories**: Rental property data.

---

## leads (collection Name - acn-agents)

Stores information about CRM leads, their contact status, interest level, and communication history.

| Field                             | Type        | Options / Enum                                                      | Example                    |
| --------------------------------- | ----------- | ------------------------------------------------------------------- | -------------------------- |
| leadId                            | string      | –                                                                   | "lead_001"                 |
| name                              | string      | –                                                                   | "Rohit Mehra"              |
| phoneNumber                       | string      | –                                                                   | "+919999999999"            |
| emailAddress                      | string      | –                                                                   | "rohit@example.com"        |
| source                            | string      | whatsApp, instagram, facebook, referral, direct                     | "instagram"                |
| leadStatus                        | string      | interested, not interested, not contact yet                         | "interested"               |
| contactStatus                     | string      | connected, not contact, rnr-1 to rnr-6                              | "rnr-2"                    |
| verified                          | boolean     | –                                                                   | true                       |
| blackListed                       | boolean     | –                                                                   | false                      |
| connectHistory                    | array       | Array of objects                                                    | –                          |
| ├─ connectHistory[].timestamp     | number (TS) | –                                                                   | 1717905000000              |
| └─ connectHistory[].connectResult | string      | connected, not connected, on call, on whatsapp, out bound, in bound | "connected"                |
| lastConnected                     | number (TS) | –                                                                   | 1717905000000              |
| lastTried                         | number (TS) | –                                                                   | 1717916400000              |
| kamName                           | string      | –                                                                   | "Anjali Sinha"             |
| kamId                             | string      | –                                                                   | "kam_101"                  |
| notes                             | array       | Array of objects                                                    | –                          |
| ├─ notes[].timestamp              | number (TS) | –                                                                   | 1717900000000              |
| ├─ notes[].kamId                  | string      | –                                                                   | "kam_101"                  |
| ├─ notes[].source                 | string      | –                                                                   | "direct"                   |
| ├─ notes[].note                   | string      | –                                                                   | "Interested in north zone" |
| └─ notes[].archive                | boolean     | –                                                                   | false                      |
| onBroadcast                       | boolean     | –                                                                   | false                      |
| communityJoined                   | boolean     | –                                                                   | true                       |
| added                             | number (TS) | –                                                                   | 1717833600000              |
| lastModified                      | number (TS) | –                                                                   | 1717916400000              |
| extraDetails                      | string      | –                                                                   | "Prefers afternoon calls"  |

---

## agents (collection Name - acn-agents)

Stores detailed profiles of registered channel partners, including business activity, credit details, contact status, and system usage.

| Field                             | Type        | Options / Enum                                                                  | Example                      |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------- | ---------------------------- |
| cpId                              | string      | –                                                                               | "cp_001"                     |
| name\*                            | string      | –                                                                               | "Rajesh Kumar"               |
| phoneNumber\*                     | string      | –                                                                               | "+919876543210"              |
| emailAddress\*                    | string      | –                                                                               | "rajesh@example.com"         |
| workAddress \*                    | string      | –                                                                               | "HSR Layout, Bangalore"      |
| reraId                            | string      | –                                                                               | "RERA123456"                 |
| firmName                          | string      | –                                                                               | "Kumar Properties"           |
| firmSize                          | number      | –                                                                               | 25                           |
| areaOfOperation\*                 | array       | Array of strings                                                                | –                            |
| └─ areaOfOperation[]              | string      | north bangalore, south bangalore, east bangalore, west bangalore, pan bangalore | "north bangalore"            |
| businessCategory\*                | array       | Array of strings                                                                | –                            |
| └─ businessCategory[]             | string      | resale, rental, primary                                                         | "resale"                     |
| preferedMicromarket               | string      | –                                                                               | "Koramangala"                |
| userType                          | string      | basic, trial, premium                                                           | "premium"                    |
| activity                          | string      | active, nudge, no activity                                                      | "active"                     |
| agentStatus                       | string      | interested, not interested, not contact yet                                     | "interested"                 |
| verified                          | boolean     | –                                                                               | true                         |
| verificationDate                  | number (TS) | –                                                                               | 1717833600000                |
| blackListed                       | boolean     | –                                                                               | false                        |
| trialUsed                         | boolean     | –                                                                               | true                         |
| trialStartedAt                    | number (TS) | –                                                                               | 1717750000000                |
| noOfInventories                   | number      | –                                                                               | 45                           |
| inventoryStatus                   | object      | Object with boolean properties                                                  | –                            |
| ├─ inventoryStatus.available      | boolean     | –                                                                               | true                         |
| ├─ inventoryStatus.delisted       | boolean     | –                                                                               | false                        |
| ├─ inventoryStatus.hold           | boolean     | –                                                                               | true                         |
| └─ inventoryStatus.sold           | boolean     | –                                                                               | false                        |
| noOfEnquiries                     | number      | –                                                                               | 120                          |
| noOfRequirements                  | number      | –                                                                               | 35                           |
| noOfLegalLead                     | number      | –                                                                               | 8                            |
| lastConnected                     | number (TS) | –                                                                               | 1717905000000                |
| lastEnquiry                       | number (TS) | –                                                                               | 1717916400000                |
| payStatus                         | string      | will pay, paid, will not, paid by team                                          | "paid"                       |
| planExpiry                        | number (TS) | –                                                                               | 1725667200000                |
| nextRenewal                       | number (TS) | –                                                                               | 1725667200000                |
| paymentHistory                    | array       | Array of objects                                                                | –                            |
| ├─ paymentHistory[].paymentAmount | number      | –                                                                               | 15000                        |
| ├─ paymentHistory[].paymentDate   | number (TS) | –                                                                               | 1717833600000                |
| ├─ paymentHistory[].paymentId     | string      | –                                                                               | "pay_123456"                 |
| └─ paymentHistory[].planId        | string      | –                                                                               | "plan_premium_001"           |
| monthlyCredits                    | number      | –                                                                               | 500                          |
| boosterCredits                    | number      | –                                                                               | 100                          |
| inboundEnqCredits                 | number      | –                                                                               | 250                          |
| inboundReqCredits                 | number      | –                                                                               | 150                          |
| contactStatus                     | string      | connected, not contact, rnr-1 to rnr-6                                          | "connected"                  |
| contactHistory                    | array       | Array of objects                                                                | –                            |
| ├─ contactHistory[].timestamp     | number (TS) | –                                                                               | 1717905000000                |
| └─ contactHistory[].contactResult | string      | connected, not connected, on call, on whatsapp, out bound, in bound             | "connected"                  |
| lastTried                         | number (TS) | –                                                                               | 1717916400000                |
| kamName                           | string      | –                                                                               | "Priya Sharma"               |
| kamId                             | string      | –                                                                               | "kam_101"                    |
| notes                             | array       | Array of objects                                                                | –                            |
| ├─ notes[].timestamp              | number (TS) | –                                                                               | 1717900000000                |
| ├─ notes[].kamId                  | string      | –                                                                               | "kam_101"                    |
| ├─ notes[].source                 | string      | –                                                                               | "contact                     |
| ├─ notes[].note                   | string      | –                                                                               | "Interested in premium plan" |
| └─ notes[].archive                | boolean     | –                                                                               | false                        |
| appInstalled                      | boolean     | –                                                                               | true                         |
| communityJoined                   | boolean     | –                                                                               | true                         |
| onBroadcast                       | boolean     | –                                                                               | false                        |
| onboardingComplete                | boolean     | –                                                                               | true                         |
| source                            | string      | whatsApp, instagram, facebook, referral, direct                                 | "referral"                   |
| lastSeen                          | number (TS) | –                                                                               | 1717916400000                |
| added                             | number (TS) | –                                                                               | 1717750000000                |
| lastModified                      | number (TS) | –                                                                               | 1717916400000                |
| extraDetails                      | string      | –                                                                               | "Premium agent from HSR"     |

---

## enquiries (collection Name - acn-enquiries)

Tracks inquiries made by channel partners (CPs) on properties, along with their current status and update timestamps.

| Field        | Type        | Options / Enum                                       | Example           |
| ------------ | ----------- | ---------------------------------------------------- | ----------------- |
| enquiryId    | string      | –                                                    | "enq_123"         |
| propertyId   | string      | –                                                    | "prop_456"        |
| cpId         | string      | –                                                    | "cp_789"          |
| propertyName | string      | –                                                    | "Sattva Habitat"  |
| buyerName    | string      | –                                                    | "Samarth"         |
| status       | string      | site visit done, pending, not interested, interested | "site visit done" |
| added        | number (TS) | –                                                    | 1719676800000     |
| lastModified | number (TS) | –                                                    | 1719763200000     |

---

## requirements (collection Name - requirements)

Stores property requirements shared by channel partners (CPs), including preferences like asset type, budget, and configuration.

| Field              | Type        | Options / Enum                                        | Example                        |
| ------------------ | ----------- | ----------------------------------------------------- | ------------------------------ |
| requirementId      | string      | –                                                     | "req_001"                      |
| cpId               | string      | –                                                     | "cp_123"                       |
| location           | string      | –                                                     | "Whitefield"                   |
| \_geoloc           | object      | Object with lat/lng coordinates                       | –                              |
| ├─ \_geoloc.lat    | number      | –                                                     | 12.9716                        |
| └─ \_geoloc.lng    | number      | –                                                     | 77.5946                        |
| assetType          | string      | villa, apartment, plot, commercial, warehouse, office | "apartment"                    |
| configuration      | string      | 1 bhk, 2 bhk, 3 bhk, 4 bhk, 5+ bhk                    | "3 bhk"                        |
| budget             | object      | –                                                     |                                |
| ├─budget.from      | number      | –                                                     | 6000000                        |
| └─budget.to        | number      | –                                                     | 9000000                        |
| size               | object      | –                                                     |                                |
| ├─size.from        | number      | –                                                     | 1000                           |
| └─size.to          | number      | –                                                     | 1500                           |
| bedrooms           | string      | –                                                     | "2-3"                          |
| bathrooms          | string      | –                                                     | "2-3"                          |
| parking            | string      | –                                                     | "2-car bike"                   |
| propertyName       | string      | –                                                     | "Prestige Lakeside"            |
| requirementDetails | string      | –                                                     | "Looking for lake-facing flat" |
| marketValue        | string      | –                                                     | "Above 1 Cr"                   |
| requirementStatus  | string      | open, close                                           | "open"                         |
| details            | string      | –                                                     | "Urgent requirement"           |
| internalStatus     | string      | found, not found, pending                             | "pending"                      |
| added              | number (TS) | –                                                     | 1719700000000                  |
| lastModified       | number (TS) | –                                                     | 1719786400000                  |
| matchingProperties | array       | Array of property IDs                                 | ["prop_001", "prop_002"]       |

---

## inventories (collection Name - acn-properties)

Stores live property listings that have successfully passed quality control and are available for customer enquiries and transactions.

| Field                           | Type        | Options / Enum                  | Example                              |
| ------------------------------- | ----------- | ------------------------------- | ------------------------------------ |
| id                              | string      | –                               | "P001"                               |
| propertyId                      | string      | –                               | "prop_001"                           |
| cpId                            | string      | –                               | "cp_123"                             |
| propertyName\*                  | string      | –                               | "Prestige Lakeside Habitat"          |
| \_geoloc                        | object      | Object with lat/lng coordinates | –                                    |
| ├─ \_geoloc.lat                 | number      | –                               | 12.9716                              |
| └─ \_geoloc.lng                 | number      | –                               | 77.5946                              |
| area                            | string      | –                               | "South Bangalore"                    |
| micromarket                     | string      | –                               | "HSR Layout"                         |
| mapLocation                     | string      | –                               | "https://maps.google.com/..."        |
| assetType\*                     | string      | –                               | "Apartment"                          |
| unitType\*                      | string      | –                               | "3 BHK"                              |
| subType                         | string      | –                               | "Simplex"                            |
| sbua\*                          | number      | –                               | 1450                                 |
| carpet                          | null        | –                               | null                                 |
| lastModified                    | number (TS) | –                               | 1717916400000                        |
| plotSize\*                      | null        | –                               | null                                 |
| noOfEnquiries                   | number      | –                               | 25                                   |
| buildingAge                     | null        | –                               | null                                 |
| floorNo                         | string      | –                               | "7th Floor"                          |
| facing                          | string      | –                               | "North"                              |
| tenanted                        | null        | –                               | null                                 |
| totalAskPrice\*                 | number      | –                               | 12500000                             |
| askPricePerSqft\*               | number      | –                               | 8620                                 |
| priceHistory                    | array       | Array of objects                | –                                    |
| ├─ priceHistory[].timestamp     | number (TS) | –                               | 1717905000000                        |
| └─ priceHistory[].totalAskPrice | number      | –                               | 12000000                             |
| status                          | string      | available, delisted, sold,hold  | "Available"                          |
| currentStatus                   | string      | –                               | "Ready to move"                      |
| soldPrice                       | number      | –                               | 11800000                             |
| soldPlatform                    | string      | –                               | "ACN Platform"                       |
| builderName                     | string      | –                               | "Sattva"                             |
| handoverDate                    | number (TS) | –                               | 1717905000000                        |
| buildingKhata                   | null        | –                               | null                                 |
| landKhata                       | null        | –                               | null                                 |
| ocReceived                      | boolean     | –                               | true                                 |
| photo                           | array       | Array of image URLs             | –                                    |
| └─ photo[]                      | string      | –                               | "https://storage.googleapis.com/..." |
| video                           | array       | Array of video URLs             | –                                    |
| document                        | array       | Array of document URLs          | –                                    |
| driveLink                       | string      | –                               | "https://drive.google.com/..."       |
| dateOfInventoryAdded            | number      | –                               | 1717833600000                        |
| dateOfStatusLastChecked         | number      | –                               | 1717916400000                        |
| ageOfInventory                  | number      | –                               | 45                                   |
| ageOfStatus                     | number      | –                               | 12                                   |
| listingScore                    | number      | –                               | 50                                   |
| extraDetails                    | string      | –                               | "Corner unit with garden view"       |

---

## qc_inventories (collection Name - acn-qc-inventories)

Stores quality review records for property listings, including approval status, reviewer comments, and validation by both KAM and data teams.

| Field                                               | Type        | Options / Enum                                                       | Example                              |
| --------------------------------------------------- | ----------- | -------------------------------------------------------------------- | ------------------------------------ |
| propertyId                                          | string      | –                                                                    | "prop_001"                           |
| propertyName\*                                      | string      | –                                                                    | "Prestige Lakeside Habitat"          |
| unitNo                                              | string      | –                                                                    | "A-1204"                             |
| path                                                | string      | –                                                                    | "/properties/prop_001"               |
| \_geoloc                                            | object      | Object with lat/lng coordinates                                      | –                                    |
| ├─ \_geoloc.lat                                     | number      | –                                                                    | 12.9716                              |
| └─ \_geoloc.lng                                     | number      | –                                                                    | 77.5946                              |
| address\*                                           | string      | –                                                                    | "HSR Layout, Sector 1"               |
| area                                                | string      | –                                                                    | "South Bangalore"                    |
| micromarket                                         | string      | –                                                                    | "HSR Layout"                         |
| mapLocation                                         | string      | –                                                                    | "https://maps.google.com/..."        |
| assetType\*                                         | string      | villa, apartment, plot, commercial, warehouse, office                | "apartment"                          |
| unitType                                            | string      | 1 bhk, 2 bhk, 3 bhk, 4 bhk, 5+ bhk                                   | "3 bhk"                              |
| subType\*                                           | string      | –                                                                    | "Simplex"                            |
| communityType\*                                     | string      | gated, open, independent                                             | "gated"                              |
| sbua\*                                              | number      | –                                                                    | 1450                                 |
| carpet                                              | number      | –                                                                    | 1200                                 |
| plotSize\*                                          | number      | –                                                                    | 2400                                 |
| uds                                                 | number      | –                                                                    | 800                                  |
| structure                                           | number      | –                                                                    | 1300                                 |
| buildingAge                                         | number      | –                                                                    | 5                                    |
| floorNo                                             | number      | –                                                                    | 12                                   |
| exactFloor\*                                        | number      | –                                                                    | 12                                   |
| facing\*                                            | string      | north, south, east, west, northeast, northwest, southeast, southwest | "north"                              |
| plotFacing                                          | string      | north, south, east, west                                             | "east"                               |
| balconyFacing                                       | string      | north, south, east, west, outside                                    | "north"                              |
| noOfBalconies                                       | string      | –                                                                    | "2"                                  |
| noOfBathrooms                                       | string      | –                                                                    | "3"                                  |
| carPark                                             | number      | –                                                                    | 2                                    |
| cornerUnit                                          | boolean     | –                                                                    | true                                 |
| extraRoom                                           | array       | Array of room types                                                  | –                                    |
| └─ extraRoom[]                                      | string      | servent room, study room                                             | "study room"                         |
| furnishing\*                                        | string      | fullFurnished, semiFurnished, unfurnished                            | "semiFurnished"                      |
| totalAskPrice\*                                     | number      | –                                                                    | 12500000                             |
| askPricePerSqft\*                                   | number      | –                                                                    | 8620                                 |
| priceHistory                                        | array       | Array of objects                                                     | –                                    |
| ├─ priceHistory[].timestamp                         | number      | –                                                                    | 1717905000000                        |
| └─ priceHistory[].price                             | number      | –                                                                    | 12000000                             |
| rentalIncome                                        | number      | –                                                                    | 35000                                |
| status                                              | string      | available, delisted, sold, hold                                      | "available"                          |
| builderName                                         | null        | –                                                                    | null                                 |
| currentStatus                                       | string      | ready to move, under construction, new launch                        | "ready to move"                      |
| exclusive                                           | boolean     | –                                                                    | false                                |
| tenanted                                            | boolean     | –                                                                    | false                                |
| eKhata                                              | boolean     | –                                                                    | true                                 |
| buildingKhata                                       | string      | –                                                                    | "BBMP_KH_001"                        |
| landKhata                                           | string      | –                                                                    | "SURVEY_123"                         |
| ocReceived                                          | boolean     | –                                                                    | true                                 |
| bdaApproved                                         | boolean     | –                                                                    | true                                 |
| biappaApproved                                      | boolean     | –                                                                    | false                                |
| stage                                               | string      | kam, data, live                                                      | "live"                               |
| qcStatus                                            | string      | approved, pending, reject, duplicate, primary                        | "approved"                           |
| qcReview                                            | object      | Object with review details                                           | –                                    |
| ├─ qcReview.type                                    | string      | rejected, duplicate                                                  | "rejected"                           |
| ├─ qcReview.rejectedFields                          | array       | Array of field names                                                 | –                                    |
| │ └─ qcReview.rejectedFields[]                      | string      | –                                                                    | "askPricePerSqft"                    |
| ├─ qcReview.qcNote                                  | string      | –                                                                    | "Price seems too high"               |
| └─ qcReview.originalPropertyId                      | string      | –                                                                    | "prop_original_001"                  |
| kamStatus                                           | string      | approved, pending, rejected                                          | "approved"                           |
| cpId                                                | string      | –                                                                    | "cp_123"                             |
| kamName                                             | string      | –                                                                    | "Priya Sharma"                       |
| kamId                                               | string      | –                                                                    | "kam_101"                            |
| handoverDate                                        | number (TS) | –                                                                    | 1717833600000                        |
| photo                                               | array       | Array of image URLs                                                  | –                                    |
| └─ photo[]                                          | string      | –                                                                    | "https://storage.googleapis.com/..." |
| video                                               | array       | Array of video URLs                                                  | –                                    |
| └─ video[]                                          | string      | –                                                                    | "https://storage.googleapis.com/..." |
| document                                            | array       | Array of document URLs                                               | –                                    |
| └─ document[]                                       | string      | –                                                                    | "https://storage.googleapis.com/..." |
| driveLink                                           | string      | –                                                                    | "https://drive.google.com/..."       |
| noOfEnquiries                                       | number      | –                                                                    | 25                                   |
| dateOfInventoryAdded                                | number (TS) | –                                                                    | 1717833600000                        |
| lastModified                                        | number (TS) | –                                                                    | 1717916400000                        |
| dateOfStatusLastChecked                             | number (TS) | –                                                                    | 1717916400000                        |
| ageOfInventory                                      | number      | –                                                                    | 45                                   |
| ageOfStatus                                         | number      | –                                                                    | 12                                   |
| qcHistory                                           | array       | Array of objects                                                     | –                                    |
| ├─ qcHistory[].timestamp                            | number (TS) | –                                                                    | 1717900000000                        |
| └─ qcHistory[].qcStatus                             | string      | –                                                                    | "approved"                           |
| extraDetails                                        | string      | –                                                                    | "Corner unit with garden view"       |
| \_\_position2                                       | number      | –                                                                    | 1                                    |
| \_highlightResult                                   | object      | Search highlighting object                                           | –                                    |
| ├─ \_highlightResult.assetType                      | object      | Highlight details for assetType                                      | –                                    |
| │ ├─ \_highlightResult.assetType.matchLevel         | string      | –                                                                    | "none"                               |
| │ ├─ \_highlightResult.assetType.matchedWords       | array       | Array of matched words                                               | –                                    |
| │ │ └─ \_highlightResult.assetType.matchedWords[]   | string      | –                                                                    | "apartment"                          |
| │ └─ \_highlightResult.assetType.value              | string      | –                                                                    | "apartment"                          |
| ├─ \_highlightResult.micromarket                    | object      | Highlight details for micromarket                                    | –                                    |
| │ ├─ \_highlightResult.micromarket.matchLevel       | string      | –                                                                    | "none"                               |
| │ ├─ \_highlightResult.micromarket.matchedWords     | array       | Array of matched words                                               | –                                    |
| │ │ └─ \_highlightResult.micromarket.matchedWords[] | string      | –                                                                    | "HSR"                                |
| │ └─ \_highlightResult.micromarket.value            | string      | –                                                                    | "HSR Layout"                         |
| └─ \_highlightResult.sbua                           | object      | Highlight details for sbua                                           | –                                    |
| ├─ \_highlightResult.sbua.matchLevel                | string      | –                                                                    | "none"                               |
| ├─ \_highlightResult.sbua.matchedWords              | array       | Array of matched words                                               | –                                    |
| │ └─ \_highlightResult.sbua.matchedWords[]          | string      | –                                                                    | "1450"                               |
| └─ \_highlightResult.sbua.value                     | string      | –                                                                    | "1450"                               |

---

## rental_inventories (collection Name - acn-rental-inventories)

Inventories available for rent.

| Field                   | Type        | Options / Enum                                                       | Example                              |
| ----------------------- | ----------- | -------------------------------------------------------------------- | ------------------------------------ | --- |
| propertyId              | string      | –                                                                    | "rental_001"                         |
| propertyName\*          | string      | –                                                                    | "Prestige Shantiniketan"             |
| assetType\*             | string      | villa, apartment, plot, commercial, warehouse, office                | "apartment"                          |
| configuration\*         | string      | 1 bhk, 2 bhk, 3 bhk, 4 bhk, 5+ bhk                                   | "3 bhk"                              |
| \_geoloc                | object      | Object with lat/lng coordinates                                      | –                                    |
| ├─ \_geoloc.lat         | number      | –                                                                    | 12.9716                              |
| └─ \_geoloc.lng         | number      | –                                                                    | 77.5946                              |
| area                    | string      | –                                                                    | "South Bangalore"                    |
| micromarket             | string      | –                                                                    | "HSR Layout"                         |
| mapLocation             | string      | –                                                                    | "https://maps.google.com/..."        |
| rentPerMonthInLakhs\*   | string      | –                                                                    | "0.45"                               |
| securityDeposit\*       | string      | –                                                                    | "4.5"                                |
| noOfEnquiries           | number      | –                                                                    | 25                                   |
| maintenanceCharges\*    | string      | –                                                                    | "8000"                               |
| leasePeriod             | string      | –                                                                    | "24 months"                          |
| lastModified            | number (TS) | –                                                                    | 1717916400000                        |
| lockInPeriod            | string      | –                                                                    | "12 months"                          |
| availableFrom           | string      | –                                                                    | "01-Feb-2025"                        |
| facing\*                | string      | north, south, east, west, northeast, northwest, southeast, southwest | "north"                              |
| exactFloor              | string      | –                                                                    | "7"                                  |
| floorNumber             | string      | –                                                                    | "7th Floor"                          |
| sbua\*                  | string      | –                                                                    | "1450"                               |
| plotSize\*              | string      | –                                                                    | "–"                                  |
| furnishingStatus        | string      | fully furnished, semi furnished, unfurnished                         | "semi furnished"                     |
| amenities               | string      | –                                                                    | "Swimming pool, Gym, Club house"     |
| petFriendly             | string      | –                                                                    | "Yes"                                |
| vegNonVeg               | string      | –                                                                    | "Veg only"                           |
| restrictions            | string      | –                                                                    | "No smoking, No parties"             |
| photos                  | array       | Array of image URLs                                                  | –                                    |
| └─ photos[]             | string      | –                                                                    | "https://storage.googleapis.com/..." |
| videos                  | array       | Array of video URLs                                                  | –                                    |
| └─ videos[]             | string      | –                                                                    | "https://storage.googleapis.com/..." |
| documents               | array       | Array of document URLs                                               | –                                    |
| └─ documents[]          | string      | –                                                                    | "https://storage.googleapis.com/..." |
| driveFileLinks          | array       | Array of Google Drive links                                          | –                                    |
| └─ driveFileLinks[]     | string      | –                                                                    | "https://drive.google.com/..."       |
| driveLink               | string      | –                                                                    | "https://drive.google.com/..."       |
| cpId                    | string      | –                                                                    | "cp_123"                             |
| kamName                 | string      | –                                                                    | "Priya Sharma"                       |
| listingScore            | number      | –                                                                    | 85                                   |
| dateOfInventoryAdded    | number (TS) | –                                                                    | 1717833600000                        |
| dateOfStatusLastChecked | number (TS) | –                                                                    | 1717916400000                        |
| extraDetails            | string      | –                                                                    | "Corner unit with garden view"       |     |

---

**Timestamps** are stored as numbers (milliseconds since epoch).  
**Arrays** and **objects** are described in detail in each schema file.
