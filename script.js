function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

function saveLocalUser(user) {
    const users = JSON.parse(localStorage.getItem('tourUsers') || '[]');
    if (!users.find(u => u.email === user.email)) {
        users.push(user);
        localStorage.setItem('tourUsers', JSON.stringify(users));
    }
}

function findLocalUser(email, password) {
    const users = JSON.parse(localStorage.getItem('tourUsers') || '[]');
    return users.find(u => u.email === email && u.password === password);
}

// Google Apps Script URL
const API_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('message');

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    body: JSON.stringify({ email, phone, password }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error(`Server returned ${response.status}`);

                const result = await response.json();
                if (messageEl) messageEl.textContent = result.message || 'Login attempt completed.';

                if (result.success) {
                    alert('Login successful!');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.warn('Login remote request failed, using local fallback:', error);
                const localUser = findLocalUser(email, password);
                if (localUser) {
                    if (messageEl) messageEl.textContent = 'Login successful (local). Redirecting...';
                    alert('Login successful!');
                    window.location.href = 'index.html';
                } else {
                    if (messageEl) messageEl.textContent = 'Login failed (local), user not found or wrong password.';
                }
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('message');

            try {
                const response = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    body: JSON.stringify({ name, email, phone, password }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error(`Server returned ${response.status}`);

                const result = await response.json();
                if (messageEl) messageEl.textContent = result.message || 'Signup response received.';

                if (result.success) {
                    saveLocalUser({ name, email, phone, password });
                    setTimeout(() => { window.location.href = 'login.html'; }, 800);
                }
            } catch (error) {
                console.warn('Signup remote request failed, using local fallback:', error);
                saveLocalUser({ name, email, phone, password });
                if (messageEl) {
                    messageEl.textContent = 'Signup saved locally (no server). Now go to login.';
                }
                setTimeout(() => { window.location.href = 'login.html'; }, 800);
            }
        });
    }

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const destination = document.getElementById('destination').value;
            const date = document.getElementById('date').value;
            const guests = document.getElementById('guests').value;

            try {
                const response = await fetch(`${API_URL}/book`, {
                    method: 'POST',
                    body: JSON.stringify({ destination, date, guests }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error(`Server returned ${response.status}`);

                const result = await response.json();
                if (result.success) {
                    alert('Booking confirmed!');
                } else {
                    alert('Booking failed: ' + result.message);
                }
            } catch (error) {
                console.warn('Booking request failed:', error);
                alert('Booking failed, please try again.');
            }
        });
    }

    // Add fade-in animation to sections on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Filter functionality for destinations
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Placeholder: In a real app, filter cards based on category
            alert('Filtering to ' + btn.textContent);
        });
    });

    // Progress step simulation for booking
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (currentStep < steps.length - 1) {
                steps[currentStep].classList.remove('active');
                currentStep++;
                steps[currentStep].classList.add('active');
            } else {
                alert('Booking confirmed!');
            }
        });
    }
});
