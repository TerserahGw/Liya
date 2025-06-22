document.addEventListener('DOMContentLoaded', () => {
    const authSwitches = document.querySelectorAll('.auth-switch');
    const authForms = document.querySelectorAll('.auth-form');
    
    authSwitches.forEach(switchBtn => {
        switchBtn.addEventListener('click', () => {
            const tab = switchBtn.getAttribute('data-tab');
        
            authSwitches.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
        
            switchBtn.classList.add('active');
            document.querySelector(`.auth-form[data-tab="${tab}"]`).classList.add('active');
        });
    });

    const showPasswordBtns = document.querySelectorAll('.show-password');
    showPasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            apiRequest('/auth/login', 'POST', { username, password })
                .then(data => {
                    setAuthToken(data.token);
                    setCurrentUser(data.data.user);
                    window.location.href = 'friends.html';
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match');
                return;
            }
            
            apiRequest('/auth/register', 'POST', { username, password })
                .then(data => {
                    setAuthToken(data.token);
                    setCurrentUser(data.data.user);
                    window.location.href = 'friends.html';
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }
});