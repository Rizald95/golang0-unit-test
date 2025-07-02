// Chat History page functionality - FIXED VERSION
document.addEventListener("DOMContentLoaded", () => {
  console.log("📜 Chat History page loaded")

  const chatHistoryList = document.getElementById("chatHistoryList")
  const chrome = window.chrome // Declare the chrome variable

  function renderHistory(history) {
    console.log("🔄 Rendering history:", history)

    if (!history || !history.length) {
      chatHistoryList.innerHTML = `
        <div class="history-entry">
          <p><strong>No chat history found.</strong></p>
          <p>Start a conversation in the main extension to see your chat history here.</p>
        </div>
      `
      return
    }

    chatHistoryList.innerHTML = ""

    // Sort by timestamp (newest first)
    const sortedHistory = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    sortedHistory.forEach((item, index) => {
      const entry = document.createElement("div")
      entry.className = "history-entry"

      // Format timestamp
      const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown time"
      const date = item.date || new Date(item.timestamp).toLocaleDateString()
      const time = item.time || new Date(item.timestamp).toLocaleTimeString()

      // Truncate long messages
      const truncateText = (text, maxLength = 200) => {
        if (!text) return "No content"
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
      }

      entry.innerHTML = `
        <div class="history-header">
          <div>
            <strong>Model:</strong> <span style="color: #3b82f6; font-weight: 600;">${item.model || "Unknown"}</span>
          </div>
          <div class="history-time">
            📅 ${date} ⏰ ${time}
          </div>
        </div>
        <div class="history-message">
          <strong>💬 User Message:</strong>
          <div style="background: #f0f8ff; padding: 8px; border-radius: 4px; margin-top: 4px; border-left: 3px solid #3b82f6;">
            ${truncateText(item.message)}
          </div>
        </div>
        ${
          item.response
            ? `
          <div class="history-response">
            <strong>🤖 AI Response:</strong>
            <div style="background: #f0f9ff; padding: 8px; border-radius: 4px; margin-top: 4px; border-left: 3px solid #10b981;">
              ${truncateText(item.response, 300)}
            </div>
          </div>
        `
            : ""
        }
        <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
          Entry #${sortedHistory.length - index} • ${timestamp}
        </div>
      `

      chatHistoryList.appendChild(entry)
    })

    console.log(`✅ Rendered ${sortedHistory.length} history entries`)
  }

  // Load chat history from storage
  function loadChatHistory() {
    console.log("🔍 Loading chat history from storage...")

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get("chatHistory", (result) => {
        console.log("📦 Storage result:", result)
        const chatHistory = result.chatHistory || []
        console.log(`📊 Found ${chatHistory.length} history entries`)
        renderHistory(chatHistory)
      })
    } else {
      // Fallback for testing without chrome extension context
      console.log("⚠️ Chrome storage not available, using localStorage fallback")
      try {
        const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]")
        console.log(`📊 Found ${chatHistory.length} entries in localStorage`)
        renderHistory(chatHistory)
      } catch (error) {
        console.error("❌ Error loading from localStorage:", error)
        renderHistory([])
      }
    }
  }

  // Clear chat history function
  function clearChatHistory() {
    if (confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
      console.log("🗑️ Clearing chat history...")

      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ chatHistory: [] }, () => {
          console.log("✅ Chat history cleared from chrome storage")
          renderHistory([])
          alert("Chat history cleared successfully!")
        })
      } else {
        localStorage.setItem("chatHistory", "[]")
        console.log("✅ Chat history cleared from localStorage")
        renderHistory([])
        alert("Chat history cleared successfully!")
      }
    }
  }

  // Add control buttons
  const controlsDiv = document.createElement("div")
  controlsDiv.style.marginBottom = "20px"
  controlsDiv.style.display = "flex"
  controlsDiv.style.gap = "10px"
  controlsDiv.style.flexWrap = "wrap"

  const clearButton = document.createElement("button")
  clearButton.textContent = "🗑️ Clear History"
  clearButton.className = "action-button"
  clearButton.addEventListener("click", clearChatHistory)

  const refreshButton = document.createElement("button")
  refreshButton.textContent = "🔄 Refresh"
  refreshButton.className = "action-button"
  refreshButton.addEventListener("click", () => {
    console.log("🔄 Manual refresh triggered")
    loadChatHistory()
  })

  // Add debug button for testing
  const debugButton = document.createElement("button")
  debugButton.textContent = "🔍 Debug Storage"
  debugButton.className = "action-button"
  debugButton.addEventListener("click", () => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(null, (result) => {
        console.log("🔍 All storage data:", result)
        alert(
          `Storage keys: ${Object.keys(result).join(", ")}\nChat history entries: ${(result.chatHistory || []).length}`,
        )
      })
    }
  })

  controlsDiv.appendChild(clearButton)
  controlsDiv.appendChild(refreshButton)
  controlsDiv.appendChild(debugButton)

  const content = document.getElementById("content")
  const h1 = content.querySelector("h1")
  h1.insertAdjacentElement("afterend", controlsDiv)

  // Load history on page load
  console.log("🚀 Initializing chat history page...")
  loadChatHistory()

  console.log("🎉 Chat History page initialization complete")
})
