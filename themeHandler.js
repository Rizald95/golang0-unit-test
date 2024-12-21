// Theme handling functionality
export function initializeTheme() {
  const body = document.body;
  const themeToggleButton = document.querySelector('.theme-toggle-button');
  
  // Get saved theme or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light-mode';
  body.classList.add(savedTheme);
  updateThemeIcon(savedTheme === 'light-mode');

  // Theme toggle handler
  themeToggleButton.addEventListener('click', () => {
    const isLightMode = body.classList.contains('light-mode');
    
    body.classList.remove(isLightMode ? 'light-mode' : 'dark-mode');
    body.classList.add(isLightMode ? 'dark-mode' : 'light-mode');
    
    localStorage.setItem('theme', isLightMode ? 'dark-mode' : 'light-mode');
    updateThemeIcon(!isLightMode);
  });
}

function updateThemeIcon(isLightMode) {
  const themeToggleButton = document.querySelector('.theme-toggle-button span');
  themeToggleButton.textContent = isLightMode ? '🌙' : '☀️';
  themeToggleButton.parentElement.title = `Switch to ${isLightMode ? 'Dark' : 'Light'} Mode`;
}

