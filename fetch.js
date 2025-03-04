// Store the last fetched numerical values globally
const lastFetchedValues = {};
let originalFieldValues = [];


function fetchAndAssignFieldData(channelNumber, fieldNumber, elementId) {
    // Append the channel number to the element ID
    const elementIdWithChannel = `${elementId}-${channelNumber}`;

    function handleSearchInput() {
        const searchInput = document.querySelector('.search-input');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();

            const filteredValues = originalFieldValues.filter(value => {
                return value.toString().toLowerCase().includes(searchTerm);
            });

            console.log('Filtered Values:', filteredValues);
            // Update your UI or perform other operations with the filtered values
        });
    }

    function fetchDataAndUpdate() {
        fetch(`https://api.thingspeak.com/channels/${channelNumber}/fields/${fieldNumber}.json?results=1`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not OK');
                }
                return response.json();
            })
            .then(data => {
                const latestValue = data.feeds && data.feeds.length > 0 ? data.feeds[0][`field${fieldNumber}`] : null;

                let lastFetchedValue = parseFloat(latestValue);
                if (isNaN(lastFetchedValue) && data.feeds && data.feeds.length > 0) {
                    const currentTime = new Date();
                    const thirtyMinutesAgo = currentTime - 30 * 60 * 1000;
                    const pastData = data.feeds.filter(feed => new Date(feed.created_at).getTime() >= thirtyMinutesAgo);

                    for (let i = pastData.length - 1; i >= 0; i--) {
                        lastFetchedValue = parseFloat(pastData[i][`field${fieldNumber}`]);
                        if (!isNaN(lastFetchedValue)) {
                            lastFetchedValues[fieldNumber] = lastFetchedValue;
                            break;
                        }
                    }
                } else if (!isNaN(lastFetchedValue)) {
                    lastFetchedValues[fieldNumber] = lastFetchedValue;
                }

                const displayValue = lastFetchedValues[fieldNumber] || 'N/A';
                document.getElementById(elementIdWithChannel).textContent = ` : ${displayValue}`;

                const progressBar = document.getElementById(`field${fieldNumber}-progress-${channelNumber}`);
                const progressBarPercentage = document.getElementById(`field${fieldNumber}-progress-percentage-${channelNumber}`);

                var percentage = (lastFetchedValues[fieldNumber] || 0) * 1;
                percentage=(percentage/4)*10;
                progressBar.style.width = `${(percentage.toFixed(2))}%`;
                progressBarPercentage.textContent = `${percentage.toFixed(2)}%`;
                progressBar.setAttribute('aria-valuenow', percentage.toFixed(2));

                handleSearchInput();
            })
            .catch(error => {
                console.error(`Error fetching data for Field ${fieldNumber}:`, error);
                const displayValue = lastFetchedValues[fieldNumber] || 'N/A';
                document.getElementById(elementIdWithChannel).textContent = `Field ${fieldNumber} Value: ${displayValue}`;

                const progressBar = document.getElementById(`field${fieldNumber}-progress-${channelNumber}`);
                progressBar.style.width = `0%`;
                progressBar.setAttribute('aria-valuenow', 0);
                progressBar.textContent = '0%';
            })
            
    }

    setInterval(fetchDataAndUpdate, 10);

    fetchDataAndUpdate();
}

// Example usage
fetchAndAssignFieldData(2449872, 1, 'field1-value');
fetchAndAssignFieldData(2449873, 1, 'field1-value');
fetchAndAssignFieldData(2449874, 1, 'field1-value');
fetchAndAssignFieldData(2449875, 1, 'field1-value');


