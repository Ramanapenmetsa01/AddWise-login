document.addEventListener('DOMContentLoaded', () => {
    // Disable browser back button
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
        history.pushState(null, null, document.URL);
    });

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Clear any remaining data
        localStorage.clear();
        // Redirect to login page if not logged in
        window.location.replace('/');
        return;
    }

    // Verify token validity with backend
    fetch('/api/verify-token', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid token');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Token verification failed:', error);
        localStorage.clear();
        window.location.replace('/');
        return;
    });
    
    // Display user name and email if available
    if (user) {
        const userGreeting = document.getElementById('user-greeting');
        if (user.name) {
            userGreeting.textContent = `Welcome, ${user.name}!`;
        } else if (user.email) {
            userGreeting.textContent = `Welcome, ${user.email}!`;
        }
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // Disable the logout button to prevent multiple clicks
                logoutBtn.disabled = true;
                logoutBtn.style.opacity = '0.7';
                logoutBtn.textContent = 'Logging out...';
                
                // Send logout request to server
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Logout failed');
                }
                
                // Clear local storage
                localStorage.clear();
                
                // Force redirect to login page and prevent going back
                window.location.replace('/');
            } catch (error) {
                console.error('Logout error:', error);
                // Re-enable the logout button if there's an error
                logoutBtn.disabled = false;
                logoutBtn.style.opacity = '1';
                logoutBtn.textContent = 'Logout';
                alert('Failed to logout. Please try again.');
            }
        });
    }
});