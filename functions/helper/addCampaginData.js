export const addCampaginData = (afterCreate, unixTimestamp) => {
    const userData = afterCreate

    if (userData.campaign === true) {
        userData.leadData = {
            agentName: userData.currentAgent,
            name: userData.name.trim(),
            agentId: userData.agentId,
            phoneNumber: userData.phoneNumber,
            propertyName: userData.projectName.toLowerCase(),
            propertyId: userData.projectId,
            tag: null,
            source: 'google',
            stage: null,
            taskType: null,
            scheduledDate: null,
            leadStatus: null,
            state: 'fresh',
            added: unixTimestamp,
            completionDate: null,
            lastModified: unixTimestamp,
        }
        userData.enquiryData = {
            agentId: userData.agentId,
            propertyId: userData.projectId,
            propertyName: userData.projectName.toLowerCase(),
            source: 'google',
            leadStatus: null,
            stage: null,
            agentHistory: [
                {
                    agentId: userData.agentId,
                    agentName: userData.currentAgent ? userData.currentAgent.toLowerCase() : '',
                    timestamp: unixTimestamp,
                    lastStage: null,
                },
            ],
            notes: [],
            activityHistory: [
                {
                    activityType: 'lead added',
                    timestamp: unixTimestamp,
                    agentName: userData?.currentAgent ? userData?.currentAgent.toLowerCase() : null,
                    data: {},
                },
            ],
            tag: null,
            documents: [],
            state: 'fresh',
            requirements: [],
            added: unixTimestamp,
            lastModified: unixTimestamp,
        }
    }

    return userData
}
