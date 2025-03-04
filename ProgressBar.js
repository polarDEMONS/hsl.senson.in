// Define progress bar configurations
const progressBarConfigurations = [
    {
        channelNumber: '2449872',
        fieldNumber: 'field1',
        chartId: 'progress_bar_2449872_field1',
        color: '#ff942e',
    },
    {
        channelNumber: '2449873',
        fieldNumber: 'field1',
        chartId: 'progress_bar_2449873_field1',
        color: '#4f3ff0',
    },
    {
        channelNumber: '2449874',
        fieldNumber: 'field1',
        chartId: 'progress_bar_2449874_field1',
        color: '#096c86',
    },
    {
        channelNumber: '2449875',
        fieldNumber: 'field1',
        chartId: 'progress_bar_2449875_field1',
        color: '#df3670',
    },
];

// Function to fetch data and update the progress bar
function fetchDataAndUpdateProgressBar(config) {
    const url = `https://api.thingspeak.com/channels/${config.channelNumber}/fields/${config.fieldNumber}/last.json`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch data');
            return response.json();
        })
        .then(data => {
            console.log(`Data received for ${config.chartId}:`, data);

            // Parse the field value
            const fieldValue = parseFloat(data[config.fieldNumber]);

            if (!isNaN(fieldValue)) {
                // Calculate progress as (3 * field1) * 100
                let progressValue = (3 * fieldValue) * 100;

                // Clamp the progress value between 0 and 100
                progressValue = Math.min(Math.max(progressValue, 0), 100);

                console.log(`Progress value for ${config.chartId}:`, progressValue);

                // Update the progress bar
                const progressBar = document.getElementById(config.chartId);
                if (progressBar) {
                    progressBar.style.width = `${progressValue}%`;
                    progressBar.style.backgroundColor = config.color;
                } else {
                    console.error(`Progress bar element not found for ID: ${config.chartId}`);
                }
            } else {
                console.error(`Invalid field value for ${config.chartId}:`, fieldValue);
            }
        })
        .catch(error => {
            console.error(`Error fetching or processing data for ${config.chartId}:`, error);
        });
}

// Periodically update progress bars
setInterval(() => {
    progressBarConfigurations.forEach(config => fetchDataAndUpdateProgressBar(config));
}, 5000);
