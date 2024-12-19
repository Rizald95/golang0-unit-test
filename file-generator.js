document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('back-button');
  const saveButton = document.getElementById('save-button');
  const codeInput = document.getElementById('code-input');
  const notification = document.getElementById('notification');

  backButton.addEventListener('click', () => {
    window.location.href = 'popup.html';
  });

  saveButton.addEventListener('click', () => {
    const code = codeInput.value;
    if (code.trim() === '') {
      alert('Please enter some code before saving.');
      return;
    }

    const blob = new Blob([code], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: 'generated_file.txt',
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        showNotification();
      }
      URL.revokeObjectURL(url);
    });
  });

  function showNotification() {
    notification.classList.remove('hidden');
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
});