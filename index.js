// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area=";

// DOM elements
const stateInput = document.getElementById('state-input');
const fetchBtn = document.getElementById('fetch-alerts');
const alertsDisplay = document.getElementById('alerts-display');
const errorDiv = document.getElementById('error-message');

// Helper: clear previous alerts and hide error
function clearResults() {
  alertsDisplay.innerHTML = '';
  errorDiv.classList.add('hidden');
  errorDiv.textContent = '';
}

// Helper: show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  alertsDisplay.innerHTML = '';
}

// Step 1: Fetch alerts for a state
async function fetchWeatherAlerts(state) {
  const url = `${weatherApi}${state}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error (${response.status}): ${response.statusText}`);
  }
  const data = await response.json();
  console.log('Fetched alerts:', data);
  return data;
}

// Step 2: Display alerts on the page
function displayAlerts(data, stateAbbr) {
  const features = data.features || [];
  const alertCount = features.length;
  // Use the API's title exactly as provided (tests expect "Weather Alerts: 2")
  const title = data.title || `Current watches, warnings, and advisories for ${stateAbbr}`;

  // Summary message
  const summaryDiv = document.createElement('div');
  summaryDiv.textContent = `${title}: ${alertCount}`;
  alertsDisplay.appendChild(summaryDiv);

  if (alertCount === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = `✅ No active alerts for ${stateAbbr}.`;
    alertsDisplay.appendChild(emptyMsg);
    return;
  }

  // Bullet list of headlines
  const list = document.createElement('ul');
  for (const alert of features) {
    const headline = alert?.properties?.headline;
    if (headline) {
      const li = document.createElement('li');
      li.textContent = headline;
      list.appendChild(li);
    }
  }
  alertsDisplay.appendChild(list);
}

// Main controller
async function handleFetchAlerts() {
  // 1. Get the value BEFORE clearing the input
  const rawState = stateInput.value.trim();

  // 2. Clear the input field (Step 3)
  stateInput.value = '';

  // 3. Clear previous results and errors
  clearResults();

  // 4. Input validation (Step 5)
  if (rawState === '') {
    showError('Please enter a state abbreviation (e.g., MN, CA, TX).');
    return;
  }
  const stateCode = rawState.toUpperCase();
  if (!/^[A-Z]{2}$/.test(stateCode)) {
    showError(`"${rawState}" is not a valid two-letter state code. Use letters like MN, NY, FL.`);
    return;
  }

  // Optional loading indicator (if element exists)
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.style.display = 'block';

  try {
    const data = await fetchWeatherAlerts(stateCode);
    // Hide error on success
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
    displayAlerts(data, stateCode);
  } catch (error) {
    // Step 4: Display the exact error message from error.message
    showError(error.message || 'Network or API failure. Please try again later.');
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

// Attach event listeners (no DOMContentLoaded needed because script is at end of body)
fetchBtn.addEventListener('click', handleFetchAlerts);
stateInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleFetchAlerts();
});

// Initial placeholder message
alertsDisplay.innerHTML = '<div>✨ Enter a state code and click "Get Weather Alerts" to see active watches, warnings, and advisories.</div>';