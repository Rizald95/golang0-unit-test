// Sidebar toggle functionality with improved error handling
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔧 Sidebar toggle script loaded")

  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")
  const content = document.getElementById("content")
  const sidebarOverlay = document.getElementById("sidebarOverlay")

  // Check if elements exist
  if (!sidebar) {
    console.error("❌ Sidebar element not found")
    return
  }

  if (!sidebarToggle) {
    console.error("❌ Sidebar toggle button not found")
    return
  }

  console.log("✅ Sidebar elements found successfully")

  // Load saved sidebar state
  const savedState = localStorage.getItem("sidebarCollapsed")
  const isMobile = window.innerWidth <= 768

  console.log(`📱 Is mobile: ${isMobile}, Saved state: ${savedState}`)

  // Apply initial state
  if (savedState === "true" && !isMobile) {
    sidebar.classList.add("collapsed")
    sidebarToggle.classList.add("collapsed")
    if (content) content.classList.add("sidebar-collapsed")
    sidebarToggle.innerHTML = "▶"
    sidebarToggle.title = "Expand Sidebar"
    console.log("🔄 Applied collapsed state from localStorage")
  } else {
    sidebarToggle.innerHTML = "◀"
    sidebarToggle.title = "Collapse Sidebar"
    console.log("🔄 Applied expanded state")
  }

  // Toggle sidebar function
  function toggleSidebar() {
    console.log("🔄 Toggle sidebar called")
    const isCollapsed = sidebar.classList.contains("collapsed")
    const isMobile = window.innerWidth <= 768

    console.log(`Current state - Collapsed: ${isCollapsed}, Mobile: ${isMobile}`)

    if (isMobile) {
      // Mobile behavior
      const isMobileOpen = sidebar.classList.contains("mobile-open")
      console.log(`Mobile toggle - Currently open: ${isMobileOpen}`)

      sidebar.classList.toggle("mobile-open")
      sidebarToggle.classList.toggle("mobile-open")

      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle("active")
      }

      // Update button for mobile
      if (sidebar.classList.contains("mobile-open")) {
        sidebarToggle.innerHTML = "✕"
        sidebarToggle.title = "Close Menu"
      } else {
        sidebarToggle.innerHTML = "☰"
        sidebarToggle.title = "Open Menu"
      }
    } else {
      // Desktop behavior
      sidebar.classList.toggle("collapsed")
      sidebarToggle.classList.toggle("collapsed")

      if (content) {
        content.classList.toggle("sidebar-collapsed")
      }

      // Update button icon and title
      if (isCollapsed) {
        sidebarToggle.innerHTML = "◀"
        sidebarToggle.title = "Collapse Sidebar"
        localStorage.setItem("sidebarCollapsed", "false")
        console.log("✅ Sidebar expanded")
      } else {
        sidebarToggle.innerHTML = "▶"
        sidebarToggle.title = "Expand Sidebar"
        localStorage.setItem("sidebarCollapsed", "true")
        console.log("✅ Sidebar collapsed")
      }
    }
  }

  // Event listeners with error handling
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log("🖱️ Toggle button clicked")
      toggleSidebar()
    })
    console.log("✅ Toggle button event listener attached")
  }

  // Close sidebar when clicking overlay (mobile)
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        console.log("🖱️ Overlay clicked - closing mobile sidebar")
        sidebar.classList.remove("mobile-open")
        sidebarToggle.classList.remove("mobile-open")
        sidebarOverlay.classList.remove("active")
        sidebarToggle.innerHTML = "☰"
        sidebarToggle.title = "Open Menu"
      }
    })
    console.log("✅ Overlay event listener attached")
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    const isMobile = window.innerWidth <= 768
    console.log(`📱 Window resized - Mobile: ${isMobile}`)

    if (isMobile) {
      // Reset to mobile state
      sidebar.classList.remove("collapsed")
      sidebarToggle.classList.remove("collapsed")
      if (content) content.classList.remove("sidebar-collapsed")
      sidebarToggle.innerHTML = "☰"
      sidebarToggle.title = "Open Menu"
      console.log("🔄 Switched to mobile mode")
    } else {
      // Reset mobile classes
      sidebar.classList.remove("mobile-open")
      sidebarToggle.classList.remove("mobile-open")
      if (sidebarOverlay) sidebarOverlay.classList.remove("active")

      // Restore desktop state
      const savedState = localStorage.getItem("sidebarCollapsed")
      if (savedState === "true") {
        sidebar.classList.add("collapsed")
        sidebarToggle.classList.add("collapsed")
        if (content) content.classList.add("sidebar-collapsed")
        sidebarToggle.innerHTML = "▶"
        sidebarToggle.title = "Expand Sidebar"
      } else {
        sidebarToggle.innerHTML = "◀"
        sidebarToggle.title = "Collapse Sidebar"
      }
      console.log("🔄 Switched to desktop mode")
    }
  })

  // Keyboard shortcut (Ctrl + B)
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "b") {
      e.preventDefault()
      console.log("⌨️ Keyboard shortcut triggered")
      toggleSidebar()
    }
  })

  // Add hover effect for collapsed sidebar items
  if (sidebar) {
    const navLinks = sidebar.querySelectorAll(".nav a")
    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        if (sidebar.classList.contains("collapsed") && window.innerWidth > 768) {
          // Tooltip is handled by CSS
        }
      })
    })
    console.log(`✅ Added hover effects to ${navLinks.length} navigation links`)
  }

  console.log("🎉 Sidebar toggle initialization complete")
})
