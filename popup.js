import { initializeFileUpload, detectLanguage } from './fileHandler.js'; 


const apiKey = ""; // API Key Groq
const apiURL = "https://api.groq.com/openai/v1/chat/completions";

// ✅ Conversation state management
let conversationStarted = false
let messageCount = 0

// ✅ KEYWORD FILTER CONFIGURATION
const ALLOWED_KEYWORDS = [
  // Core testing terms
  "unit test",
  "unittest",
  "unit-test",
  "unit testing",
  "test",
  "testing",
  "tests",
  "tester",
  "tdd",
  "bdd",
  "test driven",
  "behavior driven",

  // Go/Golang specific
  "golang",
  "go",
  "go lang",
  "go language",
  "go test",
  "go testing",
  "go unit test",

  // Testing concepts
  "mock",
  "mocking",
  "mocks",
  "mockery",
  "stub",
  "stubbing",
  "stubs",
  "assert",
  "assertion",
  "assertions",
  "coverage",
  "test coverage",
  "code coverage",
  "benchmark",
  "benchmarking",
  "benchmarks",

  // Go specific terms
  "function",
  "func",
  "method",
  "methods",
  "package",
  "struct",
  "interface",
  "interfaces",
  "error handling",
  "error",
  "errors",
  "table driven",
  "table-driven",
  "table test",

  // Testing types
  "integration test",
  "integration testing",
  "end to end",
  "e2e",
  "end-to-end",
  "acceptance test",
  "acceptance testing",
  "regression test",
  "regression testing",

  // Testing tools and frameworks
  "testify",
  "ginkgo",
  "gomega",
  "goconvey",
  "httptest",
  "testing.t",
  "testing.b",

  // Code quality
  "refactor",
  "refactoring",
  "clean code",
  "code review",
  "quality",
  "best practice",
  "documentation",
  "comment",
  "comments",

  // Development terms
  "debug",
  "debugging",
  "fix",
  "bug",
  "issue",
  "implement",
  "implementation",
  "develop",
  "generate",
  "create",
  "build",
  "write",
]


// ✅ Function to open quick action pages
function openQuickAction(page) {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
    // After a short delay, navigate to the specific page
    setTimeout(() => {
      window.open(chrome.runtime.getURL(`options/${page}.html`))
    }, 100)
  } else {
    window.open(chrome.runtime.getURL(`options/${page}.html`))
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("input-message");
  const chatbox = document.getElementById("chatbox");
  const modelSelector = document.querySelector(".model-selector");
  const modelDropdown = document.querySelector(".model-dropdown");
  const selectedModelSpan = document.getElementById("selected-model");
  const modelIcon = document.getElementById("model-icon");
   const welcomeMessage = document.querySelector(".welcome-message")

  let currentModel = "mixtral-8x7b-32768"; // Default model
  let currentModelIcon = "assets/mistral-valve.png"; // Default model icon
   let uploadedFileName = null;
   
     // ✅ Load conversation state on startup
  loadConversationState()
   
   // ✅ Initialize quick action buttons
  document.querySelectorAll(".quick-action-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action
      if (action) {
        openQuickAction(action)
      }
    })
  })
   
    initializeFileUpload(userInput, appendMessage);
	 initializeTheme();
	
 // ✅ BARU: Character counter functionality
  const charCount = document.getElementById("char-count")
  const maxLength = 4000

  userInput.addEventListener("input", () => {
    const currentLength = userInput.value.length
    charCount.textContent = currentLength

    // Update send button state
    const isEmpty = userInput.value.trim() === ""
	 const isValid = validateInput(userInput.value.trim())
    sendBtn.disabled = isEmpty || !isValid

    // Update character counter color based on usage
    if (currentLength > maxLength * 0.9) {
      charCount.style.color = "var(--error-color)"
    } else if (currentLength > maxLength * 0.7) {
      charCount.style.color = "var(--warning-color)"
    } else {
      charCount.style.color = "var(--text-secondary)"
    }
	
	// ✅ Real-time validation feedback
    updateInputValidationUI(isValid, userInput.value.trim())
  })

  // ✅ BARU: Initialize send button state
  sendBtn.disabled = true

  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault()
      userInput.value += "\n"
    } else if (event.key === "Enter") {
      event.preventDefault()
      sendBtn.click()
    }
  })
  
  // Get the theme toggle button
