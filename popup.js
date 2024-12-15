const apiKey = "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"; // API KEY Groq
const apiURL = "https://api.groq.com/v1/chat/completions";

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("input-message");
  const chatbox = document.getElementById("chatbox");

  sendBtn.addEventListener("click", async () => {
    const inputText = userInput.value;
    const model = "mixtral-8x7b-32768"; // Model Groq default

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
          model: model,
          messages: [{ role: "user", content: inputText }],
        }),
      });

      const data = await response.json();
      if (data && data.choices) {
        appendMessage(data.choices[0].message.content, "assistant");
      } else {
        appendMessage("Empty response. Check your input or API key.", "assistant");
      }
    } catch (error) {
      appendMessage("An error occurred. Please try again.", "assistant");
      console.error(error);
    }
  });

  function appendMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = message;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
});
