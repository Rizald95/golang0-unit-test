import { initializeFileUpload, detectLanguage } from "./fileHandler.js"

const apiKey = "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" // API Key Groq
const apiURL = "https://api.groq.com/openai/v1/chat/completions"

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button")
  const userInput = document.getElementById("input-message")
  const chatbox = document.getElementById("chatbox")
  const modelSelector = document.querySelector(".model-selector")
  const modelDropdown = document.querySelector(".model-dropdown")
  const selectedModelSpan = document.getElementById("selected-model")
  const modelIcon = document.getElementById("model-icon")

  let currentModel = "mistral-saba-24b" // Default model
  let currentModelIcon = "assets/mistral-valve.png" // Default model icon
  const uploadedFileName = null

  initializeFileUpload(userInput, appendMessage)
  initializeTheme()

  // ✅ BARU: Character counter functionality
  const charCount = document.getElementById("char-count")
  const maxLength = 4000

  userInput.addEventListener("input", () => {
    const currentLength = userInput.value.length
    charCount.textContent = currentLength

    // Update send button state
    const isEmpty = userInput.value.trim() === ""
    sendBtn.disabled = isEmpty

    // Update character counter color based on usage
    if (currentLength > maxLength * 0.9) {
      charCount.style.color = "var(--error-color)"
    } else if (currentLength > maxLength * 0.7) {
      charCount.style.color = "var(--warning-color)"
    } else {
      charCount.style.color = "var(--text-secondary)"
    }
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
  const themeToggleButton = document.querySelector(".theme-toggle-button")

  // Add event listener to toggle between light and dark mode
  themeToggleButton.addEventListener("click", () => {
    const body = document.body

    // Toggle between light-mode and dark-mode classes
    if (body.classList.contains("light-mode")) {
      body.classList.remove("light-mode")
      body.classList.add("dark-mode")
    } else {
      body.classList.remove("dark-mode")
      body.classList.add("light-mode")
    }

    // Save the theme preference to local storage
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark-mode" : "light-mode")
  })

  // Apply saved theme on page load
  window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light-mode"
    document.body.classList.add(savedTheme)
  })

  modelSelector.addEventListener("click", () => {
    modelDropdown.style.display = modelDropdown.style.display === "block" ? "none" : "block"
  })

  document.querySelectorAll(".model-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const selectedModel = e.target.dataset.model
      const selectedIcon = e.target.dataset.icon
      currentModel = selectedModel
      currentModelIcon = selectedIcon
      selectedModelSpan.textContent = e.target.textContent
      modelIcon.src = selectedIcon
      modelDropdown.style.display = "none"

      // Add a system message when the model is changed
      appendMessage(`Model changed to ${selectedModel}`, "system")
    })
  })

  // ✅ BARU: Quick action buttons functionality
  document.querySelectorAll(".quick-action-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.dataset.prompt
      userInput.value = prompt
      userInput.focus()

      // Update character counter and send button
      const event = new Event("input", { bubbles: true })
      userInput.dispatchEvent(event)
    })
  })

  document.querySelector(".format-button-2").addEventListener("click", () => {
    window.location.href = "file-generator.html"
  })

  document.addEventListener("DOMContentLoaded", () => {
    const timerButton = document.querySelector(".timer")

    timerButton.addEventListener("click", () => {
      chrome.tabs.create({ url: "timer.html" })
    })
  })

  document.getElementById("settings-button").addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      window.open(chrome.runtime.getURL("options/index.html"))
    }
  })

  document.addEventListener("click", (e) => {
    if (!modelSelector.contains(e.target)) {
      modelDropdown.style.display = "none"
    }
  })

  sendBtn.addEventListener("click", async () => {
    const inputText = userInput.value.trim()

    if (!inputText) {
      appendMessage("Please enter a message.", "assistant")
      return
    }

    appendMessage(inputText, "user")
    // ✅ DIUBAH: Reset input dan button state
    sendBtn.disabled = true
    charCount.textContent = "0"
    userInput.value = ""

    try {
      const language = uploadedFileName ? detectLanguage(uploadedFileName) : "plaintext"
      // Check if it's a DeepSeek model for reasoning support
      const isDeepSeekModel = currentModel.includes("deepseek")

      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: "system", content: `You are using the ${currentModel} model.` },
            { role: "user", content: inputText },
          ],
          stream: isDeepSeekModel, // Enable streaming for DeepSeek models
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error("API Error Response:", errorBody)
        let errorMessage = "An error occurred while processing your request."
        if (response.status === 503) {
          errorMessage = "The service is currently unavailable. Please try again later."
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please check your API key."
        }
        throw new Error(errorMessage)
      }

      if (isDeepSeekModel && response.body) {
        // Handle streaming response for DeepSeek models
        await handleStreamingResponse(response, currentModelIcon)
      } else {
        // Handle regular response
        const data = await response.json()
        if (data && data.choices && data.choices.length > 0) {
          const modelUsed = data.model || currentModel
          appendMessage(`Response from ${modelUsed}:`, "system")

          // Check if response contains thinking tags (both formats)
          const content = data.choices[0].message.content
          if (hasThinkingTags(content)) {
            handleNonStreamingDeepSeekResponse(content, currentModelIcon)
          } else {
            appendMessage(content, "assistant", currentModelIcon)
          }
        } else {
          throw new Error("Unexpected API response structure")
        }
      }
    } catch (error) {
      console.error("Error details:", error)
      appendMessage(error.message, "assistant", currentModelIcon)
    }
  })

  // ✅ DIUBAH: Helper function to detect thinking tags (termasuk format GroqAI)
  function hasThinkingTags(content) {
    return (
      (content.includes("<Thinking>") && content.includes("</Thinking>")) || // GroqAI format
      (content.includes("<Thinking>") && content.includes("</Thinking>")) ||
      (content.includes("<Thinking>") && content.includes("</Thinking>"))
    )
  }

  // ✅ DIUBAH: Extract thinking content (support GroqAI format)
  function extractThinkingContent(content) {
    let thinkStart = -1
    let thinkEnd = -1
    let tagLength = 0
    let endTagLength = 0

    // Check for <Thinking> tags (GroqAI DeepSeek format)
    if (content.includes("<Thinking>") && content.includes("</Thinking>")) {
      thinkStart = content.indexOf("<Thinking>")
      thinkEnd = content.indexOf("</Thinking>")
      tagLength = 7 // length of "<Thinking>"
      endTagLength = 8 // length of "</Thinking>"
    }
    // Check for <Thinking> tags
    else if (content.includes("<Thinking>") && content.includes("</Thinking>")) {
      thinkStart = content.indexOf("<Thinking>")
      thinkEnd = content.indexOf("</Thinking>")
      tagLength = 10 // length of "<Thinking>"
      endTagLength = 11 // length of "</Thinking>"
    }
    // Check for <Thinking> tags
    else if (content.includes("<Thinking>") && content.includes("</Thinking>")) {
      thinkStart = content.indexOf("<Thinking>")
      thinkEnd = content.indexOf("</Thinking>")
      tagLength = 10 // length of "<Thinking>"
      endTagLength = 11 // length of "</Thinking>"
    }

    if (thinkStart !== -1 && thinkEnd !== -1) {
      const thinkingContent = content.slice(thinkStart + tagLength, thinkEnd).trim()
      const responseContent = content.slice(thinkEnd + endTagLength).trim()
      return { thinkingContent, responseContent }
    }

    return { thinkingContent: "", responseContent: content }
  }

  function handleNonStreamingDeepSeekResponse(content, iconSrc) {
    const { thinkingContent, responseContent } = extractThinkingContent(content)

    // Create thinking container if thinking content exists
    if (thinkingContent) {
      const thinkingContainer = createThinkingContainer(iconSrc)
      updateThinkingContainer(thinkingContainer, thinkingContent, Date.now() - 15000) // Assume 15 seconds
      chatbox.appendChild(thinkingContainer)
    }

    // Create response container if response content exists
    if (responseContent) {
      const responseContainer = createResponseContainer(iconSrc)
      updateResponseContainer(responseContainer, responseContent)
      chatbox.appendChild(responseContainer)
    }

    chatbox.scrollTop = chatbox.scrollHeight
  }

  async function handleStreamingResponse(response, iconSrc) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let thinkingContainer = null
    let responseContainer = null
    let isInThinking = false
    const thinkingContent = ""
    let responseContent = ""
    const thinkingStartTime = Date.now()
    let buffer = ""
    let fullContent = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue
            if (data === "") continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                const content = parsed.choices[0].delta.content || ""
                fullContent += content

                // ✅ DIUBAH: Check if we're entering thinking mode (termasuk format GroqAI)
                if (
                  content.includes("<Thinking>") || // GroqAI format
                  content.includes("<Thinking>") ||
                  content.includes("<Thinking>") ||
                  (hasThinkingTags(fullContent) && !isInThinking)
                ) {
                  isInThinking = true
                  if (!thinkingContainer) {
                    thinkingContainer = createThinkingContainer(iconSrc)
                    chatbox.appendChild(thinkingContainer)
                  }

                  // Extract and update thinking content
                  const { thinkingContent: currentThinking } = extractThinkingContent(fullContent)
                  if (currentThinking) {
                    updateThinkingContainer(thinkingContainer, currentThinking, thinkingStartTime)
                  }
                  continue
                }

                // ✅ DIUBAH: Check if we're exiting thinking mode
                if (
                  content.includes("</Thinking>") || // GroqAI format
                  content.includes("<Thinking>\n</Thinking>") ||
                  content.includes("<Thinking>\n</Thinking>") ||
                  content.includes("<Thinking>\n</Thinking>") ||
                  content.includes("<Thinking>\n</Thinking>") ||
                  content.includes("<Thinking>\n</Thinking>") ||
                  content.includes("<Thinking>\n</Thinking>")
                ) {
                  const { thinkingContent: finalThinking, responseContent: newResponse } =
                    extractThinkingContent(fullContent)

                  if (finalThinking && thinkingContainer) {
                    updateThinkingContainer(thinkingContainer, finalThinking, thinkingStartTime)
                  }

                  // Check if thinking is complete
                  if (
                    fullContent.includes("<Thinking>\n</Thinking>") ||
                    fullContent.includes("<Thinking>\n</Thinking>") ||
                    fullContent.includes("<Thinking>\n</Thinking>") ||
                    fullContent.includes("<Thinking>\n</Thinking>") ||
                    fullContent.includes("<Thinking>\n</Thinking>") ||
                    fullContent.includes("<Thinking>\n</Thinking>")
                  ) {
                    isInThinking = false

                    // Start response container
                    if (!responseContainer && newResponse) {
                      responseContainer = createResponseContainer(iconSrc)
                      chatbox.appendChild(responseContainer)
                      responseContent = newResponse
                      updateResponseContainer(responseContainer, responseContent)
                    }
                  }
                  continue
                }

                // Add content to appropriate container
                if (isInThinking && thinkingContainer) {
                  const { thinkingContent: currentThinking } = extractThinkingContent(fullContent)
                  if (currentThinking) {
                    updateThinkingContainer(thinkingContainer, currentThinking, thinkingStartTime)
                  }
                } else if (responseContainer) {
                  const { responseContent: currentResponse } = extractThinkingContent(fullContent)
                  if (currentResponse) {
                    responseContent = currentResponse
                    updateResponseContainer(responseContainer, responseContent)
                  }
                } else if (!isInThinking && !hasThinkingTags(fullContent)) {
                  // If no thinking mode detected, create response container directly
                  if (!responseContainer) {
                    responseContainer = createResponseContainer(iconSrc)
                    chatbox.appendChild(responseContainer)
                  }
                  responseContent += content
                  updateResponseContainer(responseContainer, responseContent)
                }
              }
            } catch (e) {
              console.warn("Skipping malformed JSON chunk:", data.substring(0, 100) + "...")
            }
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.trim()) {
        const lines = buffer.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data && data !== "[DONE]") {
              try {
                const parsed = JSON.parse(data)
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const content = parsed.choices[0].delta.content || ""
                  if (content) {
                    fullContent += content
                    if (isInThinking && thinkingContainer) {
                      const { thinkingContent: currentThinking } = extractThinkingContent(fullContent)
                      if (currentThinking) {
                        updateThinkingContainer(thinkingContainer, currentThinking, thinkingStartTime)
                      }
                    } else if (responseContainer) {
                      const { responseContent: currentResponse } = extractThinkingContent(fullContent)
                      if (currentResponse) {
                        updateResponseContainer(responseContainer, currentResponse)
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn("Skipping final malformed JSON chunk")
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
      appendMessage("Error occurred during streaming response.", "assistant", iconSrc)
    }

    chatbox.scrollTop = chatbox.scrollHeight
  }

  function createThinkingContainer(iconSrc) {
    const container = document.createElement("div")
    container.classList.add("message", "assistant", "thinking-message")

    const iconContainer = document.createElement("div")
    iconContainer.classList.add("message-icon")
    const icon = document.createElement("img")
    icon.src = iconSrc
    icon.alt = "Model Icon"
    iconContainer.appendChild(icon)
    container.appendChild(iconContainer)

    const contentContainer = document.createElement("div")
    contentContainer.classList.add("message-text")

    const thinkingHeader = document.createElement("div")
    thinkingHeader.classList.add("thinking-header")
    thinkingHeader.innerHTML = `
      <span class="thinking-icon">🧠</span>
      <span class="thinking-text">Thought for <span class="thinking-duration">0</span> seconds</span>
      <span class="thinking-toggle">▼</span>
    `

    const thinkingContent = document.createElement("div")
    thinkingContent.classList.add("thinking-content")
    thinkingContent.style.display = "none"

    contentContainer.appendChild(thinkingHeader)
    contentContainer.appendChild(thinkingContent)
    container.appendChild(contentContainer)

    // Add toggle functionality
    thinkingHeader.addEventListener("click", () => {
      const isVisible = thinkingContent.style.display !== "none"
      thinkingContent.style.display = isVisible ? "none" : "block"
      thinkingHeader.querySelector(".thinking-toggle").textContent = isVisible ? "▼" : "▲"
    })

    return container
  }

  function updateThinkingContainer(container, content, startTime) {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    const durationSpan = container.querySelector(".thinking-duration")
    const contentDiv = container.querySelector(".thinking-content")

    if (durationSpan) {
      durationSpan.textContent = duration
    }

    if (contentDiv) {
      contentDiv.textContent = content
    }
  }

  function createResponseContainer(iconSrc) {
    const container = document.createElement("div")
    container.classList.add("message", "assistant")

    const iconContainer = document.createElement("div")
    iconContainer.classList.add("message-icon")
    const icon = document.createElement("img")
    icon.src = iconSrc
    icon.alt = "Model Icon"
    iconContainer.appendChild(icon)
    container.appendChild(iconContainer)

    const contentContainer = document.createElement("div")
    contentContainer.classList.add("message-text", "response-content")
    container.appendChild(contentContainer)

    return container
  }

  function updateResponseContainer(container, content) {
    const contentDiv = container.querySelector(".response-content")
    if (contentDiv) {
      // Check if the content contains code snippets
      const codeRegex = /```(\w+)?\n([\s\S]*?)```/g
      let lastIndex = 0
      let match

      contentDiv.innerHTML = ""

      while ((match = codeRegex.exec(content)) !== null) {
        // Add text before the code snippet
        if (match.index > lastIndex) {
          const textNode = document.createTextNode(content.slice(lastIndex, match.index))
          contentDiv.appendChild(textNode)
        }

        // Create and add the code display element
        const language = match[1] || "plaintext"
        const code = match[2].trim()
        const codeDisplay = createCodeDisplay("Generated Code", "Here's the code snippet:", code, language)
        contentDiv.appendChild(codeDisplay)

        lastIndex = match.index + match[0].length
      }

      // Add any remaining text after the last code snippet
      if (lastIndex < content.length) {
        const textNode = document.createTextNode(content.slice(lastIndex))
        contentDiv.appendChild(textNode)
      }
    }
  }

  function appendMessage(message, sender, iconSrc = null) {
    const messageElement = document.createElement("div")
    messageElement.classList.add("message", sender)

    if ((sender === "assistant" || sender === "system") && iconSrc) {
      const iconContainer = document.createElement("div")
      iconContainer.classList.add("message-icon")
      const icon = document.createElement("img")
      icon.src = iconSrc
      icon.alt = "Model Icon"
      iconContainer.appendChild(icon)
      messageElement.appendChild(iconContainer)
    }

    const textContainer = document.createElement("div")
    textContainer.classList.add("message-text")

    // ✅ DIUBAH: Check if message contains thinking tags and handle them
    if (hasThinkingTags(message)) {
      handleNonStreamingDeepSeekResponse(message, iconSrc)
      return // Don't append as regular message
    }

    // Check if the message contains a code snippet
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = codeRegex.exec(message)) !== null) {
      // Add text before the code snippet
      if (match.index > lastIndex) {
        const textNode = document.createTextNode(message.slice(lastIndex, match.index))
        textContainer.appendChild(textNode)
      }

      // Create and add the code display element
      const language = match[1] || "plaintext"
      const code = match[2].trim()
      const codeDisplay = createCodeDisplay("Generated Code", "Here's the code snippet:", code, language)
      textContainer.appendChild(codeDisplay)

      lastIndex = match.index + match[0].length
    }

    // Add any remaining text after the last code snippet
    if (lastIndex < message.length) {
      const textNode = document.createTextNode(message.slice(lastIndex))
      textContainer.appendChild(textNode)
    }

    messageElement.appendChild(textContainer)
    chatbox.appendChild(messageElement)
    chatbox.scrollTop = chatbox.scrollHeight
  }

  function createCodeDisplay(title, description, code, language) {
    const codeDisplayElement = document.createElement("div")
    codeDisplayElement.className = "code-display"
    codeDisplayElement.style.backgroundColor = "#1e1e1e"
    codeDisplayElement.style.borderRadius = "8px"
    codeDisplayElement.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)"
    codeDisplayElement.style.marginBottom = "16px"
    codeDisplayElement.style.overflow = "hidden"

    const headerElement = document.createElement("div")
    headerElement.style.padding = "12px"
    headerElement.style.backgroundColor = "#252526"
    headerElement.innerHTML = `
      <h3 style="font-size: 16px; font-weight: bold; color: #d4d4d4; margin-bottom: 4px;">${title}</h3>
      <p style="color: #808080; font-size: 14px;">${description}</p>
    `

    const codeElement = document.createElement("div")
    codeElement.className = "relative"
    codeElement.style.position = "relative"
    codeElement.style.padding = "16px"
    codeElement.style.backgroundColor = "#1e1e1e"
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
    `

    codeDisplayElement.appendChild(headerElement)
    codeDisplayElement.appendChild(codeElement)

    // Add copy functionality
    const copyButton = codeElement.querySelector(".copy-button")
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(code).then(() => {
        copyButton.textContent = "Copied!"
        setTimeout(() => {
          copyButton.textContent = "Copy"
        }, 2000)
      })
    })

    return codeDisplayElement
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "light-mode"
    document.body.classList.add(savedTheme)
    updateThemeIcon(savedTheme === "light-mode")
  }

  function toggleTheme() {
    const isLightMode = document.body.classList.contains("light-mode")
    document.body.classList.remove(isLightMode ? "light-mode" : "dark-mode")
    document.body.classList.add(isLightMode ? "dark-mode" : "light-mode")
    localStorage.setItem("theme", isLightMode ? "dark-mode" : "light-mode")
    updateThemeIcon(!isLightMode)
  }

  function updateThemeIcon(isLightMode) {
    const themeToggleButton = document.querySelector(".theme-toggle-button span")
    themeToggleButton.textContent = isLightMode ? "🌙" : "☀️"
    themeToggleButton.parentElement.title = `Switch to ${isLightMode ? "Dark" : "Light"} Mode`
  }
})
