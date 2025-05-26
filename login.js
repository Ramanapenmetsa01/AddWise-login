// Cloud animation
const clouds = document.querySelectorAll('.cloud');
const speeds = [0.27, 0.2, 0.25, 0.22, 0.26];
const cloudData = [];

clouds.forEach((cloud, index) => {
  const style = window.getComputedStyle(cloud);
  const left = parseFloat(style.left);
  let top;
  if (style.bottom !== 'auto') {
    const bottom = parseFloat(style.bottom);
    top = window.innerHeight - cloud.offsetHeight - bottom;
  } else {
    top = parseFloat(style.top);
  }
  cloudData.push({
    el: cloud,
    left,
    top,
    speed: speeds[index],
    width: cloud.offsetWidth,
  });
  cloud.style.left = left + 'px';
  cloud.style.top = top + 'px';
});

function animate() {
  cloudData.forEach(cloud => {
    cloud.left += cloud.speed;
    if (cloud.left > window.innerWidth) {
      cloud.left = -cloud.width;
    }
    cloud.el.style.left = cloud.left + 'px';
    cloud.el.style.top = cloud.top + 'px';
  });
  requestAnimationFrame(animate);
}
animate();

// Define showNotification function before DOMContentLoaded
function showNotification(message, isSuccess = true, isDayMode = true) {
  // Remove any existing notification
  const existingNotification = document.querySelector('.notification-bar');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification-bar';
  
  // Set colors based on day/night mode and success/error
  if (isDayMode) {
    // Day mode colors
    notification.style.backgroundColor = isSuccess ? 'rgba(46, 125, 50, 0.9)' : 'rgba(198, 40, 40, 0.9)';
    notification.style.color = '#fff';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  } else {
    // Night mode colors
    notification.style.backgroundColor = isSuccess ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)';
    notification.style.color = '#fff';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
  }
  
  notification.textContent = message;
  
  // Style the notification
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '1000';
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'transform 0.3s ease-out';
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 4000);
}

