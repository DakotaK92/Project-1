// API keys
const geocodingApiKey = "AIzaSyCbplK3dRw0kIy4Nb0fYGv0TEERkK6cBVg";
const predicthqApiKey = "Bearer GT0QbJMQ8mJXqnuGNHzBZg-OjRex-auEcS0ofEAs";

// Global variables to store references to various HTML elements and data
let latLng = null; // Stores latitude and longitude
let categorySelect; // Select element for category
let distanceInput; // Input for search radius
let dateInput; // Input for selecting date
let eventResults; // Element to display event results
let locationInput; // Input for location search
let modal; // Modal element
let span; // <span> element that closes the modal
let currentPage = 1; // Current page of results
const resultsPerPage = 5; // Number of results to display per page
let totalResults = 0; // Total number of results
let autocomplete; // Autocomplete object
let cityName; // City name
let units = "imperial"; // Default units (you can change this as needed)
let days, hours, minutes, seconds; // Declare time variables here
let pastCitySearches = [];


function showModal(message) { // Function to show modal
    const modal = document.getElementById("myModal"); // Get the modal
    const modalContent = document.querySelector(".modal-content");  // Get the modal content
    const modalMessage = document.createElement("p"); // Create a <p> element to display the message
    modalMessage.textContent = message; // Set the message text
    modalContent.appendChild(modalMessage); // Append the message to the modal content
    modal.style.display = "block"; // Display the modal
}
function initializeModal() { // Function to initialize modal
    modal = document.getElementById("myModal"); // Get the modal
    span = document.getElementsByClassName("close")[0]; // Get the <span> element that closes the modal

    span.onclick = function() { // When the user clicks on <span> (x), close the modal
        modal.style.display = "none"; // Hide the modal
    }

    window.onclick = function(event) { // When the user clicks anywhere outside of the modal, close it
        if (event.target == modal) { // If the target of the click is the modal
            modal.style.display = "none"; // Hide the modal
        }
    }
}