const themeToggleButton = document.querySelector('.theme-toggle-button');

// Add event listener to toggle between light and dark mode
themeToggleButton.addEventListener('click', () => {
  const body = document.body;

  // Toggle between light-mode and dark-mode classes
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
  }

  // Save the theme preference to local storage
  localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
});

// Apply saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light-mode';
  document.body.classList.add(savedTheme);
});

  modelSelector.addEventListener("click", () => {
    modelDropdown.style.display = modelDropdown.style.display === "block" ? "none" : "block";
  });

  document.querySelectorAll(".model-option").forEach(option => {
    option.addEventListener("click", (e) => {
      const selectedModel = e.target.dataset.model;
      const selectedIcon = e.target.dataset.icon;
      currentModel = selectedModel;
      currentModelIcon = selectedIcon;
      selectedModelSpan.textContent = e.target.textContent;
      modelIcon.src = selectedIcon;
      modelDropdown.style.display = "none";
      
      // Add a system message when the model is changed
      appendMessage(`Model changed to ${selectedModel}`, "system");
    });
  });
  
   document.querySelector('.format-button-2').addEventListener('click', () => {
    window.location.href = 'file-generator.html';
  });
  
  document.addEventListener("DOMContentLoaded", () => {
  const timerButton = document.querySelector(".timer");

  timerButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "timer.html" });
  });
});

