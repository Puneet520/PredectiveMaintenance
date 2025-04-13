// Profile Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const viewProfileBtn = document.getElementById('viewProfileBtn');
  const signOutBtn = document.getElementById('signOutBtn');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');
  
  // Check if elements exist (for safety)
  if (viewProfileBtn && profileModal && closeProfileModal) {
    function openProfileModal(e) {
      e.preventDefault();
      
      // Use the stored user data from Google Sign-In
      const userData = window.userData || {
        name: "John Doe",
        email: "john@example.com",
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscription: "premium"
      };
      
      // Format dates
      const formattedJoinDate = new Date(userData.joinDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const lastLoginDiff = Math.floor((new Date() - new Date(userData.lastLogin)) / (1000 * 60));
      const lastLoginText = lastLoginDiff < 60 ? 
        `${lastLoginDiff} minutes ago` : 
        `${Math.floor(lastLoginDiff / 60)} hours ago`;
      
      // Update modal with real user data
      document.getElementById('modalUserName').textContent = userData.name;
      document.getElementById('modalUserEmail').textContent = userData.email;
      document.getElementById('modalProfileImage').src = userData.profileImage;
      document.getElementById('modalJoinDate').textContent = formattedJoinDate;
      document.getElementById('modalLastLogin').textContent = lastLoginText;
      document.getElementById('modalSubscription').textContent = 
        userData.subscription === 'premium' ? 'Premium' : 'Basic';
      document.getElementById('modalSubscription').className = 
        `detail-value ${userData.subscription}`;
      
      // Show modal
      document.getElementById('profileModal').classList.add('show');
    }

    // Close modal function
    function closeProfileModalFn() {
      profileModal.classList.remove('show');
    }

    // Event listeners
    viewProfileBtn.addEventListener('click', openProfileModal);
    closeProfileModal.addEventListener('click', closeProfileModalFn);
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        closeProfileModalFn();
      }
    });
    
    // Edit profile button
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
      alert('Edit profile functionality would go here');
      closeProfileModalFn();
    });
    
    // Change password button
    document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
      alert('Change password functionality would go here');
      closeProfileModalFn();
    });
  }

  // Sign Out functionality
  if (signOutBtn) {
    signOutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Here you would typically:
      // 1. Call your sign-out API
      // 2. Clear any user tokens/session
      // 3. Redirect to login page
      alert('Signing out... (this would actually sign you out in a real app)');
      console.log('User signed out');
      
      // Example of what you might do:
      // window.location.href = '/login';
    });
  }
});