import { initializeFileUpload, detectLanguage } from './fileHandler.js'; 


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
   let uploadedFileName = null;
   
    initializeFileUpload(userInput, appendMessage);
	 initializeTheme();
	

  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      userInput.value += "\n";
    } else if (event.key === "Enter") {
      event.preventDefault();
      sendBtn.click();
    }
  });
  
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
		const language = uploadedFileName ? detectLanguage(uploadedFileName) : 'plaintext';
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

