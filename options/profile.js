const form = document.getElementById('profileForm');
const savedProfile = document.getElementById('savedProfile');
const avatarInput = document.getElementById('avatar');
const avatarPreview = document.getElementById('avatarPreview');

// Load profile
window.onload = () => {
  chrome.storage.local.get('userProfile', ({ userProfile }) => {
    if (userProfile) {
      document.getElementById('fullName').value = userProfile.fullName || '';
      document.getElementById('email').value = userProfile.email || '';
      if (userProfile.avatar) {
        avatarPreview.innerHTML = `<img src="${userProfile.avatar}" width="80" style="border-radius: 50%;" />`;
      }
      renderSavedProfile(userProfile);
    }
  });
};

avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.innerHTML = `<img src="${reader.result}" width="80" style="border-radius: 50%;" />`;
    };
    reader.readAsDataURL(file);
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const avatarImg = avatarPreview.querySelector('img');
  const avatarData = avatarImg ? avatarImg.src : '';

  const profileData = { fullName, email, avatar: avatarData };

  chrome.storage.local.set({ userProfile: profileData }, () => {
    alert('Profile saved!');
    renderSavedProfile(profileData);
  });
});

function renderSavedProfile(profile) {
  savedProfile.innerHTML = `
    <p><strong>Name:</strong> ${profile.fullName}</p>
    <p><strong>Email:</strong> ${profile.email}</p>
    ${profile.avatar ? `<img src="${profile.avatar}" width="80" style="border-radius: 50%;" />` : ''}
  `;
}
