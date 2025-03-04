const notificationchannels = ["2449872", "2449873", "2449874", "2449875"];
const notificationfields = ["1", "1", "1", "1"];
const craneNames = ["Machine 1", "Machine 2", "Machine 3", "Machine 4"];
const currentTime = Date.now();
const thirtyMinutesAgo = currentTime - 30 * 60 * 1000;
async function fetchDataForChannel(channel, field, index) {
  const apiUrl = `https://api.thingspeak.com/channels/${channel}/fields/${field}.json?results=10`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const field1Values = data.feeds.map(feed => feed.field1);

    if (data && data.feeds && data.feeds.length > 0) {
      const entryTime = new Date(data.feeds[0].created_at).getTime();
      if (entryTime >= thirtyMinutesAgo) {
        for (let i = 0; i < field1Values.length; i++) {
          if (field1Values[i] >= Temperaturelimit) {
            return { value: field1Values[i], index: index };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching data from ThingSpeak:', error);
  }
  return null;
}

async function fetchDataforAppNotifications() {
  const arr = [];

  const fetchPromises = notificationchannels.map((channel, index) => 
    fetchDataForChannel(channel, notificationfields[index], index)
  );

  const results = await Promise.all(fetchPromises);

  results.forEach(result => {
    if (result !== null) {
      arr.push(result);
    }
  });

  return arr;
}

// Example usage
async function fetchDataAndRenderLeaderboard() {
  try {
    const arr = await fetchDataforAppNotifications();
    renderLeaderboard(arr);
  } catch (error) {
    console.error('Error in fetchData:', error);
  }
}

// Initial fetch and render
fetchDataAndRenderLeaderboard();
setInterval(fetchDataAndRenderLeaderboard, 3000);

function renderLeaderboard(arr) {
  const messageBoxContainer = document.getElementById('message-box-container');
  messageBoxContainer.innerHTML = ''; 
  console.log(arr);
  arr.forEach(({ value, index }) => {
      
    messageBoxContainer.appendChild(createMessageBox(value, craneNames[index]));
  });
}

// Function to create DOM
function createMessageBox(temperature, craneName) {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');

  const profileImage = document.createElement('img');
  profileImage.src = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80';
  profileImage.alt = 'profile image';
  profileImage.classList.add('profile-image');

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');

  const messageHeader = document.createElement('div');
  messageHeader.classList.add('message-header');

  const nameElement = document.createElement('div');
  nameElement.classList.add('name');
  nameElement.textContent = 'Plant1 Supervisor';

  const starCheckbox = document.createElement('div');
  starCheckbox.classList.add('star-checkbox');

  const inputCheckbox = document.createElement('input');
  inputCheckbox.type = 'checkbox';
  inputCheckbox.id = `star-${craneName.replace(' ', '-')}`;

  const labelForCheckbox = document.createElement('label');
  labelForCheckbox.htmlFor = `star-${craneName.replace(' ', '-')}`;

  const starSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  starSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  starSvg.setAttribute('width', '20');
  starSvg.setAttribute('height', '20');
  starSvg.setAttribute('viewBox', '0 0 24 24');
  starSvg.setAttribute('fill', 'none');
  starSvg.setAttribute('stroke', 'currentColor');
  starSvg.setAttribute('stroke-width', '2');
  starSvg.setAttribute('stroke-linecap', 'round');
  starSvg.setAttribute('stroke-linejoin', 'round');
  starSvg.classList.add('feather', 'feather-star');

  const starPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  starPolygon.setAttribute('points', '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2');

  const messageLine = document.createElement('p');
  messageLine.classList.add('message-line');
  messageLine.textContent = `${craneName} is experiencing high current of ${temperature}amps - Action Needed`;

  const messageTime = document.createElement('p');
  messageTime.classList.add('message-line', 'time');
  messageTime.textContent = new Date().toLocaleString();

  // Append elements to their respective parents
  starSvg.appendChild(starPolygon);
  labelForCheckbox.appendChild(starSvg);
  starCheckbox.appendChild(inputCheckbox);
  starCheckbox.appendChild(labelForCheckbox);

  messageHeader.appendChild(nameElement);
  messageHeader.appendChild(starCheckbox);

  messageContent.appendChild(messageHeader);
  messageContent.appendChild(messageLine);
  messageContent.appendChild(messageTime);

  messageBox.appendChild(profileImage);
  messageBox.appendChild(messageContent);

  return messageBox;
}


