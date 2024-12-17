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

    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
});

