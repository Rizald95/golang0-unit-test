function initializeFileUpload(userInput, appendMessage) {
  const fileUploadButton = document.getElementById("file-upload-button");
  const fileUploadInput = document.getElementById("file-upload");

  fileUploadButton.addEventListener("click", () => {
    fileUploadInput.click();
  });

  fileUploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        userInput.value = fileContent;
        appendMessage(`File "${file.name}" uploaded and content loaded.`, "system");
      };
      reader.readAsText(file);
    }
  });
}

function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function detectLanguage(filename) {
  const extension = getFileExtension(filename).toLowerCase();
  const languageMap = {
    'go': 'go',
    'js': 'javascript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'cs': 'csharp',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'ts': 'typescript',
    'rs': 'rust',
    'scala': 'scala',
    'hs': 'haskell',
    'lua': 'lua',
    'pl': 'perl',
    'sh': 'bash',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'md': 'markdown',
    'txt': 'plaintext'
  };
  return languageMap[extension] || 'plaintext';
}

export { initializeFileUpload, detectLanguage };