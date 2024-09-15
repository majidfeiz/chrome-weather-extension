let debounceTimer; 
let api_endpoint="https://oweather.majidfeiz.com/api/"

data=getArrayWithExpiry('data');
lat=localStorage.getItem('latitude')
if(data)
{
    setElements(data)

}else if (lat){
    clearElements()
    fetchDataByLatLon(localStorage.getItem('latitude'),localStorage.getItem('longitude'));
}else{
    clearElements()
    fetchDataByCity('London')
}

function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimer);  // Reset the timer whenever the user types
        debounceTimer = setTimeout(() => func.apply(this, args), delay);  // Execute after delay
    };
}

document.getElementById('city-input').addEventListener('keydown', async function(event) {
    // Check if the 'Enter' key (keyCode 13) is pressed
    if (event.key === 'Enter') {
        const cityName = event.target.value;  // Get the value of the input field
        
        if (cityName) {
            // Call the function to fetch weather data using the city name
            await fetchDataByCity(cityName);
        } else {
            alert("Please enter a city name");
        }
    }
});

document.getElementById('getLocation').addEventListener('click', function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                localStorage.setItem('latitude', latitude);
                localStorage.setItem('longitude', longitude);
                fetchDataByLatLon(localStorage.getItem('latitude'),localStorage.getItem('longitude'));
            },
            function (error) {
                console.error("Error getting location: ", error);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// Event listener for input field
document.getElementById('city-input').addEventListener('input', debounce(function(event) {
    const cityName = event.target.value;
    
    if (cityName) {
        fetchDataByCity(cityName);  // Fetch weather data after 3-second pause
    }
}, 3000)); 



function setElements(data)
{
    document.getElementById("city").innerHTML=data?.data?.name ?? '';
    document.getElementById('weather-icon').src = 'https://openweathermap.org/img/wn/'+data?.data?.weather[0]?.icon+'@2x.png';
    document.getElementById("description").innerHTML=data?.data?.weather[0]?.description ?? '';
    document.getElementById("temperature").innerHTML=Math.round(data?.data?.main?.temp)+'°C' ?? '';
    document.getElementById("humidity").innerHTML=Math.round(data?.data?.main?.humidity)+' %' ?? '';
    document.getElementById("humidity").innerHTML=data?.data?.wind?.speed+' km/h' ?? '';
    document.getElementById("sunrise").innerHTML=convertUnixToTime(data.data.sys.sunrise)
    document.getElementById("sunset").innerHTML=convertUnixToTime(data.data.sys.sunset)

}

function clearElements()
{
    document.getElementById("city").innerHTML='';
    document.getElementById('weather-icon').src ='https://openweathermap.org/img/wn/04n@2x.png';
    document.getElementById("description").innerHTML='';
    document.getElementById("temperature").innerHTML='';
    document.getElementById("humidity").innerHTML='';
    document.getElementById("humidity").innerHTML='';
    document.getElementById("sunrise").innerHTML=0
    document.getElementById("sunset").innerHTML=0

}

async function fetchDataByLatLon(lat,lon) {
    startLoading()
    const res=await fetch (api_endpoint+"weather-latlon?lat="+lat+"&lon="+lon);
    const record=await res.json();
    console.log(record)
    if(record.success == true)
    {
        saveArrayWithExpiry('data',record,3600000)
        setElements(record)
        hideNotfound()
    }else
    {
        showNotfound()
    }

    endLoading()
}

async function fetchDataByCity(city) {
    startLoading()
    const res=await fetch (api_endpoint+"weather?location="+city);
    const record=await res.json();
    if(record.success == true)
    {
        saveArrayWithExpiry('data',record,3600000)
        setElements(record)
        hideNotfound()
    }else{
        showNotfound()
    }

    endLoading()
}

function convertUnixToTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function saveArrayWithExpiry(key, array, ttl) {
    const now = new Date();
    
    // Create an object containing the array and the expiration time
    const data = {
        value: array,
        expiry: now.getTime() + ttl // TTL is in milliseconds
    };
    
    // Save to localStorage as a string
    localStorage.setItem(key, JSON.stringify(data));
}

function getArrayWithExpiry(key) {
    const dataStr = localStorage.getItem(key);
    
    // If no data is found, return null
    if (!dataStr) {
        return null;
    }
    
    const data = JSON.parse(dataStr);
    const now = new Date();
    
    // Compare the current time with the expiry time
    if (now.getTime() > data.expiry) {
        // If expired, remove the item and return null
        localStorage.removeItem(key);
        return null;
    }
    
    // If not expired, return the array
    return data.value;
}

function startLoading() {
    document.getElementById('loading-indicator').style.display = 'block';  // Show loading
}

// Function to hide the loading indicator
function endLoading() {
    document.getElementById('loading-indicator').style.display = 'none';   // Hide loading
}

function showNotfound() {
    document.getElementById('not-found').style.display = 'block';  // Show not found
}

// Function to hide the loading indicator
function hideNotfound() {
    document.getElementById('not-found').style.display = 'none';   // Hide not found
}