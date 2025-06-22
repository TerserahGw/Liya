function generateRandomId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function setAuthToken(token) {
    localStorage.setItem('token', token);
}

function removeAuthToken() {
    localStorage.removeItem('token');
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

function setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem('user');
}

function logout() {
    removeAuthToken();
    removeCurrentUser();
    window.location.href = 'auth.html';
}

function apiRequest(url, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    };

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    return fetch(`/api${url}`, options)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Something went wrong');
                });
            }
            return response.json();
        });
}