// options/index.js

// Storage keys
const PROFILE_KEY = 'profiles';
const CHAT_HISTORY_KEY = 'chatHistory';
const BENCHMARK_KEY = 'benchmarkResults';

// DOM Elements
const profileList = document.getElementById('profileList');
const newProfileName = document.getElementById('newProfileName');
const addProfileBtn = document.getElementById('addProfileBtn');
const chatHistoryContainer = document.getElementById('chatHistoryContainer');
const benchmarkContainer = document.getElementById('benchmarkContainer');

// Load all settings from storage
function loadSettings() {
  chrome.storage.local.get([PROFILE_KEY, CHAT_HISTORY_KEY, BENCHMARK_KEY], (data) => {
    renderProfiles(data[PROFILE_KEY] || []);
    renderChatHistory(data[CHAT_HISTORY_KEY] || []);
    renderBenchmark(data[BENCHMARK_KEY] || []);
  });
}

function renderProfiles(profiles) {
  profileList.innerHTML = '';
  profiles.forEach((profile, index) => {
    const li = document.createElement('li');
    li.textContent = profile;
    profileList.appendChild(li);
  });
}

function renderChatHistory(history) {
  if (!history.length) {
    chatHistoryContainer.textContent = 'No history available.';
    return;
  }
  chatHistoryContainer.innerHTML = '';
  history.forEach((entry) => {
    const div = document.createElement('div');
    div.textContent = `[${entry.model}] ${entry.message}`;
    chatHistoryContainer.appendChild(div);
  });
}

function renderBenchmark(results) {
  if (!results.length) {
    benchmarkContainer.textContent = 'No benchmark data.';
    return;
  }
  benchmarkContainer.innerHTML = '';
  results.forEach((entry) => {
    const div = document.createElement('div');
    div.textContent = `${entry.model}: ${entry.score}`;
    benchmarkContainer.appendChild(div);
  });
}

addProfileBtn.addEventListener('click', () => {
  const name = newProfileName.value.trim();
  if (!name) return;
  chrome.storage.local.get([PROFILE_KEY], (data) => {
    const profiles = data[PROFILE_KEY] || [];
    profiles.push(name);
    chrome.storage.local.set({ [PROFILE_KEY]: profiles }, () => {
      renderProfiles(profiles);
      newProfileName.value = '';
    });
  });
});

// Initial load
loadSettings();
