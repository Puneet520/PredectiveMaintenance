document.addEventListener('DOMContentLoaded', () => {
  // ===== Global User Management =====
  let currentUser = null;

  function storeUserData(user) {
    currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    updateUI();
  }

  function clearUserData() {
    currentUser = null;
    localStorage.removeItem('user');
    updateUI();
  }

  function loadUserData() {
    const user = localStorage.getItem('user');
    if (user) {
      currentUser = JSON.parse(user);
      updateUI();
    }
  }

  function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const profileImage = document.getElementById('profileImage');
    const userName = document.getElementById('userName');
    const googleSignIn = document.querySelector('.g_id_signin');
    
    if (currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userDropdown) userDropdown.style.display = 'flex';
      if (googleSignIn) googleSignIn.style.display = 'none';
      if (profileImage) {
        if (currentUser.avatar) {
          profileImage.src = currentUser.avatar;
        } else {
          profileImage.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=random';
        }
      }
      if (userName) userName.textContent = currentUser.name;
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (userDropdown) userDropdown.style.display = 'none';
      if (googleSignIn) googleSignIn.style.display = 'block';
    }
  }

  // ===== Google Sign-In Handler =====
  window.handleGoogleSignIn = function(response) {
    try {
      const payload = parseJwt(response.credential);
      console.log('Google payload:', payload);
      
      currentUser = {
        name: payload.name || 'Google User',
        email: payload.email,
        avatar: payload.picture
      };
      
      storeUserData(currentUser);
      showSuccessMessage(`Signed in as ${currentUser.name}`);
      
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Sign-in failed. Please try again.');
    }
  }

  function showSuccessMessage(message) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = message;
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
  }

  // ===== Profile Modal Functions =====
  function showProfileModal() {
    if (!currentUser) {
      alert('Please sign in first');
      return;
    }

    const modal = document.getElementById('profileModal');
    if (modal) {
      const joinDate = new Date(currentUser.joinDate).toLocaleDateString();
      const lastLogin = new Date(currentUser.lastLogin).toLocaleString();

      const modalProfileImage = document.getElementById('modalProfileImage');
      const modalUserName = document.getElementById('modalUserName');
      const modalUserEmail = document.getElementById('modalUserEmail');
      const modalJoinDate = document.getElementById('modalJoinDate');
      const modalLastLogin = document.getElementById('modalLastLogin');

      if (modalProfileImage) modalProfileImage.src = currentUser.avatar;
      if (modalUserName) modalUserName.textContent = currentUser.name;
      if (modalUserEmail) modalUserEmail.textContent = currentUser.email;
      if (modalJoinDate) modalJoinDate.textContent = joinDate;
      if (modalLastLogin) modalLastLogin.textContent = lastLogin;

      modal.classList.add('show');
    }
  }

  function hideProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('show');
  }

  // ===== Email Login Handler =====
  function handleEmailLogin(email, password) {
    currentUser = {
      name: email.split('@')[0],
      email: email,
      avatar: null
    };
    
    storeUserData(currentUser);
    showSuccessMessage(`Signed in as ${currentUser.name}`);
    window.location.href = '/dashboard';
  }

  // ===== Email Login Modal Functions =====
  function showEmailLoginModal() {
    const modal = document.getElementById('emailLoginModal');
    if (modal) modal.classList.add('show');
  }

  function hideEmailLoginModal() {
    const modal = document.getElementById('emailLoginModal');
    if (modal) modal.classList.remove('show');
  }

  // ===== Utility Functions =====
  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  // Initialize
  loadUserData();
  
  // Add event listeners
  document.getElementById('viewProfileBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (currentUser) {
      alert(`Profile Information:\nName: ${currentUser.name}\nEmail: ${currentUser.email}`);
    }
  });
  
  document.getElementById('closeProfileModal')?.addEventListener('click', hideProfileModal);
  
  document.getElementById('signOutBtnModal')?.addEventListener('click', function() {
    signOut();
    hideProfileModal();
  });
  
  document.getElementById('signOutBtn')?.addEventListener('click', signOut);

  document.getElementById('emailLoginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailLoginEmail').value;
    const password = document.getElementById('emailLoginPassword').value;
    handleEmailLogin(email, password);
  });

  document.getElementById('emailLoginBtn')?.addEventListener('click', function() {
    const email = document.getElementById('emailLoginEmail').value;
    const password = document.getElementById('emailLoginPassword').value;
    handleEmailLogin(email, password);
    hideEmailLoginModal();
  });

  document.getElementById('closeEmailLoginModal')?.addEventListener('click', hideEmailLoginModal);

  function signOut() {
    if (window.google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    clearUserData();
    alert('You have been signed out');
    window.location.href = '/';
  }
});