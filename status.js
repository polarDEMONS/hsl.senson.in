// Define an array of channel configurations
const channelConfigurations = [
    { channelId: '2449872', fieldNumber: '1', labelId: 'Crane1', name: 'Machine1' },
	{ channelId: '2449873', fieldNumber: '1', labelId: 'Crane2', name: 'Machine2'  },
	{ channelId: '2449874', fieldNumber: '1', labelId: 'Crane3' , name: 'Machine3' },
	{ channelId: '2449875', fieldNumber: '1', labelId: 'Crane4' , name: 'Machine4' },
    
    // Add more channel configurations as needed
];

// Function to fetch data from ThingSpeak
async function fetchData(channelId, field) {
    const url = `https://api.thingspeak.com/channels/${channelId}/fields/${field}.json?results=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.feeds[0][`field${field}`];
    } catch (error) {
        console.error(`Error fetching data for channel ${channelId} field ${field}:`, error);
        return null;
    }
}

// Function to fetch the timestamp of the last entry in the channel
async function fetchLastEntryTimestamp(channelId) {
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.feeds && data.feeds.length > 0) {
            return new Date(data.feeds[0].created_at).getTime();
        }
    } catch (error) {
        console.error(`Error fetching last entry timestamp for channel ${channelId}:`, error);
    }
    return 0; // Default to 0 if unable to fetch timestamp
}

// Function to update field status labels
async function updateFieldStatusLabels() {
    const currentTime = Date.now();
    const thirtyMinutesAgo = currentTime - 01 * 60 * 1000; // 30 minutes in milliseconds

    for (const config of channelConfigurations) {
        const value = await fetchData(config.channelId, config.fieldNumber);
        const labelId = config.labelId;
        const name = config.name;
        const labelElement = document.getElementById(labelId);
        if (labelElement) {
            if (value !== null) {
                // Check the timestamp of the last data entry
                const lastEntryTimestamp = await fetchLastEntryTimestamp(config.channelId);
                if (lastEntryTimestamp >= thirtyMinutesAgo) {
                    // Field is active
                    labelElement.textContent = `${name}: Active`;
                    labelElement.style.color = 'green';
                } else {
                    // Field is offline
                    labelElement.textContent = `${name}: Offline`;
                    labelElement.style.color = 'grey';
                }
                // Check for warning state (customize as needed)
                if (value > 30) {
                    labelElement.textContent += ' (Warning)';
                    labelElement.style.color = 'red';
                }
            } else {
                // Field is offline
                labelElement.textContent = `${name}: Offline`;
                labelElement.style.color = 'grey';
            }
        }
    }
}

// Update field status labels when the page loads
window.addEventListener('load', updateFieldStatusLabels);

// Optionally, you can update the labels periodically using setInterval:
setInterval(updateFieldStatusLabels, 1000); // Update every 1 second
