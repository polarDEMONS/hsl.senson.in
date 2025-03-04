// Define your channels and fields
const channels = [
    { channelId: 2449872, field: 1 },
    { channelId: 2449873, field: 1 },
    { channelId: 2449874, field: 1 },
    { channelId: 2449875, field: 1 },

    
    // Add more channels and fields as needed
];

// Function to fetch data from a ThingSpeak channel
async function fetchData(channelId, field) {
    const url = `https://api.thingspeak.com/channels/${channelId}/fields/${field}.json?results=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}


// Function to count active, offline, and warning sensors
async function countActiveOfflineAndWarningSensors(channels) {
    let activeSensorCount = 0;
    let offlineSensorCount = 0;
    let warningSensorCount = 0;

    const currentTime = Date.now();
    const thirtyMinutesAgo = currentTime - 01 * 60 * 1000; // 30 minutes in milliseconds

    for (const { channelId, field } of channels) {
        try {
            const data = await fetchData(channelId, field);
            if (data && data.feeds && data.feeds.length > 0) {
                // Check if the latest entry in the feed indicates an active sensor
                if (data.feeds[0][`field${field}`] !== null) {
                    // Check if the latest entry is within the last 30 minutes
                    const entryTime = new Date(data.feeds[0].created_at).getTime();
                    if (entryTime >= thirtyMinutesAgo) {
                        activeSensorCount++;

                        // Check if the last fetched numerical value is greater than 30
                        const lastValue = parseFloat(data.feeds[0][`field${field}`]);
                        if (!isNaN(lastValue) && lastValue > 30) {
                            warningSensorCount++;
                        }
                    } else {
                        offlineSensorCount++;
                    }
                } else {
                    offlineSensorCount++;
                }
            } else {
                offlineSensorCount++;
            }
        } catch (error) {
            console.error(`Error fetching data for channel ${channelId} field ${field}:`, error);
            offlineSensorCount++;
        }
    }

    return { activeSensorCount, offlineSensorCount, warningSensorCount };
}

// Call the function to count active, offline, and warning sensors
countActiveOfflineAndWarningSensors(channels).then(({ activeSensorCount, offlineSensorCount, warningSensorCount }) => {
    const activeCountElement = document.getElementById('activeSensorCount');
    activeCountElement.textContent = activeSensorCount;

    const offlineCountElement = document.getElementById('offlineSensorCount');
    offlineCountElement.textContent = offlineSensorCount;

    const warningCountElement = document.getElementById('warningSensorCount');
    warningCountElement.textContent = warningSensorCount;
}).catch(error => {
    console.error('Error counting active, offline, and warning sensors:', error);
});





