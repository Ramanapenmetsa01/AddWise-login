document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = '/';
        return;
    }
    
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
    logoutBtn.addEventListener('click', () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/';
    });
});