document.getElementById("settings-button").addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options/index.html"));
  }
});

  document.addEventListener("click", (e) => {
    if (!modelSelector.contains(e.target)) {
      modelDropdown.style.display = "none";
    }
  });

  sendBtn.addEventListener("click", async () => {
    const inputText = userInput.value.trim();

    if (!inputText) {
      appendMessage("Please enter a message.", "assistant");
      return;
    }
	
	// ✅ Validate input against allowed keywords
    if (!validateInput(inputText)) {
      showValidationError(
        "Your message should be related to unit testing, Go/Golang, or software testing. Please include relevant keywords.",
        "invalid",
      )
      showKeywordSuggestions()
      return
    }

    // Clear any existing validation errors
    clearValidationError()
	
    // ✅ Hide welcome message on first user input
    if (!conversationStarted) {
      hideWelcomeMessage()
      conversationStarted = true
      messageCount = 0
      saveConversationState()
    }

    appendMessage(inputText, "user")
    messageCount++
    saveConversationState()

    sendBtn.disabled = true
    charCount.textContent = "0"
    userInput.value = ""

    try {
		const language = uploadedFileName ? detectLanguage(uploadedFileName) : 'plaintext';
		
		 // Check if it's a DeepSeek model for reasoning support
    
	  
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: "system", content: `You are using the ${currentModel} model. Focus on Go/Golang unit testing, TDD, and software testing best practices.` },
            { role: "user", content: inputText }
          ],
		     stream: false,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        let errorMessage = "An error occurred while processing your request.";
        if (response.status === 503) {
          errorMessage = "The service is currently unavailable. Please try again later.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please check your API key.";
        }
        throw new Error(errorMessage);
      }

     const data = await response.json()
      if (data && data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content

        if (hasThinkingTags(content)) {
          handleDeepSeekResponse(content, currentModelIcon)
        } else {
          appendMessage(content, "assistant", currentModelIcon)
        }
		
		// ✅ SAVE TO CHAT HISTORY
		saveChatHistory(inputText, content, currentModel)
		
		messageCount++
        saveConversationState()
      }
    } catch (error) {
		console.error("Error:", error)
		const errorMessage = "Error occurred: " + error.message
		appendMessage(errorMessage, "assistant", currentModelIcon)

		// ✅ SAVE ERROR TO CHAT HISTORY TOO
		saveChatHistory(inputText, errorMessage, currentModel)
    }
  });
  
  
  
  // ✅ INPUT VALIDATION FUNCTIONS
  function validateInput(text) {
    if (!text || text.length < 3) return false

    const lowerText = text.toLowerCase()

    // Check if text contains any of the allowed keywords
    return ALLOWED_KEYWORDS.some((keyword) => lowerText.includes(keyword.toLowerCase()))
  }

  function updateInputValidationUI(isValid, text) {
  const validationIndicator = document.getElementById("validation-indicator")

  // Remove existing validation indicator
  if (validationIndicator) {
    validationIndicator.remove()
  }

  // Only show validation feedback if there's text
  if (text.length > 0) {
    const indicator = document.createElement("div")
    indicator.id = "validation-indicator"
    indicator.className = isValid ? "valid" : "invalid"

    indicator.innerHTML = `
      <span>${isValid ? "✅" : "⚠️"}</span>
      <span>${isValid ? "Valid input - related to testing!" : "Please include testing-related keywords"}</span>
    `

    document.body.appendChild(indicator)

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove()
      }
    }, 3000)
  }
}

  function showValidationError(message, type) {
  // Remove existing error
  clearValidationError()

  const errorDiv = document.createElement("div")
  errorDiv.id = "validation-error"

  errorDiv.innerHTML = `
    <div class="error-content">
      <span class="error-icon">🚫</span>
      <div class="error-text">${message}</div>
    </div>
  `

  document.body.appendChild(errorDiv)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.style.animation = "slideDownError 0.3s ease-in"
      setTimeout(() => errorDiv.remove(), 300)
    }
  }, 5000)
}

 function showKeywordSuggestions() {
  // Remove existing suggestions
  const existingSuggestions = document.getElementById("keyword-suggestions")
  if (existingSuggestions) {
    existingSuggestions.remove()
  }

  const suggestionsDiv = document.createElement("div")
  suggestionsDiv.id = "keyword-suggestions"

  const popularKeywords = [
    "unit test", "golang", "go testing", "TDD", "mock",
    "test coverage", "benchmark", "table driven test",
    "integration test", "error handling"
  ]

  suggestionsDiv.innerHTML = `
    <div class="suggestions-header">
      💡 Try these keywords:
    </div>
    <div class="suggestions-grid">
      ${popularKeywords.map(keyword => `
        <button class="keyword-suggestion" onclick="insertKeyword('${keyword}')">${keyword}</button>
      `).join('')}
    </div>
    <div class="suggestions-footer">
      Click on a keyword to insert it into your message
    </div>
  `

  document.body.appendChild(suggestionsDiv)

  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (suggestionsDiv.parentNode) {
      suggestionsDiv.style.animation = "slideDownError 0.3s ease-in"
      setTimeout(() => suggestionsDiv.remove(), 300)
    }
  }, 8000)
}

  // ✅ Global function to insert keywords (called from suggestion clicks)
  window.insertKeyword = (keyword) => {
    const currentText = userInput.value
    const newText = currentText ? `${currentText} ${keyword}` : keyword
    userInput.value = newText
    userInput.focus()

    // Trigger input event to update validation
    userInput.dispatchEvent(new Event("input"))

    // Remove suggestions
    const suggestions = document.getElementById("keyword-suggestions")
    if (suggestions) {
      suggestions.remove()
    }
  }

  function clearValidationError() {
    const errorDiv = document.getElementById("validation-error")
    if (errorDiv) {
      errorDiv.remove()
    }

    const suggestions = document.getElementById("keyword-suggestions")
    if (suggestions) {
      suggestions.remove()
    }

    const indicator = document.getElementById("validation-indicator")
    if (indicator) {
      indicator.remove()
    }
  }
  
   // ✅ CONVERSATION STATE MANAGEMENT FUNCTIONS
  function loadConversationState() {
    console.log("🔄 Loading conversation state...")

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["conversationStarted", "messageCount"], (result) => {
        conversationStarted = result.conversationStarted || false
        messageCount = result.messageCount || 0

        console.log(`📊 Loaded state - Started: ${conversationStarted}, Messages: ${messageCount}`)

        // Show/hide welcome message based on conversation state
        if (conversationStarted && messageCount > 0) {
          hideWelcomeMessage()
        } else {
          showWelcomeMessage()
        }
      })
    } else {
      // Fallback to localStorage
      conversationStarted = localStorage.getItem("conversationStarted") === "true"
      messageCount = Number.parseInt(localStorage.getItem("messageCount") || "0")

      if (conversationStarted && messageCount > 0) {
        hideWelcomeMessage()
      } else {
        showWelcomeMessage()
      }
    }
  }
  
  function saveConversationState() {
    console.log(`💾 Saving state - Started: ${conversationStarted}, Messages: ${messageCount}`)

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({
        conversationStarted: conversationStarted,
        messageCount: messageCount,
      })
    } else {
      // Fallback to localStorage
      localStorage.setItem("conversationStarted", conversationStarted.toString())
      localStorage.setItem("messageCount", messageCount.toString())
    }
  }
  
  // ✅ CHAT HISTORY MANAGEMENT FUNCTIONS
  function saveChatHistory(userMessage, assistantResponse, model) {
    const timestamp = new Date().toISOString()
    const historyEntry = {
      model: model,
      message: userMessage,
      response: assistantResponse,
      timestamp: timestamp,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    }

    console.log("💾 Saving chat history entry:", historyEntry)

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get("chatHistory", (result) => {
        const chatHistory = result.chatHistory || []
        chatHistory.push(historyEntry)

        // Keep only last 100 entries to prevent storage overflow
        if (chatHistory.length > 100) {
          chatHistory.splice(0, chatHistory.length - 100)
        }

        chrome.storage.local.set({ chatHistory: chatHistory }, () => {
          console.log("✅ Chat history saved successfully")
        })
      })
    } else {
      // Fallback to localStorage
      const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]")
      chatHistory.push(historyEntry)

      if (chatHistory.length > 100) {
        chatHistory.splice(0, chatHistory.length - 100)
      }

      localStorage.setItem("chatHistory", JSON.stringify(chatHistory))
      console.log("✅ Chat history saved to localStorage")
    }
  }

  function clearChatHistory() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ chatHistory: [] }, () => {
        console.log("🗑️ Chat history cleared")
      })
    } else {
      localStorage.setItem("chatHistory", "[]")
    }
  }


  function hideWelcomeMessage() {
    console.log("👋 Hiding welcome message")
    if (welcomeMessage) {
      welcomeMessage.style.display = "none"
      welcomeMessage.classList.add("hidden")
    }
  }

  function showWelcomeMessage() {
    console.log("🚀 Showing welcome message")
    if (welcomeMessage) {
      welcomeMessage.style.display = "block"
      welcomeMessage.classList.remove("hidden")
    }
  }

  // ✅ RESET CONVERSATION FUNCTION (for testing or manual reset)
  // ✅ RESET CONVERSATION FUNCTION (DIPERBAIKI)