document.addEventListener('DOMContentLoaded', function() {
  // First fetch the Google Client ID from server
  fetch('/api/google-client-id')
    .then(response => response.json())
    .then(data => {
      if (!data.clientId) {
        console.error('Google Client ID not found');
        return;
      }
      
      // Initialize Google Sign-In with the fetched client ID
      google.accounts.id.initialize({
        client_id: data.clientId,
        callback: handleGoogleSignIn
      });

      // Render Google Sign-In button with colorful theme
      google.accounts.id.renderButton(
        document.querySelector('.g_id_signin'),
        { 
          theme: 'filled_blue',  // Changed from 'outline' to 'filled_blue' for color
          size: 'large',
          type: 'standard',
          shape: 'pill',         // Changed to pill shape for modern look
          text: 'continue_with', // Shows "Continue with Google"
          width: 220,           // Slightly wider for better appearance
          logo_alignment: 'left'
        }
      );
    })
    .catch(error => {
      console.error('Error fetching Google Client ID:', error);
      showNotification('Error initializing Google Sign-In', false, true);
    });

  // Cloud animation code can stay outside if needed
  
  // Form switching - redefine these inside DOMContentLoaded
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignupLink = document.getElementById('show-signup');
  const showLoginLink = document.getElementById('show-login');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');
  const forgotPasswordLink = document.getElementById('forgot-password');
  const forgotEmailContainer = document.getElementById('forgot-email-container');
  const otpVerificationContainer = document.getElementById('otp-verification-container');
  const forgotEmailForm = document.getElementById('forgot-email-form');
  const otpVerificationForm = document.getElementById('otp-verification-form');
  const backToLoginBtns = document.querySelectorAll('.back-to-login');
  const dayBg = document.querySelector('.day-background');
  const nightBg = document.querySelector('.night-background');
  
  // Debug to check if elements are found
  console.log('Login form:', loginForm);
  console.log('Signup form:', signupForm);
  console.log('Show signup link:', showSignupLink);
  console.log('Show login link:', showLoginLink);
  console.log('Forgot password link:', forgotPasswordLink);
  
  // Helper function to show only one container
  function showOnly(containerToShow) {
    // Hide all auth containers
    [loginForm, signupForm, forgotEmailContainer, otpVerificationContainer].forEach(c => {
      if (c) c.style.display = 'none';
    });
    // Show the specified one
    if (containerToShow) containerToShow.style.display = 'block';
  }
  
  // Form switching event listeners
  if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Show signup clicked');
      showOnly(signupForm);
      
      // Update background
      dayBg.style.opacity = '0';
      nightBg.style.opacity = '1';
      nightBg.style.pointerEvents = 'auto';
      dayBg.style.pointerEvents = 'none';
    });
  }
  
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Show login clicked');
      showOnly(loginForm);
      
      // Update background
      dayBg.style.opacity = '1';
      nightBg.style.opacity = '0';
      dayBg.style.pointerEvents = 'auto';
      nightBg.style.pointerEvents = 'none';
    });
  }
  
  // Login form handler
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Login form submitted');

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-pass').value;
      const loginError = document.getElementById('login-error');

      // Reset error message
      if (loginError) loginError.style.display = 'none';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
          if (loginError) {
            loginError.textContent = data.message || 'Invalid credentials';
            loginError.style.display = 'block';
          }
          showNotification(data.message || 'Invalid credentials', false, true);
          return;
        }

        // Show success notification
        showNotification(`Welcome back, ${data.user.name}!`, true, true);

        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect after a short delay
        setTimeout(() => {
          console.log('Redirecting to dashboard');
          window.location.href = '/dashboard';
        }, 1000);

      } catch (error) {
        console.error('Login error:', error);
        if (loginError) {
          loginError.textContent = 'Server error. Please try again later.';
          loginError.style.display = 'block';
        }
        showNotification('An error occurred during login', false, true);
      }
    });
  }

  // Forgot password handling
  if (forgotPasswordLink) {
    // Handle forgot password link click
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Hide the main login container completely
      document.querySelector('.login-container:not(#forgot-email-container):not(#otp-verification-container)').style.display = 'none';
      
      // Show the forgot password container
      forgotEmailContainer.style.display = 'block';
      loginError.style.display = 'none';
      
      // Set appropriate background
      dayBg.style.opacity = '1';
      nightBg.style.opacity = '0';
      dayBg.style.pointerEvents = 'auto';
      nightBg.style.pointerEvents = 'none';
    });
    
    // Handle back to login buttons
    backToLoginBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Hide the forgot password containers
        forgotEmailContainer.style.display = 'none';
        otpVerificationContainer.style.display = 'none';
        
        // Show the main login container again
        document.querySelector('.login-container:not(#forgot-email-container):not(#otp-verification-container)').style.display = 'block';
        loginForm.style.display = 'block';
      });
    });
  }
  
  // Handle back to login buttons
  if (backToLoginBtns) {
    backToLoginBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Back to login clicked');
        showOnly(loginForm);
        
        // Set appropriate background
        dayBg.style.opacity = '1';
        nightBg.style.opacity = '0';
        dayBg.style.pointerEvents = 'auto';
        nightBg.style.pointerEvents = 'none';
      });
    });
  }
  
  // Make the Google Sign-In handler available globally
  window.handleGoogleSignIn = function(response) {
    console.log('Google Sign-In response received:');
    
    if (!response || !response.credential) {
      console.error('Invalid Google Sign-In response');
      showNotification('Google login failed: Invalid response', false, true);
      return;
    }
    
    const credential = response.credential;
    
    // Show a notification that we're processing the login
    showNotification('Processing your Google login...', true, true);
    
    // Send the token to your server
    fetch('/api/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: credential })
    })
    .then(response => {
      console.log('Server response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Server response data:', data);
      
      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success notification
        showNotification(`Welcome, ${data.user.name}!`, true, true);
        
        console.log('Redirecting to dashboard in 1 second...');
        
        // Redirect after a short delay
        setTimeout(() => {
          console.log('Executing redirect now');
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        showNotification('Google login failed: ' + (data.message || 'Unknown error'), false, true);
      }
    })
    .catch(error => {
      console.error('Error processing Google login:', error);
      showNotification('An error occurred during Google login', false, true);
    });
  };

  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Signup form submitted');
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-pass').value;
      
      console.log('Signup data:', { name, email, password: '***' });
      
      // Reset error message
      const signupError = document.getElementById('signup-error');
      if (signupError) signupError.style.display = 'none';
      
      try {
        console.log('Sending signup request to server...');
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });
        
        console.log('Server response status:', response.status);
        const data = await response.json();
        console.log('Signup response:', data);
        
        if (!response.ok) {
          if (signupError) {
            signupError.textContent = data.message || 'Signup failed';
            signupError.style.display = 'block';
          }
          showNotification(data.message || 'Signup failed', false, false);
          return;
        }
        
        // Show success notification
        showNotification('Account created successfully! Please login to continue.', true, false);
        
        // Clear the form
        document.getElementById('name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-pass').value = '';
        
        // Switch to login form after 2 seconds
        setTimeout(() => {
          showLoginLink.click(); // This will trigger the login form display
        }, 2000);
        
      } catch (error) {
        console.error('Signup error:', error);
        if (signupError) {
          signupError.textContent = 'Server error. Please try again later.';
          signupError.style.display = 'block';
        }
        showNotification('Server error. Please try again later.', false, false);
      }
    });
  }

  // Handle forgot email form submission
  // Handle forgot email form submission
  forgotEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    const emailInput = document.getElementById('forgot-email');
    const emailError = document.getElementById('forgot-email-error');
    
    // Reset any previous error styling
    emailInput.style.borderBottomColor = '';
    emailError.style.display = 'none';
    
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        emailError.textContent = data.message || 'Email not found';
        emailError.style.display = 'block';
        emailInput.style.borderBottomColor = '#f44336';
        showNotification(data.message || 'Email not found', false, true);
        return;
      }
      
      // Show success notification with OTP for development
      if (data.devNote) {
        showNotification(`OTP sent to your email! ${data.devNote}`, true, true);
      } else {
        showNotification('OTP sent to your email!', true, true);
      }
      
      // Switch to OTP verification
      forgotEmailContainer.style.display = 'none';
      
      // Make sure the main login container remains hidden
      document.querySelector('.login-container:not(#forgot-email-container):not(#otp-verification-container)').style.display = 'none';
      
      // Show the OTP verification container
      otpVerificationContainer.style.display = 'block';
      
      // Store email for OTP verification
      localStorage.setItem('resetEmail', email);
      
    } catch (error) {
      console.error('Error:', error);
      emailError.textContent = 'An error occurred. Please try again.';
      emailError.style.display = 'block';
      emailInput.style.borderBottomColor = '#f44336';
      showNotification('An error occurred. Please try again.', false, true);
    }
  });

  // Handle OTP verification form submission
  if (otpVerificationForm) {
    otpVerificationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const otp = document.getElementById('otp-input').value;
      const newPassword = document.getElementById('new-password').value;
      const otpInput = document.getElementById('otp-input');
      const passwordInput = document.getElementById('new-password');
      const otpError = document.getElementById('otp-error');
      
      // Reset any previous error styling
      otpInput.style.borderBottomColor = '';
      passwordInput.style.borderBottomColor = '';
      otpError.style.display = 'none';
      
      // Get email from localStorage
      const email = localStorage.getItem('resetEmail');
      
      if (!email) {
        otpError.textContent = 'Session expired. Please try again.';
        otpError.style.display = 'block';
        showNotification('Session expired. Please try again.', false, true);
        return;
      }
      
      try {
        const response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, otp, newPassword })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          otpError.textContent = data.message || 'Invalid OTP';
          otpError.style.display = 'block';
          otpInput.style.borderBottomColor = '#f44336';
          showNotification(data.message || 'Invalid OTP', false, true);
          return;
        }
        
        // Show success notification
        showNotification('Password reset successful!', true, true);
        
        // Clear localStorage
        localStorage.removeItem('resetEmail');
        
        // Switch back to login after 1 second
        setTimeout(() => {
          otpVerificationContainer.style.display = 'none';
          
          // Show the main login container
          document.querySelector('.login-container:not(#forgot-email-container):not(#otp-verification-container)').style.display = 'block';
          loginForm.style.display = 'block';
        }, 1000);
        
      } catch (error) {
        console.error('Error:', error);
        otpError.textContent = 'An error occurred. Please try again.';
        otpError.style.display = 'block';
        otpInput.style.borderBottomColor = '#f44336';
        showNotification('An error occurred. Please try again.', false, true);
      }
    });
  }
});
