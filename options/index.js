// options/index.js - Main settings page functionality

// Storage keys for general settings
const CHAT_HISTORY_KEY = "chatHistory"
const BENCHMARK_KEY = "benchmarkResults"



// Load general settings and statistics
function loadSettings() {
  console.log("⚙️ Loading main settings page...")

  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get([CHAT_HISTORY_KEY, BENCHMARK_KEY], (data) => {
      const chatHistory = data[CHAT_HISTORY_KEY] || []
      const benchmarkResults = data[BENCHMARK_KEY] || []

      console.log(`📊 Found ${chatHistory.length} chat entries and ${benchmarkResults.length} benchmark results`)

      // Update statistics on the main page if elements exist
      updateStatistics(chatHistory, benchmarkResults)
    })
  } else {
    console.log("⚠️ Chrome storage not available")
  }
}

// Update statistics display on main page
function updateStatistics(chatHistory, benchmarkResults) {
  // Update chat history count if element exists
  const chatCountElement = document.getElementById("chatHistoryCount")
  if (chatCountElement) {
    chatCountElement.textContent = chatHistory.length
  }

  // Update benchmark count if element exists
  const benchmarkCountElement = document.getElementById("benchmarkCount")
  if (benchmarkCountElement) {
    benchmarkCountElement.textContent = benchmarkResults.length
  }

  // Show recent activity if elements exist
  const recentActivityElement = document.getElementById("recentActivity")
  if (recentActivityElement && chatHistory.length > 0) {
    const lastChat = chatHistory[chatHistory.length - 1]
    const lastActivity = lastChat.timestamp ? new Date(lastChat.timestamp).toLocaleDateString() : "Unknown"
    recentActivityElement.textContent = `Last activity: ${lastActivity}`
  }
}

// Add welcome message functionality
function initializeWelcomeFeatures() {
  console.log("🚀 Initializing welcome features...")

  // Add click handlers for feature cards if they exist
  const featureCards = document.querySelectorAll(".prompt-card")
  featureCards.forEach((card) => {
    card.addEventListener("click", () => {
      const cardTitle = card.querySelector("h3")?.textContent
      console.log(`🎯 Feature card clicked: ${cardTitle}`)

      // Add visual feedback
      card.style.transform = "scale(0.98)"
      setTimeout(() => {
        card.style.transform = "scale(1)"
      }, 150)
    })
  })

  // Add hover effects for better UX
  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"
    })
  })
}

// Add keyboard shortcuts
function initializeKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K to focus search (if search exists)
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault()
      const searchInput = document.querySelector('input[type="search"]')
      if (searchInput) {
        searchInput.focus()
      }
    }

    // Escape to close any open modals or dropdowns
    if (e.key === "Escape") {
      // Close any open dropdowns or modals
      const openDropdowns = document.querySelectorAll(".dropdown.open")
      openDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open")
      })
    }
  })
}

// Initialize theme handling for main page
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light-mode"
  document.body.classList.add(savedTheme)

  // Add theme toggle if it exists
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.body.classList.contains("light-mode")
      document.body.classList.remove("light-mode", "dark-mode")
      document.body.classList.add(isLight ? "dark-mode" : "light-mode")
      localStorage.setItem("theme", isLight ? "dark-mode" : "light-mode")
    })
  }
}

// Add smooth scrolling for anchor links
function initializeSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Add loading states for better UX
function showLoadingState() {
  const loadingElements = document.querySelectorAll(".loading-placeholder")
  loadingElements.forEach((element) => {
    element.style.display = "block"
  })
}

function hideLoadingState() {
  const loadingElements = document.querySelectorAll(".loading-placeholder")
  loadingElements.forEach((element) => {
    element.style.display = "none"
  })
}

// Main initialization function
function initializeMainPage() {
  console.log("🎉 Initializing main settings page...")

  try {
    // Show loading state
    showLoadingState()

    // Initialize all features
    loadSettings()
    initializeWelcomeFeatures()
    initializeKeyboardShortcuts()
    initializeTheme()
    initializeSmoothScrolling()

    // Hide loading state after initialization
    setTimeout(hideLoadingState, 500)

    console.log("✅ Main page initialization complete")
  } catch (error) {
    console.error("❌ Error during main page initialization:", error)
    hideLoadingState()
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeMainPage)

// Add error handling for unhandled errors
window.addEventListener("error", (e) => {
  console.error("❌ Unhandled error on main page:", e.error)
})

// Export functions for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadSettings,
    updateStatistics,
    initializeMainPage,
  }
}
