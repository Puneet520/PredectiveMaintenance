// ===== Enhanced Google Sign-In Handler =====
function handleGoogleSignIn(response) {
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  
  // Store user data
  const userData = {
    name: payload.name,
    email: payload.email,
    avatar: payload.picture
  };
  localStorage.setItem('user', JSON.stringify(userData));

  // Update UI
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('userDropdown').style.display = 'flex';
  document.getElementById('profileImage').src = payload.picture;
  document.getElementById('userName').textContent = payload.name;
  document.getElementById('loginModal').classList.remove('show');

  // Optional: Send to backend
  fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: response.credential })
  })
  .then(response => response.json())
  .then(console.log)
  .catch(console.error);
}

// ===== New Profile/Signout Functions =====
document.getElementById('viewProfileBtn')?.addEventListener('click', function(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user'));
  alert(`User Profile:\nName: ${user.name}\nEmail: ${user.email}`);
});

document.getElementById('signOutBtn')?.addEventListener('click', function() {
  localStorage.removeItem('user');
  document.getElementById('userDropdown').style.display = 'none';
  document.getElementById('loginBtn').style.display = 'block';
  
  // Google Sign-Out
  if (window.google?.accounts?.id) {
    google.accounts.id.disableAutoSelect();
  }
  
  alert('You have been signed out');
});

// ===== Updated Load Event =====
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Google Sign-In
  function initializeGoogleSignIn() {
    // Check if Google Sign-In is available
    if (window.google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: "925137040302-hs4q9o8s74042ja24u420bq1qboaee5q.apps.googleusercontent.com",
        callback: handleGoogleSignIn
      });
      
      // Render the button
      google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        { 
          theme: "outline", 
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "sign_in_with",
          logo_alignment: "left"
        }
      );
    } else {
      console.error('Google Sign-In not available');
    }
  }

  // Initialize the application
  function initializeApp() {
    // Initialize Google Sign-In
    initializeGoogleSignIn();

    // Add other initialization code here
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const emailModal = document.getElementById('emailLoginModal');
        if (emailModal) {
          emailModal.classList.add('show');
        }
      });
    }

    // Add email login form handler
    const emailLoginForm = document.getElementById('emailLoginForm');
    if (emailLoginForm) {
      emailLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('emailLoginEmail')?.value;
        const password = document.getElementById('emailLoginPassword')?.value;
        if (email && password) {
          handleEmailLogin(email, password);
        }
      });
    }

    // Add close modal handlers
    const closeEmailModal = document.getElementById('closeEmailLoginModal');
    if (closeEmailModal) {
      closeEmailModal.addEventListener('click', () => {
        const emailModal = document.getElementById('emailLoginModal');
        if (emailModal) {
          emailModal.classList.remove('show');
        }
      });
    }

    // Add profile button handlers
    const viewProfileBtn = document.getElementById('viewProfileBtn');
    if (viewProfileBtn) {
      viewProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
          alert(`Profile Information:\nName: ${currentUser.name}\nEmail: ${currentUser.email}`);
        }
      });
    }

    // Add sign out handlers
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        if (window.google?.accounts?.id) {
          google.accounts.id.disableAutoSelect();
        }
        clearUserData();
        alert('You have been signed out');
        window.location.href = '/';
      });
    }
  }

  // Start the application
  initializeApp();
});