# Canvas-Homes CRM Schema Design

This document describes the data schema for the Canvas-Homes CRM system, covering all major collections and their fields.

---

## Collections Overview

- **canvas_homes-users**: Stores user details including contact information and timestamps.
- **canvas_homes-leads**: Stores information about CRM leads, their contact status, interest level, and communication history.
- **canvas_homes-campaigns**: Stores marketing campaign details including campaign metadata, budget, dates, and lead counts.
- **canvas_homes-enquiries**: Tracks property enquiries made by leads, current status, activity history, and agent notes.
- **canvas_homes-tasks**: Contains scheduled tasks or activities assigned to agents related to enquiries, including status and deadlines.

---

## users (collection Name - canvas_homes-users)

Stores basic information about users including contact details and timestamps for creation and last modification.


| Field        | Type        | Example              | Options |
| ------------ | ----------- | -------------------- | ------- |
| userId       | string      | "user_001"           | —       |
| name         | string      | "Anjali Sinha"       | —       |
| phonenumber  | string      | "+919999999999"      | —       |
| emailAddress | string      | "anjali@example.com" | —       |
| added        | number (TS) | 1717833600000        | —       |
| lastModified | number (TS) | 1717916400000        | —       |

---

## leads (collection Name - canvas_homes-leads)

Stores information about CRM leads, their contact status, interest level, and communication history.

| Field        | Type        | Example           | Options                                                                                    |
| ------------ | ----------- | ----------------- | ------------------------------------------------------------------------------------------ |
| leadId       | string      | "lead_001"        | —                                                                                          |
| agentId      | string      | "agent_123"       | —                                                                                          |
| agentName    | string      | "Rahul Mehta"     | —                                                                                          |
| userId       | string      | "user_789"        | —                                                                                          |
| source       | string      | "Facebook Ads"    | —                                                                                          |
| stage        | string      | "lead registered" | lead registered \| initial contacted \| site visited \| eoi collected \| booking confirmed |
| taskType     | string      | "lead registration"| lead registration \| initial contact \| site visit \| eoi collection \| booking             |
| status       | string      | "open"            | open \| closed \| fresh \| dropped                                                         |
| added        | number (TS) | 1717833600000     | —                                                                                          |
| lastModified | number (TS) | 1717916400000     | —                                                                                          |

## campaigns (collection Name - canvas_homes-campaigns)

Stores marketing campaign details including campaign metadata, budget, dates, and lead counts.

| Field        | Type        | Example        |
| ------------ | ----------- | -------------- |
| campaignId   | string      | "cmp_001"      |
| propertyName | string      | "Green Villas" |
| campaignName | string      | "March Promo"  |
| source       | string      | "Facebook"     |
| medium       | string      | "CPC"          |
| startDate    | number (TS) | 1717737600000  |
| endDate      | number (TS) | 1718342400000  |
| totalCost    | number      | 15000          |
| totalLeads   | number      | 240            |
| added        | number (TS) | 1717651200000  |
| lastModified | number (TS) | 1717923600000  |

---

## enquiries (collection Name - canvas_homes-enquiries)

Tracks property enquiries made by leads, current status of enquiry, activity history, and notes by agents.

| Field                               | Type        | Example           | Options                                                                                                                                                      |
| ----------------------------------- | ----------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| enquiryId                           | string      | "enq_001"         | —                                                                                                                                                            |
| leadId                              | string      | "lead_123"        | —                                                                                                                                                            |
| agentId                             | string      | "agent_456"       | —                                                                                                                                                            |
| propertyName                        | string      | "Green Villas"    | —                                                                                                                                                            |
| source                              | string      | "Facebook Ads"    | —                                                                                                                                                            |
| status                              | string      | "interested"      | interested \| follow up \| not interested \| not connected \| visit unsuccessful \| visit dropped \| eoi dropped \| booking dropped \| requirement collected |
| stage                               | string      | "lead registered" | lead registered \| initial contacted \| site visited \| eoi collected \| booking confirmed                                                                   |
| agentHistory                        | array       | Array of objects  | —                                                                                                                                                            |
| ├─ agentHistory[].timestamp         | number (TS) | 1717905000000     | —                                                                                                                                                            |
| ├─ agentHistory[].agentId           | string      | "Rahul Mehta"     | —                                                                                                                                                            |
| └─ agentHistory[].lastStage         | string      | "site visited"    | —                                                                                                                                                            |
| notes                               | array       | Array of objects  | —                                                                                                                                                            |
| ├─ notes[].timestamp                | number (TS) | 1717906000000     | —                                                                                                                                                            |
| ├─ notes[].agentId                  | string      | "agent_456"       | —                                                                                                                                                            |
| └─ notes[].note                     | string      | "Follow up call"  | —                                                                                                                                                            |
| activityHistory                     | array       | Array of objects  | —                                                                                                                                                            |
| ├─ activityHistory[].timestamp      | number (TS) | 1717907000000     | —                                                                                                                                                            |
| ├─ activityHistory[].agentId        | string      | "agent_456"       | —                                                                                                                                                            |
| ├─ activityHistory[].activityType   | string      | "call"            | —                                                                                                                                                            |
| ├─ activityHistory[].activityStatus | string      | "completed"       | —                                                                                                                                                            |
| └─ activityHistory[].activityNote   | string      | "Left voicemail"  | —                                                                                                                                                            |
| tag                                 | string      | "hot"             | cold \| potential \| hot \| super hot                                                                                                                        |
| added                               | number (TS) | 1717833600000     | —                                                                                                                                                            |
| lastModified                        | number (TS) | 1717916400000     | —                                                                                                                                                            |

---

## tasks (collection Name - canvas_homes-tasks)

Contains scheduled tasks or activities assigned to agents related to enquiries, including status and deadlines.

| Field          | Type        | Example             | Options                                                                         |
| -------------- | ----------- | ------------------- | ------------------------------------------------------------------------------- |
| taskId         | string      | "task_001"          | —                                                                               |
| enquiryId      | string      | "enq_123"           | —                                                                               |
| agentId        | string      | "agent_456"         | —                                                                               |
| agentName      | string      | "Rahul Mehta"       | —                                                                               |
| type           | string      | "lead registration" | lead registration \| initial contact \| site visit \| eoi collection \| booking |
| status         | string      | "open"              | open \| complete                                                                |
| scheduledDate  | number (TS) | 1717833600000       | —                                                                               |
| added          | number (TS) | 1717651200000       | —                                                                               |
| completionDate | number (TS) | 1717923600000       | —                                                                               |
| lastModified   | number (TS) | 1717927200000       | —                                                                               |
