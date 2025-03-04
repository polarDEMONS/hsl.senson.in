const apiUrl = `https://api.thingspeak.com/channels/2194152/fields/1.json?results=10`;
const notichannels = ["2449872", "2449873", "2449874","2449875"];
const fields = ["1", "1", "1","1",];
const notificationinterval = 30;
const variablenames=["Crane 1","Crane 2","Crane 3","Crane 4", "Crane 5"]
const Temperaturelimit = 20;
var flag=0

fetchDatafornotification()

function fetchDatafornotification() {
  for (let i = 0; i < Math.min(notichannels.length, fields.length); i++) {
    const channel = notichannels[i];
    const field = fields[i];
    const varname=variablenames[i];
    const apiUrl = `https://api.thingspeak.com/channels/${channel}/fields/${field}.json?results=10`;

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    
    const field1Values = data.feeds.map(feed => feed.field1);
    console.log(field1Values);
    for(let i=0;i<field1Values.length;i++)
    {
      if(field1Values[i]>=Temperaturelimit){
        flag=1
      }
    }
  
    if("Notification" in window){
      if(flag===1){
      if(Notification.permission ==='granted'){
        notify();
      }else{
        Notification.requestPermission().then((res)=>{
          if(res === 'granted'){
            notify();
           }else if (res === 'denied'){
            console.log("notification denied");
           }else if (res === 'default'){
            console.log("notifation not given");
           }

      })
    } }

    }else{
      console.log("not support");
    }
  
  function notify(){
    new Notification(`Temperature Alert`,{
      body: `From ${varname}`
    });
  }

    console.log(flag);
    flag=0;
    
    
  })
  
  .catch(error => {
    console.error('Error fetching data from ThingSpeak:', error);
  });
}
}
const interval =notificationinterval* 60 * 1000; 
setInterval(fetchDatafornotification, interval);