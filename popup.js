const apiKey = "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"; // API Key Groq
const apiURL = "https://api.groq.com/openai/v1/chat/completions";

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("input-message");
  const chatbox = document.getElementById("chatbox");
  const modelSelector = document.querySelector(".model-selector");
  const modelDropdown = document.querySelector(".model-dropdown");
  const selectedModelSpan = document.getElementById("selected-model");
  const modelIcon = document.getElementById("model-icon");

  let currentModel = "mixtral-8x7b-32768"; // Default model
  let currentModelIcon = "assets/mistral-valve.png"; // Default model icon

  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      userInput.value += "\n";
    } else if (event.key === "Enter") {
      event.preventDefault();
      sendBtn.click();
    }
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

    appendMessage(inputText, "user");
    userInput.value = "";

    try {
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { role: "system", content: `You are using the ${currentModel} model.` },
            { role: "user", content: inputText }
          ],
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

      const data = await response.json();
      if (data && data.choices && data.choices.length > 0) {
        const modelUsed = data.model || currentModel;
        appendMessage(`Response from ${modelUsed}:`, "system");
        appendMessage(data.choices[0].message.content, "assistant", currentModelIcon);
      } else {
        throw new Error("Unexpected API response structure");
      }
    } catch (error) {
      console.error("Error details:", error);
      appendMessage(error.message, "assistant", currentModelIcon);
    }
  });

  function appendMessage(message, sender, iconSrc = null) {
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
	
    textContainer.textContent = message;
    messageElement.appendChild(textContainer);

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
    codeDisplayElement.className = 'code-display bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6';

    const headerElement = document.createElement('div');
    headerElement.className = 'p-4 bg-gray-700';
    headerElement.innerHTML = `
      <h3 class="text-xl font-semibold text-white mb-2">${title}</h3>
      <p class="text-gray-300">${description}</p>
    `;

    const codeElement = document.createElement('div');
    codeElement.className = 'relative';
    codeElement.innerHTML = `
      <pre class="language-${language}"><code>${escapeHtml(code)}</code></pre>
      <button class="copy-button absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs">
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
});

