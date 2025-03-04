// Define an array of chart configurations
const chartConfigurations = [
    {
        channelNumber: '2449872',
        fieldNumber: 'field1',
        numResults: 50,
        chartId: 'chart_2449872_field1', // Generate a unique ID for each chart
        color: '#ff942e', // Specify the chart color
    },
    {
        channelNumber: '2449873',
        fieldNumber: 'field1',
        numResults: 50,
        chartId: 'chart_2449873_field1', // Generate a unique ID for each chart
        color: '#4f3ff0', // Specify the chart color
    },
    {
        channelNumber: '2449874',
        fieldNumber: 'field1',
        numResults: 50,
        chartId: 'chart_2449874_field1', // Generate a unique ID for each chart
        color: '#096c86', // Specify the chart color
    },
    {
        channelNumber: '2449875',
        fieldNumber: 'field1',
        numResults: 50,
        chartId: 'chart_2449875_field1', // Generate a unique ID for each chart
        color: '#df3670', // Specify the chart color
    },
];

// Function to fetch data and render chart
function fetchDataAndRenderChart(config) {
    const ctx = document.getElementById(config.chartId)?.getContext('2d');
    if (!ctx) {
        console.error(`Canvas element not found for chart ID: ${config.chartId}`);
        return;
    }

    // Function to fetch data from ThingSpeak
    function fetchData() {
        return fetch(`https://api.thingspeak.com/channels/${config.channelNumber}/feeds.json?results=${config.numResults}`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch data');
                return response.json();
            })
            .catch((error) => {
                console.error(`Error fetching data for chart ID: ${config.chartId}`, error);
                return null;
            });
    }

    // Function to update chart with fetched data
    function updateChart(data) {
        if (!data) return;

        const feeds = data.feeds.slice(-config.numResults);
        const values = feeds.map((feed) => parseFloat(feed[config.fieldNumber]));
        const timestamps = feeds.map((feed) => new Date(feed.created_at).getTime());

        const chartData = {
            labels: Array.from({ length: config.numResults }, (_, i) => ''),
            datasets: [
                {
                    label: ` ${config.fieldNumber} `,
                    data: values,
                    fill: false,
                    borderColor: config.color, // Use the specified chart color
                    tension: 0.4,
                },
            ],
        };

        const options = {
            animation: {
                duration: 0, // Disable animation for updates
            },
            scales: {
                x: {
                    display: true, // Hide x-axis labels
                    title: {
                        display: true,
                        text: `Time`,
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: `Amperes`,
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `Value: ${context.parsed.y} \u2103`;
                        },
                        title: (context) => {
                            const timestampIndex = context[0].dataIndex;
                            const fullTimestamp = new Date(timestamps[timestampIndex]);
                            const formattedTimestamp = `${fullTimestamp.toLocaleDateString()} ${fullTimestamp.toLocaleTimeString()}`;
                            return `Timestamp: ${formattedTimestamp}`;
                        },
                    },
                },
            },
        };

        // Update the existing chart or create a new one if not exists
        if (window.myCharts && window.myCharts[config.chartId]) {
            window.myCharts[config.chartId].data = chartData;
            window.myCharts[config.chartId].options = options;
            window.myCharts[config.chartId].update();
        } else {
            window.myCharts = window.myCharts || {};
            window.myCharts[config.chartId] = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: { ...options, animation: { duration: 1000 } }, // Enable animation for initial load
            });
        }
    }

    // Fetch data and update chart initially
    fetchData().then(updateChart);

    // Set interval to fetch data and update chart every 5 seconds
    setInterval(() => {
        fetchData().then(updateChart);
    }, 5000);
}

// Call the function for each chart configuration
chartConfigurations.forEach((config) => fetchDataAndRenderChart(config));