function fetchLocationCoordinates(cityName) { // Function to fetch location coordinates
    return new Promise((resolve, reject) => { // Return a promise
        const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${geocodingApiKey}`; // Construct the Geocoding API request URL
        const requestUrl = `${geocodingApiUrl}&address=${encodeURIComponent(cityName)}`; // Construct the full Geocoding API request URL

        console.log("Geocoding API Request URL:", requestUrl); // Log the API request URL to the console for debugging

        fetch(requestUrl) // Fetch request to the Geocoding API
            .then((response) => { // Handle the response
                if (!response.ok) { // If the response is not OK (i.e. 200), throw an error
                    throw new Error(`Geocoding API Error: ${response.status} - ${response.statusText}`); // Throw an error with the status and statusText properties
                }
                return response.json(); // Return the response data as JSON
            })
            .then((data) => { // Handle the JSON data
                console.log("Geocoding API Response:", data); // Log the data received from the Geocoding API to the console for debugging

                if (data.results.length > 0) { // If the Geocoding API returns any results
                    const location = data.results[0].geometry.location; // Use the first result

                    latLng = { // Create a new object to store latitude and longitude
                        lat: location.lat, // Set the latitude
                        lon: location.lng,  // Set the longitude 
                    };

                    console.log("Latitude:", latLng.lat); // Log the latitude and longitude to the console for debugging
                    console.log("Longitude:", latLng.lon);

                    resolve(); // Resolve the promise
                } else { // If the Geocoding API does not return any results
                    latLng = null; 
                    showModal("City not found. Please enter a valid city name.");   
                    reject();   
                }
            })
            .catch((error) => { // Handle any errors
                console.error("Error fetching location coordinates:", error); // Log any errors to the console for debugging
                latLng = null; 
                showModal("Error fetching location coordinates. Please try again later."); 
                reject();
            });
    });
}

const timeZoneOptions = { 
    timeZoneName: 'short',
  };
  
  function fetchEventsWithPagination(latitude, longitude, category, maxDistance, date, cityName, limit, offset) { // Function to fetch events with pagination
    console.log("Inside fetchEventsWithPagination function"); // Log to the console for debugging
 
    // Construct request URL for PredictHQ API with limit and offset parameters 
    const requestUrl = `https://api.predicthq.com/v1/events/?category=${category}&country=US&within=${maxDistance}mi@${latitude},${longitude}&start.gte=${date}&sort=start&?limit=100`; // Construct the full PredictHQ API request URL

    console.log("PredictHQ API Request URL:", requestUrl); // Log the API request URL to the console for debugging

    // Fetch request to the PredictHQ API
    fetch(requestUrl, {
        headers: {
            Authorization: predicthqApiKey,
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then((data) => { // Handle the JSON data
        console.log("PredictHQ API Response:", data); // Log the data received from the PredictHQ API to the console for debugging
        eventResults.innerHTML = ""; // Clear any previous event results

        if (data && data.results && data.results.length > 0) { // If the PredictHQ API returns any results
            const startIndex = (currentPage - 1) * resultsPerPage; // Define startIndex here
            const endIndex = startIndex + resultsPerPage; // Define endIndex here

            data.results.forEach((event) => { // Loop through the results
            }); // End of forEach loop

            totalResults = data.results.length; // Set the total number of results
            showResultsOnPage(data.results, cityName); // Call the function to show the results on the page
        } else {
            eventResults.innerHTML = "<p>No events found.</p>";
        }

        locationInput.value = ""; // Clear the location input
        dateInput.value = new Date().toISOString().split('T')[0]; // Clear the date input
    })
    .catch((error) => {
        console.error("Error fetching event data:", error);
        eventResults.innerHTML = "<p>Error fetching events. Please try again later.</p>";
    });
}

 
function updatePaginationButtons() { // Function to update pagination buttons
    const totalPages = Math.ceil(totalResults / resultsPerPage); // Calculate the total number of pages
    const prevButton = document.getElementById("prevButton"); // Get the previous button
    const nextButton = document.getElementById("nextButton"); 

    prevButton.disabled = currentPage === 1; // Disable the previous button if the current page is the first page
    nextButton.disabled = currentPage === totalPages; // Disable the next button if the current page is the last page
}
function showResultsOnPage(results, cityName) { // Function to show results on page
    eventResults.innerHTML = ""; // Clear any previous event results
    const startIndex = (currentPage - 1) * resultsPerPage; // Define startIndex here
    const endIndex = startIndex + resultsPerPage; // Define endIndex here

    for (let i = startIndex; i < endIndex && i < results.length; i++) { // Loop through the results
        const event = results[i]; // Get the current event

        const eventHeader = document.createElement("h3"); // Create an <h3> element for the event title
        const eventTitleLink = document.createElement("a"); // Create an <a> element for the event title
        eventTitleLink.href = `https://www.google.com/search?q=${encodeURIComponent(event.title)}+${encodeURIComponent(cityName)}`; // Set the href attribute of the <a> element
        eventTitleLink.target = "_blank"; // Set the target attribute of the <a> element
        eventTitleLink.textContent = event.title; // Set the text content of the <a> element
        eventHeader.appendChild(eventTitleLink); // Append the <a> element to the <h3> element
 
        const eventCategory = document.createElement("p"); // Create a <p> element for the event category
        eventCategory.textContent = `Category: ${event.category}`; // Set the text content of the <p> element

        const eventStartDate = document.createElement("p"); // Create a <p> element for the event start date
        const startDateTime = new Date(event.start); // Create a new Date object from the event start date
        eventStartDate.textContent = `Start Date & Time: ${startDateTime.toLocaleString('en-US', { // Set the text content of the <p> element
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short',
        })}`;

        const eventCountdown = document.createElement("p"); // Create a <p> element for the event countdown
        eventCountdown.textContent = "Time Left: Calculating..."; // Placeholder text

        let timeDifference; // Declare the variable here

        const now = new Date();  // Get the current date and time
        timeDifference = startDateTime - now; // Calculate the time difference between the event start date and the current date

        if (timeDifference > 0) { // If the event has not started yet
            setInterval(() => { // Start an interval
                const remainingTime = new Date(timeDifference); // Create a new Date object from the time difference
                if (remainingTime.getTime() <= 0) { // If the time difference is less than or equal to 0
                    eventCountdown.innerHTML = "Event Started"; // Set the text content of the <p> element
                    eventCountdown.style.color = "black"; // Change color to black for already started events
                } else {
                    days = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Calculate days
                    hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Calculate hours
                    minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); // Calculate minutes
                    seconds = Math.floor((timeDifference % (1000 * 60)) / 1000); // Calculate seconds
        
                    eventCountdown.innerHTML = `Time Left Until Start: ${days}d ${hours}h ${minutes}m ${seconds}s`; // Set the text content of the <p> element
                    eventCountdown.style.color = "brown"; // Change color to brown for upcoming events
                    timeDifference -= 1000; // Subtract 1 second from the time difference
                }
            }, 1000);
        } else {
            eventCountdown.innerHTML = "Event Started"; // Set the text content of the <p> element
            eventCountdown.style.color = "black"; // Change color to black for already started events
        }

        const eventItem = document.createElement("li"); // Create an <li> element for the event
        eventItem.appendChild(eventHeader); // Append the <h3> element to the <li> element
        eventItem.appendChild(eventCategory); // Append the <p> element to the <li> element
        eventItem.appendChild(eventStartDate); // Append the <p> element to the <li> element
        eventItem.appendChild(eventCountdown);  // Append the <p> element to the <li> element

        eventResults.appendChild(eventItem); // Append the <li> element to the event results
    }

    updatePaginationButtons(); // Call the function to update the pagination buttons
}

document.addEventListener("DOMContentLoaded", function () { // When the page loads
    initializeModal(); // Call the function to initialize the modal

    locationInput = document.getElementById("location"); // Input for location search
    categorySelect = document.getElementById("category"); // Select element for category
    distanceInput = document.getElementById("distance"); // Input for search radius
    dateInput = document.getElementById("date"); // Input for selecting date
    eventResults = document.getElementById("eventResults"); // Element to display event results
    const searchButton = document.getElementById("searchButton"); // Search button
    const prevButton = document.getElementById("prevButton"); // Previous button
    const nextButton = document.getElementById("nextButton"); // Next button
    const script = document.createElement("script"); // Create a <script> element
    script.src = `https://maps.googleapis.com/maps/api/js?key=${geocodingApiKey}&libraries=places&callback=initMap`; // Set the src attribute of the <script> element
    script.onload = function () { // When the script loads
        autocomplete = new google.maps.places.Autocomplete(locationInput); // Initialize autocomplete here
    };
    document.head.appendChild(script); // Append the <script> element to the <head> element
    
    const storedPastCitySearches = localStorage.getItem("pastCitySearches");
    if (storedPastCitySearches) {
        pastCitySearches = JSON.parse(storedPastCitySearches);
        updatePastCitySearchList(); // Call a function to update the list
    }
    // Function to show the weather and info containers
    function showContainers() {  // Function to show the weather and info containers
        weatherContainer.style.display = "block"; // Show the weather container
        infoContainer.style.display = "block"; // Show the info container
    }

    // Get references to the weather and info containers
    const weatherContainer = document.querySelector(".weather-container"); 
    const infoContainer = document.querySelector(".info-container");

    searchButton.addEventListener("click", function () { // When the user clicks the search button
        const selectedCategory = categorySelect.value; // Get the selected category
        const maxDistance = distanceInput.value; // Get the selected distance
        const selectedDate = dateInput.value; // Get the selected date
        cityName = locationInput.value; // Get the city name

        autocomplete.addListener("place_changed", function () {  // When the user selects a city from the dropdown
            const place = autocomplete.getPlace(); // Get the place details
            if (!place.geometry) { // If the place has no geometry, show an error message
                showModal("City not found. Please enter a valid city name."); 
                return;
            }

            const lat = place.geometry.location.lat(); // Get the latitude
            const lon = place.geometry.location.lng(); // Get the longitude
            latLng = { lat, lon }; // Create a new object to store latitude and longitude
        });

        if (!cityName.trim()) { // If the city name is empty
            showModal("Please enter a city name."); 
            return;
        }

        if (cityName.trim() && !pastCitySearches.includes(cityName)) { // Check for duplicates
            if (pastCitySearches.length >= 5) {
                pastCitySearches.shift(); // Remove the oldest entry if the limit is reached
            }
            pastCitySearches.push(cityName); // Add the city to the list
            localStorage.setItem("pastCitySearches", JSON.stringify(pastCitySearches)); // Update local storage
            updatePastCitySearchList(); // Update the list of past city searches
        }
    
        const pastCityList = document.getElementById("pastCityList");
    pastCityList.innerHTML = ""; // Clear the existing list

    pastCitySearches.forEach((pastCity) => {
        const listItem = document.createElement("li");
        const anchor = document.createElement("a"); // Create an anchor element
        anchor.textContent = pastCity;
        anchor.href = "#"; // Add a placeholder href attribute

        // Add a click event listener to the anchor element to fill the search input
        anchor.addEventListener("click", function () {
            locationInput.value = pastCity; // Fill the search input with the past city
        });

        listItem.appendChild(anchor); // Append the anchor element to the list item
        pastCityList.appendChild(listItem);
    });


        // Show the weather and info containers
        showContainers();

        // Call the function to fetch weather data
        fetchWeather(cityName);
        // Call the function to fetch 9-hour forecast data
        fetch9HourForecast(cityName);
        fetchLocationCoordinates(cityName) // Call the function to fetch location coordinates
            .then(() => { // If the promise is resolved
                if (latLng && latLng.lat && latLng.lon) { // If the latitude and longitude are available
                    const today = new Date(); // Get the current date
                    const dateValue = selectedDate.split('-'); // Split the date string
                    const selectedDateObj = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]); // Create a new Date object from the selected date
                    today.setHours(0, 0, 0, 0); // Set the hours, minutes, seconds, and milliseconds to 0
                    selectedDateObj.setHours(0, 0, 0, 0); // Set the hours, minutes, seconds, and milliseconds to 0

                    if (selectedDateObj < today) { // If the selected date is in the past
                        showModal("The selected date is in the past. Please choose a future date."); 
                        return;
                    }

                    currentPage = 1; // Reset the current page to 1
                    const limit = resultsPerPage; // Set the limit to the number of results per page
                    const offset = (currentPage - 1) * limit; // Calculate the offset
                    fetchEventsWithPagination(latLng.lat, latLng.lon, selectedCategory, maxDistance, selectedDate, cityName, limit, offset); // Call the function to fetch events with pagination
                } else {
                    showModal("Error fetching location coordinates. Please try again later.");  
                }
            })
            .catch((error) => {
                console.error("Error in fetchLocationCoordinates:", error); // Log any errors to the console for debugging
            });

        showContainers(); // Call the function to show the weather and info containers

    });

    prevButton.addEventListener("click", function () { // When the user clicks the previous button
        if (currentPage > 1) { // If the current page is greater than 1
            currentPage--; // Decrement the current page
            const limit = resultsPerPage; // Set the limit to the number of results per page
            const offset = (currentPage - 1) * limit; // Calculate the offset
            fetchEventsWithPagination(latLng.lat, latLng.lon, categorySelect.value, distanceInput.value, dateInput.value, cityName, limit, offset); // Call the function to fetch events with pagination
        }
    });

    nextButton.addEventListener("click", function () { // When the user clicks the next button
        const totalPages = Math.ceil(totalResults / resultsPerPage); // Calculate the total number of pages
        if (currentPage < totalPages) { // If the current page is less than the total number of pages
            currentPage++; // Increment the current page
            const limit = resultsPerPage; // Set the limit to the number of results per page
            const offset = (currentPage - 1) * limit; // Calculate the offset
            fetchEventsWithPagination(latLng.lat, latLng.lon, categorySelect.value, distanceInput.value, dateInput.value, cityName, limit, offset);
        } // Call the function to fetch events with pagination
    });
});

function updatePastCitySearchList() {
    const pastCityList = document.getElementById("pastCityList");
    pastCityList.innerHTML = ""; // Clear the existing list

    pastCitySearches.forEach((pastCity) => {
        const listItem = document.createElement("li");
        const anchor = document.createElement("a"); // Create an anchor element
        anchor.textContent = pastCity;
        anchor.href = "#"; // Add a placeholder href attribute

        // Add a click event listener to the anchor element to fill the search input
        anchor.addEventListener("click", function () {
            locationInput.value = pastCity; // Fill the search input with the past city
        });

        listItem.appendChild(anchor); // Append the anchor element to the list item
        pastCityList.appendChild(listItem);
    });
}

function fetchWeather(cityName) { // Function to fetch weather data
    const apiKey = '73160f3be8182853a0dc7e278c3fdb6a'; 

    // Make the API request to OpenWeatherMap
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`) // Update request URL
        .then(response => response.json()) // Parse response as JSON
        .then(weatherData => {  // Handle the JSON data
            // Extract relevant weather information here
            const temperature = weatherData.main.temp; // Update variable names
            const weatherDescription = weatherData.weather[0].description;  // Update variable names

            // Update the weather-container with the weather information
            const weatherContainer = document.querySelector(".weather-container"); // Update selector
            weatherContainer.innerHTML = `
                <h1 class="weather__city">${cityName}</h1> 
                <div class="weather__datetime">${new Date().toLocaleString()}</div>
                <div class="weather__forecast">${weatherDescription}</div>
                <div class="weather__icon">
                    <img src="https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" alt="Weather Icon">
                </div>
                <p class="weather__temperature">${Math.round(temperature)}°F</p>
                <div class="weather__minmax">
                    <p>Min: ${Math.round(weatherData.main.temp_min)}°</p>
                    <p>Max: ${Math.round(weatherData.main.temp_max)}°</p>
                </div>
            `;
        })
        .catch(error => { // Handle any errors
            console.error("Error fetching weather data:", error);
            const weatherContainer = document.querySelector(".weather-container"); // Update selector
            weatherContainer.innerHTML = "<p>Error fetching weather data. Please try again later.</p>"; // Update error message
        });
}

function fetch9HourForecast(cityName) {
    // Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key
    const apiKey = '73160f3be8182853a0dc7e278c3fdb6a';
    const forecastContainer = document.querySelector(".forecast-items"); // Update selector

    // Make the API request to OpenWeatherMap for 3-hour forecast data
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${units}`) // Update request URL
        .then(response => response.json())  // Parse response as JSON
        .then(forecastData => { // Handle the JSON data
            // Clear previous forecast items
            forecastContainer.innerHTML = "";

            // Get the current timestamp
            const now = new Date().getTime();

            // Loop through the forecast data and select the data for the next 9 hours
            for (const item of forecastData.list) {
                const forecastTime = new Date(item.dt * 1000);

                // Check if the forecast time is within the next 9 hours
                if (forecastTime > now && forecastTime <= now + 9 * 60 * 60 * 1000) {   // Update condition
                    const forecastItem = document.createElement("div"); // Create a <div> element for the forecast item
                    forecastItem.classList.add("forecast-item");    // Add the 'forecast-item' class to the <div> element

                    const forecastTimeText = document.createElement("p");   // Create a <p> element for the forecast time
                    forecastTimeText.textContent = forecastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Set the text content of the <p> element

                    const forecastTemperature = document.createElement("p");    // Create a <p> element for the forecast temperature
                    forecastTemperature.textContent = `${Math.round(item.main.temp)}°F`;  // Set the text content of the <p> element

                    const forecastDescription = document.createElement("p");    // Create a <p> element for the forecast description
                    forecastDescription.textContent = item.weather[0].description;  // Set the text content of the <p> element

                    const forecastIcon = document.createElement("img"); // Create an <img> element for the forecast icon
                    forecastIcon.src = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;  // Set the src attribute of the <img> element
                    forecastIcon.alt = item.weather[0].description; // Set the alt attribute of the <img> element

                    forecastItem.appendChild(forecastTimeText); // Append the <p> element to the <div> element
                    forecastItem.appendChild(forecastTemperature);  // Append the <p> element to the <div> element
                    forecastItem.appendChild(forecastDescription);  // Append the <p> element to the <div> element
                    forecastItem.appendChild(forecastIcon); // Append the <img> element to the <div> element

                    forecastContainer.appendChild(forecastItem);    // Append the <div> element to the forecast container
                }
            }
        })
        .catch(error => {
            console.error("Error fetching 9-hour forecast data:", error);
            forecastContainer.innerHTML = "<p>Error fetching forecast data. Please try again later.</p>";
        });
}