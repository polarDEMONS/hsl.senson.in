// Define an array of gauge configurations
const gaugeConfigurations = [
    {
        channelNumber: '2449872',
        fieldNumber: 'field1',
        chartId: 'gauge_2449872_field1', // Generate a unique ID for each gauge
        color: '#ff942e' // Specify the gauge color
    },
    {
        channelNumber: '2449873',
        fieldNumber: 'field1',
        chartId: 'gauge_2449873_field1', // Generate a unique ID for each gauge
        color: '#4f3ff0' // Specify the gauge color
    },
    {
        channelNumber: '2449874',
        fieldNumber: 'field1',
        chartId: 'gauge_2449874_field1', // Generate a unique ID for each gauge
        color: '#096c86' // Specify the gauge color
    },
    {
        channelNumber: '2449875',
        fieldNumber: 'field1',
        chartId: 'gauge_2449875_field1', // Generate a unique ID for each gauge
        color: '#df3670' // Specify the gauge color
    },
	
    {
        channelNumber: 'CHANNEL_NUMBER_HERE',
        fieldNumber: 'FIELD_NUMBER_HERE',
        chartId: 'gauge_CHANNEL_NUMBER_HERE_FIELD_NUMBER_HERE',
        color: '#ff5733' // Specify the gauge color
    },
    // Add more gauge configurations as needed
];

// Function to fetch data and render gauge
function fetchDataAndRenderGauge(config) {
    fetch(`https://api.thingspeak.com/channels/${config.channelNumber}/fields/${config.fieldNumber}/last.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data); // Log the received data

            // Check if the data contains the specified field number
            if (config.fieldNumber in data && data[config.fieldNumber] !== null && !isNaN(data[config.fieldNumber])) {
                const recentValue = parseFloat(data[config.fieldNumber]);
                console.log('Parsed value:', recentValue); // Log the parsed value

                // Render the gauge using JustGage
                if (window.myGauges && window.myGauges[config.chartId]) {
                    window.myGauges[config.chartId].refresh(recentValue);
                } else {
                    window.myGauges = window.myGauges || {};
                    window.myGauges[config.chartId] = new JustGage({
                        id: config.chartId,
                        value: recentValue,
                        min: 0,
                        max: 100, // Adjust according to your requirements
                        title: `${config.fieldNumber} Gauge`,
                        label: 'amps',
                        gaugeWidthScale: 0.6,
                        counter: true,
                        relativeGaugeSize: true,
                        valueFontColor: config.color,
                        levelColors: [config.color],
                        decimals: 1
                    });
                }
            } else {
                console.error('Field value is invalid or missing');
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
        });
}

// Function to fetch data and update gauge every 5 seconds
function updateGauges() {
    gaugeConfigurations.forEach(config => fetchDataAndRenderGauge(config));
    setTimeout(updateGauges, 5000);
}

// Call the function to update gauges initially
updateGauges();
