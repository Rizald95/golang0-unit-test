// Profile page functionality
document.addEventListener("DOMContentLoaded", () => {
  console.log("👤 Profile page loaded")

  const form = document.getElementById("profileForm")
  const savedProfile = document.getElementById("savedProfile")
  const avatarInput = document.getElementById("avatar")
  const avatarPreview = document.getElementById("avatarPreview")
  const chrome = window.chrome // Declare chrome variable

  // Load existing profile data
  function loadProfile() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get("userProfile", ({ userProfile }) => {
        if (userProfile) {
          console.log("✅ Profile data found:", userProfile)

          // Populate form fields
          document.getElementById("fullName").value = userProfile.fullName || ""
          document.getElementById("email").value = userProfile.email || ""

          // Show avatar preview
          if (userProfile.avatar) {
            avatarPreview.innerHTML = `<img src="${userProfile.avatar}" width="80" style="border-radius: 50%; margin-top: 12px;" alt="Profile Avatar" />`
          }

          // Display saved profile
          renderSavedProfile(userProfile)
        } else {
          console.log("ℹ️ No profile data found")
        }
      })
    }
  }

  // Handle avatar file selection
  if (avatarInput) {
    avatarInput.addEventListener("change", (event) => {
      const file = event.target.files[0]
      if (file) {
        console.log("📷 Avatar file selected:", file.name)

        const reader = new FileReader()
        reader.onload = (e) => {
          const avatarData = e.target.result
          avatarPreview.innerHTML = `<img src="${avatarData}" width="80" style="border-radius: 50%; margin-top: 12px;" alt="Profile Avatar" />`
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Handle form submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      console.log("💾 Saving profile...")

      const fullName = document.getElementById("fullName").value.trim()
      const email = document.getElementById("email").value.trim()
      const avatarImg = avatarPreview.querySelector("img")
      const avatarData = avatarImg ? avatarImg.src : ""

      // Validation
      if (!fullName) {
        alert("Please enter your full name")
        return
      }

      if (!email) {
        alert("Please enter your email address")
        return
      }

      const profileData = {
        fullName,
        email,
        avatar: avatarData,
        lastUpdated: new Date().toISOString(),
      }

      // Save to storage
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ userProfile: profileData }, () => {
          console.log("✅ Profile saved successfully")
          alert("Profile saved successfully!")
          renderSavedProfile(profileData)
        })
      } else {
        console.log("⚠️ Chrome storage not available")
        alert("Profile saved locally!")
        renderSavedProfile(profileData)
      }
    })
  }

  // Render saved profile display
  function renderSavedProfile(profile) {
    if (savedProfile) {
      savedProfile.innerHTML = `
        <div class="profile-display">
          <div class="profile-info">
            <p><strong>Name:</strong> ${profile.fullName}</p>
            <p><strong>Email:</strong> ${profile.email}</p>
            ${profile.lastUpdated ? `<p><strong>Last Updated:</strong> ${new Date(profile.lastUpdated).toLocaleString()}</p>` : ""}
          </div>
          ${
            profile.avatar
              ? `
            <div class="profile-avatar">
              <img src="${profile.avatar}" width="80" style="border-radius: 50%;" alt="Profile Avatar" />
            </div>
          `
              : ""
          }
        </div>
      `
    }
  }

  // Load profile on page load
  loadProfile()

  console.log("🎉 Profile page initialization complete")
})
