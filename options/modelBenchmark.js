// Model Benchmark page functionality
document.addEventListener("DOMContentLoaded", () => {
  const benchmarkContainer = document.getElementById("benchmarkContainer")
  const chrome = window.chrome // Declare the chrome variable

  function renderBenchmark(benchmarks) {
    if (!benchmarks || !benchmarks.length) {
      benchmarkContainer.innerHTML = `
        <div class="benchmark-entry">
          <p>No benchmark data available.</p>
          <p>Model performance data will appear here as you use different AI models.</p>
        </div>
      `
      return
    }

    benchmarkContainer.innerHTML = ""
    benchmarks.forEach((item, index) => {
      const entry = document.createElement("div")
      entry.className = "benchmark-entry"

      // Calculate performance rating
      const score = Number.parseFloat(item.score) || 0
      let rating = "Unknown"
      let ratingColor = "#6b7280"

      if (score >= 90) {
        rating = "Excellent"
        ratingColor = "#10b981"
      } else if (score >= 75) {
        rating = "Good"
        ratingColor = "#3b82f6"
      } else if (score >= 60) {
        rating = "Average"
        ratingColor = "#f59e0b"
      } else if (score > 0) {
        rating = "Poor"
        ratingColor = "#ef4444"
      }

      entry.innerHTML = `
        <div class="benchmark-header">
          <strong>Model:</strong> ${item.model || "Unknown"}
          <span class="benchmark-rating" style="color: ${ratingColor}; font-weight: bold;">${rating}</span>
        </div>
        <div class="benchmark-details">
          <div class="benchmark-score">
            <strong>Score:</strong> ${item.score || "N/A"}
            ${score > 0 ? `<div class="score-bar"><div class="score-fill" style="width: ${Math.min(score, 100)}%; background-color: ${ratingColor};"></div></div>` : ""}
          </div>
          <div class="benchmark-date">
            <strong>Date:</strong> ${item.date || "N/A"}
          </div>
          ${
            item.responseTime
              ? `
            <div class="benchmark-time">
              <strong>Response Time:</strong> ${item.responseTime}ms
            </div>
          `
              : ""
          }
          ${
            item.tokensPerSecond
              ? `
            <div class="benchmark-tokens">
              <strong>Tokens/sec:</strong> ${item.tokensPerSecond}
            </div>
          `
              : ""
          }
        </div>
      `

      benchmarkContainer.appendChild(entry)
    })
  }

  // Load benchmark data from storage
  function loadBenchmarkData() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get("modelBenchmark", ({ modelBenchmark }) => {
        renderBenchmark(modelBenchmark || [])
      })
    } else {
      // Fallback for testing without chrome extension context
      renderBenchmark([])
    }
  }

  // Clear benchmark data function
  function clearBenchmarkData() {
    if (confirm("Are you sure you want to clear all benchmark data? This action cannot be undone.")) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ modelBenchmark: [] }, () => {
          renderBenchmark([])
          alert("Benchmark data cleared successfully!")
        })
      }
    }
  }

  // Add sample data for demonstration
  function addSampleData() {
    const sampleData = [
      {
        model: "deepseek-r1-distill-llama-70b",
        score: 92,
        date: new Date().toLocaleDateString(),
        responseTime: 1250,
        tokensPerSecond: 45,
      },
      {
        model: "llama-3.3-70b-versatile",
        score: 88,
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        responseTime: 980,
        tokensPerSecond: 52,
      },
      {
        model: "mistral-saba-24b",
        score: 75,
        date: new Date(Date.now() - 172800000).toLocaleDateString(),
        responseTime: 750,
        tokensPerSecond: 68,
      },
      {
        model: "gemma2-9b-it",
        score: 70,
        date: new Date(Date.now() - 259200000).toLocaleDateString(),
        responseTime: 450,
        tokensPerSecond: 85,
      },
    ]

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ modelBenchmark: sampleData }, () => {
        renderBenchmark(sampleData)
        alert("Sample benchmark data added!")
      })
    }
  }

  // Add control buttons
  const controlsDiv = document.createElement("div")
  controlsDiv.style.marginBottom = "20px"
  controlsDiv.style.display = "flex"
  controlsDiv.style.gap = "10px"
  controlsDiv.style.flexWrap = "wrap"

  const clearButton = document.createElement("button")
  clearButton.textContent = "🗑️ Clear Data"
  clearButton.className = "action-button"
  clearButton.addEventListener("click", clearBenchmarkData)

  const refreshButton = document.createElement("button")
  refreshButton.textContent = "🔄 Refresh"
  refreshButton.className = "action-button"
  refreshButton.addEventListener("click", loadBenchmarkData)

  const sampleButton = document.createElement("button")
  sampleButton.textContent = "📊 Add Sample Data"
  sampleButton.className = "action-button"
  sampleButton.addEventListener("click", addSampleData)

  controlsDiv.appendChild(clearButton)
  controlsDiv.appendChild(refreshButton)
  controlsDiv.appendChild(sampleButton)

  const content = document.getElementById("content")
  const h1 = content.querySelector("h1")
  h1.insertAdjacentElement("afterend", controlsDiv)

  // Load benchmark data on page load
  loadBenchmarkData()
})
