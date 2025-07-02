// Quick actions JavaScript for options pages
document.addEventListener("DOMContentLoaded", () => {
  // Handle action buttons
  const actionButtons = document.querySelectorAll(".action-button")

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Close current window and return to main extension
      if (window.close) {
        window.close()
      } else {
        // Fallback: try to navigate back to extension
        try {
          window.history.back()
        } catch (e) {
          console.log("Cannot navigate back")
        }
      }
    })
  })
})
