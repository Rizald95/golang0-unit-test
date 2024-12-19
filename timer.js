let timer = 0; // Time in seconds
let interval = null;

// Load timer from storage when the page is opened
window.onload = async function () {
  const { appTimer } = await chrome.storage.local.get("appTimer");
  timer = appTimer || 0;
  updateTimerDisplay();

  // Start timer
  interval = setInterval(() => {
    timer++;
    updateTimerDisplay();
  }, 1000);
};

// Update timer display
function updateTimerDisplay() {
  const hours = Math.floor(timer / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((timer % 3600) / 60).toString().padStart(2, "0");
  const seconds = (timer % 60).toString().padStart(2, "0");
  document.getElementById("timer-display").textContent = `${hours}:${minutes}:${seconds}`;
}

// Save timer to storage when the popup is closed
window.onbeforeunload = async function () {
  clearInterval(interval);
  await chrome.storage.local.set({ appTimer: timer });
};
