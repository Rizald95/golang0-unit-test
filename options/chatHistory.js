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
      entry.className = "history-entry clickable-entry"
      entry.style.cursor = "pointer"
      entry.style.transition = "all 0.2s ease"

      // Format timestamp
      const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown time"
      const date = item.date || new Date(item.timestamp).toLocaleDateString()
      const time = item.time || new Date(item.timestamp).toLocaleTimeString()

      // Truncate long messages for preview
      const truncateText = (text, maxLength = 150) => {
        if (!text) return "No content"
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
      }

      // Create unique ID for this entry
      const entryId = `entry-${index}`

      entry.innerHTML = `
        <div class="history-header">
          <div>
            <strong>Model:</strong> <span style="color: #3b82f6; font-weight: 600;">${item.model || "Unknown"}</span>
            <span style="margin-left: 10px; font-size: 12px; color: #6b7280;">👆 Click to view details</span>
          </div>
          <div class="history-time">
            📅 ${date} ⏰ ${time}
          </div>
        </div>
        
        <div class="history-preview">
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
                ${truncateText(item.response, 200)}
              </div>
            </div>
          `
              : ""
          }
        </div>

        <!-- FULL DETAILS (Hidden by default) -->
        <div class="history-details" id="details-${entryId}" style="display: none; margin-top: 15px; border-top: 2px solid #e5e7eb; padding-top: 15px;">
          <h4 style="color: #1f2937; margin-bottom: 10px;">📋 Full Conversation Details</h4>
          
          <div style="margin-bottom: 15px;">
            <strong>📊 Metadata:</strong>
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; margin-top: 5px; font-family: monospace; font-size: 12px;">
              <div><strong>Model:</strong> ${item.model}</div>
              <div><strong>Date:</strong> ${date}</div>
              <div><strong>Time:</strong> ${time}</div>
              <div><strong>Timestamp:</strong> ${item.timestamp}</div>
              <div><strong>Entry ID:</strong> #${sortedHistory.length - index}</div>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>💬 Complete User Message:</strong>
            <div style="background: #e1f5fe; padding: 12px; border-radius: 6px; margin-top: 5px; border-left: 4px solid #2196f3; white-space: pre-wrap; font-family: 'Segoe UI', sans-serif; line-height: 1.5;">
              ${item.message || "No message content"}
            </div>
          </div>

          ${
            item.response
              ? `
            <div style="margin-bottom: 15px;">
              <strong>🤖 Complete AI Response:</strong>
              <div style="background: #e8f5e8; padding: 12px; border-radius: 6px; margin-top: 5px; border-left: 4px solid #4caf50; white-space: pre-wrap; font-family: 'Segoe UI', sans-serif; line-height: 1.5; max-height: 400px; overflow-y: auto;">
                ${item.response}
              </div>
            </div>
          `
              : ""
          }

          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button class="copy-btn" data-type="message" data-content="${encodeURIComponent(item.message || "")}" 
                    style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
              📋 Copy User Message
            </button>
            ${
              item.response
                ? `
              <button class="copy-btn" data-type="response" data-content="${encodeURIComponent(item.response)}" 
                      style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                📋 Copy AI Response
              </button>
            `
                : ""
            }
            <button class="export-btn" data-entry='${JSON.stringify(item).replace(/'/g, "&#39;")}' 
                    style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
              💾 Export Entry
            </button>
          </div>
        </div>

        <div style="margin-top: 8px; font-size: 11px; color: #6b7280; text-align: right;">
          Entry #${sortedHistory.length - index} • ${timestamp}
        </div>
      `

      // Add click event to toggle details
      entry.addEventListener("click", (e) => {
        // Don't toggle if clicking on buttons
        if (e.target.tagName === "BUTTON") return

        const detailsDiv = entry.querySelector(`#details-${entryId}`)
        const isVisible = detailsDiv.style.display !== "none"

        // Close all other open details first
        document.querySelectorAll(".history-details").forEach((detail) => {
          if (detail !== detailsDiv) {
            detail.style.display = "none"
          }
        })

        // Toggle current details
        detailsDiv.style.display = isVisible ? "none" : "block"

        // Update entry styling
        if (isVisible) {
          entry.style.backgroundColor = ""
          entry.style.boxShadow = ""
        } else {
          entry.style.backgroundColor = "#f8fafc"
          entry.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)"
        }

        console.log(`${isVisible ? "🔽" : "🔼"} Toggled details for entry #${sortedHistory.length - index}`)
      })

      // Add hover effects
      entry.addEventListener("mouseenter", () => {
        if (
          !entry.querySelector(".history-details").style.display ||
          entry.querySelector(".history-details").style.display === "none"
        ) {
          entry.style.backgroundColor = "#f1f5f9"
          entry.style.transform = "translateY(-2px)"
          entry.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"
        }
      })

      entry.addEventListener("mouseleave", () => {
        if (
          !entry.querySelector(".history-details").style.display ||
          entry.querySelector(".history-details").style.display === "none"
        ) {
          entry.style.backgroundColor = ""
          entry.style.transform = "translateY(0)"
          entry.style.boxShadow = ""
        }
      })

      chatHistoryList.appendChild(entry)
    })

    // Add event listeners for copy and export buttons
    addButtonEventListeners()

    console.log(`✅ Rendered ${sortedHistory.length} clickable history entries`)
  }

  // Add event listeners for copy and export buttons
  function addButtonEventListeners() {
    // Copy button functionality
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation() // Prevent entry toggle

        const content = decodeURIComponent(btn.dataset.content)
        const type = btn.dataset.type

        try {
          await navigator.clipboard.writeText(content)

          // Success feedback
          const originalText = btn.textContent
          btn.textContent = "✅ Copied!"
          btn.style.backgroundColor = "#10b981"

          setTimeout(() => {
            btn.textContent = originalText
            btn.style.backgroundColor = type === "message" ? "#3b82f6" : "#10b981"
          }, 2000)

          console.log(`📋 Copied ${type} to clipboard`)
        } catch (err) {
          console.error("❌ Failed to copy:", err)
          btn.textContent = "❌ Failed"
          setTimeout(() => {
            btn.textContent = `📋 Copy ${type === "message" ? "User Message" : "AI Response"}`
          }, 2000)
        }
      })
    })

    // Export button functionality
    document.querySelectorAll(".export-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation() // Prevent entry toggle

        try {
          const entryData = JSON.parse(btn.dataset.entry.replace(/&#39;/g, "'"))

          // Create formatted export data
          const exportData = {
            model: entryData.model,
            timestamp: entryData.timestamp,
            date: entryData.date,
            time: entryData.time,
            userMessage: entryData.message,
            aiResponse: entryData.response,
            exportedAt: new Date().toISOString(),
          }

          // Create and download file
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `chat-history-${entryData.date?.replace(/\//g, "-")}-${entryData.time?.replace(/:/g, "-")}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          // Success feedback
          const originalText = btn.textContent
          btn.textContent = "✅ Exported!"
          btn.style.backgroundColor = "#10b981"

          setTimeout(() => {
            btn.textContent = originalText
            btn.style.backgroundColor = "#f59e0b"
          }, 2000)

          console.log("💾 Entry exported successfully")
        } catch (err) {
          console.error("❌ Export failed:", err)
          btn.textContent = "❌ Failed"
          setTimeout(() => {
            btn.textContent = "💾 Export Entry"
          }, 2000)
        }
      })
    })
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