function resetConversation() {
  console.log("🔄 Resetting conversation")

    // Ask user if they want to clear chat history too
    const clearHistory = confirm("Do you want to clear chat history as well?")

    conversationStarted = false
    messageCount = 0
    saveConversationState()

    // Clear ALL message types (including DeepSeek special elements)
    const messagesToRemove = chatbox.querySelectorAll(`
    .message,
    .thinking-message,
    .code-message,
    .text-message,
    .response-content,
    .code-display,
    .generated-code,
    [class*="deepseek"],
    [class*="thinking"],
    [class*="code-section"]
  `)

    messagesToRemove.forEach((element) => {
      console.log("🗑️ Removing element:", element.className)
      element.remove()
    })

    // Alternative: Clear entire chatbox content except welcome message
    const allChildren = Array.from(chatbox.children)
    allChildren.forEach((child) => {
      if (!child.classList.contains("welcome-message")) {
        child.remove()
      }
    })

    // Clear any validation errors
    clearValidationError()

    // Reset input field
    const userInput = document.getElementById("input-message")
    if (userInput) {
      userInput.value = ""
      userInput.dispatchEvent(new Event("input"))
    }

    // Reset send button
    const sendBtn = document.getElementById("send-button")
    if (sendBtn) {
      sendBtn.disabled = true
    }

    // Reset character counter
    const charCount = document.getElementById("char-count")
    if (charCount) {
      charCount.textContent = "0"
      charCount.style.color = "var(--text-secondary)"
    }

    // ✅ CLEAR CHAT HISTORY IF REQUESTED
    if (clearHistory) {
      clearChatHistory()
    }

    showWelcomeMessage()

    console.log("✅ Conversation reset complete")
}

  // ✅ Add reset button to toolbar (for testing - can be removed in production)
  const toolbar = document.querySelector(".toolbar")
  if (toolbar) {
    const resetButton = document.createElement("button")
    resetButton.className = "tool-button"
    resetButton.title = "Reset Conversation"
    resetButton.innerHTML = "<span>🔄</span>"
    resetButton.addEventListener("click", resetConversation)
    toolbar.appendChild(resetButton)
	
	// ✅ ADD CHAT HISTORY BUTTON
    const historyButton = document.createElement("button")
    historyButton.className = "tool-button"
    historyButton.title = "View Chat History"
    historyButton.innerHTML = "<span>📜</span>"
    historyButton.addEventListener("click", () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage()
        setTimeout(() => {
          window.open(chrome.runtime.getURL("options/chatHistory.html"))
        }, 100)
      } else {
        window.open(chrome.runtime.getURL("options/chatHistory.html"))
      }
    })
    toolbar.appendChild(historyButton)
  }
  
   // ✅ DETECT THINKING TAGS
  function hasThinkingTags(content) {
    return (
      (content.includes("<think>") && content.includes("</think>")) ||
      (content.includes("<Thinking>") && content.includes("</Thinking>"))
    )
  }

  // ✅ EXTRACT THINKING AND RESPONSE CONTENT
  function extractContent(content) {
    console.log("🔍 Extracting content...")

    // Try <Thinking> tags first (GroqAI format)
    if (content.includes("<think>") && content.includes("</think>")) {
      const thinkStart = content.indexOf("<think>")
      const thinkEnd = content.indexOf("</think>")
      const thinkingContent = content.slice(thinkStart + 7, thinkEnd).trim()
      const responseContent = content.slice(thinkEnd + 8).trim()

      console.log("✅ Found <think> tags")
      return { thinkingContent, responseContent }
    }

    // Try <Thinking> tags (standard format)
    if (content.includes("<Thinking>") && content.includes("</Thinking>")) {
      const thinkStart = content.indexOf("<Thinking>")
      const thinkEnd = content.indexOf("</Thinking>")
      const thinkingContent = content.slice(thinkStart + 10, thinkEnd).trim()
      const responseContent = content.slice(thinkEnd + 11).trim()

      console.log("✅ Found <Thinking> tags")
      return { thinkingContent, responseContent }
    }

    return { thinkingContent: "", responseContent: content }
  }

  // ✅ MAIN FUNCTION: Handle DeepSeek response with advanced parsing
  function handleDeepSeekResponse(content, iconSrc) {
    console.log("🚀 Handling DeepSeek response with advanced parsing")
    const { thinkingContent, responseContent } = extractContent(content)

    // 1. Create thinking section if exists
    if (thinkingContent) {
      console.log("🧠 Creating thinking section")
      createThinkingSection(thinkingContent, iconSrc)
    }

    // 2. Parse and create response sections
    if (responseContent && responseContent.length > 0) {
      console.log("💬 Parsing response content")
      parseAndCreateResponseSections(responseContent, iconSrc)
    }

    chatbox.scrollTop = chatbox.scrollHeight
  }

  // ✅ CREATE THINKING SECTION (same as before)
  function createThinkingSection(content, iconSrc) {
    const container = document.createElement("div")
    container.className = "message assistant thinking-message"
    container.style.cssText = `
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 8px;
      background-color: var(--thinking-bg);
      border-left: 4px solid var(--thinking-border);
      display: flex;
      align-items: flex-start;
      gap: 8px;
    `

    // Add icon
    const iconDiv = document.createElement("div")
    iconDiv.style.cssText = "width: 24px; height: 24px; flex-shrink: 0;"
    const icon = document.createElement("img")
    icon.src = iconSrc
    icon.style.cssText = "width: 100%; height: 100%;"
    iconDiv.appendChild(icon)
    container.appendChild(iconDiv)

    // Add content
    const contentDiv = document.createElement("div")
    contentDiv.style.cssText = "flex: 1;"

    // Header
    const header = document.createElement("div")
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 8px;
    `
    header.innerHTML = `
      <span style="font-size: 16px;">🧠</span>
      <span style="font-size: 14px; color: var(--text-secondary); flex-grow: 1;">Thought for 1 seconds</span>
      <span style="font-size: 12px; color: var(--text-secondary);" class="toggle">▼</span>
    `

    // Thinking content (hidden by default)
    const thinkingDiv = document.createElement("div")
    thinkingDiv.style.cssText = `
      background-color: var(--message-bg);
      padding: 12px;
      border-radius: 6px;
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre-wrap;
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      display: none;
    `
    thinkingDiv.textContent = content

    // Toggle functionality
    header.addEventListener("click", () => {
      const isVisible = thinkingDiv.style.display !== "none"
      thinkingDiv.style.display = isVisible ? "none" : "block"
      header.querySelector(".toggle").textContent = isVisible ? "▼" : "▲"
    })

    contentDiv.appendChild(header)
    contentDiv.appendChild(thinkingDiv)
    container.appendChild(contentDiv)
    chatbox.appendChild(container)
  }

  // ✅ PARSE RESPONSE CONTENT AND CREATE SECTIONS
  function parseAndCreateResponseSections(content, iconSrc) {
    // Split content by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim()
        if (textContent) {
          parts.push({ type: "text", content: textContent })
        }
      }

      // Add code block
      const language = match[1] || "plaintext"
      const code = match[2].trim()
      parts.push({ type: "code", language, content: code })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex).trim()
      if (textContent) {
        parts.push({ type: "text", content: textContent })
      }
    }

    // If no code blocks found, treat as single text
    if (parts.length === 0) {
      parts.push({ type: "text", content: content })
    }

    // Create sections for each part
    parts.forEach((part, index) => {
      if (part.type === "text") {
        createTextSection(part.content, iconSrc, index === 0)
      } else if (part.type === "code") {
		  const codeBlock = createCodeDisplay("Generated Code", "Here's the code snippet:", part.content, part.language);
chatbox.appendChild(codeBlock);

      }
    })
  }

  // ✅ CREATE TEXT SECTION
  function createTextSection(content, iconSrc, showIcon = true) {
    const container = document.createElement("div")
    container.className = "message assistant text-message"
    container.style.cssText = `
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 8px;
      background-color: var(--message-assistant-bg);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: flex-start;
      gap: 8px;
    `

    // Add icon (only for first text section)
    if (showIcon) {
      const iconDiv = document.createElement("div")
      iconDiv.style.cssText = "width: 24px; height: 24px; flex-shrink: 0; margin-top: 4px;"
      const icon = document.createElement("img")
      icon.src = iconSrc
      icon.style.cssText = "width: 100%; height: 100%;"
      iconDiv.appendChild(icon)
      container.appendChild(iconDiv)
    } else {
      // Add spacer for alignment
      const spacer = document.createElement("div")
      spacer.style.cssText = "width: 32px; flex-shrink: 0;"
      container.appendChild(spacer)
    }

    // Add text content
    const textDiv = document.createElement("div")
    textDiv.style.cssText = `
      flex: 1;
      line-height: 1.6;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-wrap: break-word;
    `
    textDiv.textContent = content

    container.appendChild(textDiv)
    chatbox.appendChild(container)
  }
  
   // ✅ HELPER FUNCTION: Detect language from code content
  function detectLanguageFromCode(code) {
    const trimmedCode = code.trim().toLowerCase()

    // Go language detection
    if (
      trimmedCode.includes("package main") ||
      trimmedCode.includes("func main()") ||
      trimmedCode.includes('import "fmt"')
    ) {
      return "go"
    }

    // JavaScript detection
    if (
      trimmedCode.includes("function") ||
      trimmedCode.includes("const ") ||
      trimmedCode.includes("let ") ||
      trimmedCode.includes("console.log")
    ) {
      return "javascript"
    }

    // Python detection
    if (trimmedCode.includes("def ") || trimmedCode.includes("import ") || trimmedCode.includes("print(")) {
      return "python"
    }

    // HTML detection
    if (trimmedCode.includes("<html") || trimmedCode.includes("<!doctype") || trimmedCode.includes("<div")) {
      return "html"
    }

    // CSS detection
    if (
      trimmedCode.includes("{") &&
      (trimmedCode.includes("color:") || trimmedCode.includes("margin:") || trimmedCode.includes("padding:"))
    ) {
      return "css"
    }

    return "plaintext"
  }

  function appendMessage(message, sender, iconSrc = null) {
	  if (hasThinkingTags(message)) {
      handleDeepSeekResponse(message, iconSrc)
      return
    }
	
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);

    if ((sender === "assistant" || sender === "system") && iconSrc) {
      const iconContainer = document.createElement("div");
      iconContainer.classList.add("message-icon");
      const icon = document.createElement("img");
      icon.src = iconSrc;
      icon.alt = "Model Icon";
      iconContainer.appendChild(icon);
      messageElement.appendChild(iconContainer);
    }

    const textContainer = document.createElement("div");
    textContainer.classList.add("message-text");
	
   // textContainer.textContent = message;
  //  messageElement.appendChild(textContainer);

    // Check if the message contains a code snippet
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(message)) !== null) {
      // Add text before the code snippet
      if (match.index > lastIndex) {
        const textNode = document.createTextNode(message.slice(lastIndex, match.index));
        textContainer.appendChild(textNode);
      }

      // Create and add the code display element
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      const codeDisplay = createCodeDisplay("Generated Code", "Here's the code snippet:", code, language);
      textContainer.appendChild(codeDisplay);

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last code snippet
    if (lastIndex < message.length) {
      const textNode = document.createTextNode(message.slice(lastIndex));
      textContainer.appendChild(textNode);
    }

    messageElement.appendChild(textContainer);
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
	
  }
  
 function createCodeDisplay(title, description, code, language) {
	 
  const codeDisplayElement = document.createElement('div');
  codeDisplayElement.className = 'code-display';
  codeDisplayElement.style.backgroundColor = '#1e1e1e'; // Warna latar belakang tema gelap
  codeDisplayElement.style.borderRadius = '8px';
  codeDisplayElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  codeDisplayElement.style.marginBottom = '16px';
  codeDisplayElement.style.overflow = 'hidden';

  const headerElement = document.createElement('div');
  headerElement.style.padding = '12px';
  headerElement.style.backgroundColor = '#252526'; // Warna header tema gelap
  headerElement.innerHTML = `
    <h3 style="font-size: 16px; font-weight: bold; color: #d4d4d4; margin-bottom: 4px;">${title}</h3>
    <p style="color: #808080; font-size: 14px;">${description}</p>
  `;

  const codeElement = document.createElement('div');
  codeElement.className = 'relative';
  codeElement.style.position = 'relative';
  codeElement.style.padding = '16px';
  codeElement.style.backgroundColor = '#1e1e1e'; // Sama dengan latar luar
  codeElement.innerHTML = `
    <pre style="color: #dcdcdc; font-family: 'Consolas', 'Courier New', monospace;"><code class="language-${language}">${escapeHtml(code)}</code></pre>
    <button class="copy-button" style="
      position: absolute; 
      top: 8px; 
      right: 8px; 
      background-color: #007acc; 
      color: white; 
      font-size: 12px; 
      font-weight: bold; 
      padding: 4px 8px; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
    ">
      Copy
    </button>
  `;

  codeDisplayElement.appendChild(headerElement);
  codeDisplayElement.appendChild(codeElement);

  // Add copy functionality
  const copyButton = codeElement.querySelector('.copy-button');
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(code).then(() => {
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    });
  });

  return codeDisplayElement;
}

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
   function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    document.body.classList.add(savedTheme);
    updateThemeIcon(savedTheme === 'light-mode');
  }

  function toggleTheme() {
    const isLightMode = document.body.classList.contains('light-mode');
    document.body.classList.remove(isLightMode ? 'light-mode' : 'dark-mode');
    document.body.classList.add(isLightMode ? 'dark-mode' : 'light-mode');
    localStorage.setItem('theme', isLightMode ? 'dark-mode' : 'light-mode');
    updateThemeIcon(!isLightMode);
  }

  function updateThemeIcon(isLightMode) {
    const themeToggleButton = document.querySelector('.theme-toggle-button span');
    themeToggleButton.textContent = isLightMode ? '🌙' : '☀️';
    themeToggleButton.parentElement.title = `Switch to ${isLightMode ? 'Dark' : 'Light'} Mode`;
  }
});
