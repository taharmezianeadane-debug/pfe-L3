// ========================================
// SCRIPT POUR PAGE DE CONNEXION
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    const roleEmploye = document.getElementById('roleEmploye');
    const roleEmployeur = document.getElementById('roleEmployeur');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const btnLogin = document.getElementById('btnLogin');
    const loginMessage = document.getElementById('loginMessage');

    let selectedRole = 'employe';

    // Fonction pour construire l'URL de l'API correctement
    function getApiUrl(action) {
        const baseUrl = window.location.href.split('/').slice(0, -1).join('/');
        const url = baseUrl + '/api.php?action=' + action + '&t=' + Date.now();
        return url;
    }

    function updateButtonText() {
        if (!btnLogin) {
            return;
        }

        const roleText = selectedRole === 'employe' ? 'Candidat' : 'Employeur';
        btnLogin.textContent = `Se connecter comme ${roleText}`;
    }

    function selectRole(role) {
        selectedRole = role === 'employeur' ? 'employeur' : 'employe';

        if (roleEmploye && roleEmployeur) {
            roleEmploye.classList.toggle('active', selectedRole === 'employe');
            roleEmployeur.classList.toggle('active', selectedRole === 'employeur');
        }

        if (loginForm) {
            const roleInput = loginForm.querySelector('input[name="role"][value="' + selectedRole + '"]');
            if (roleInput) {
                roleInput.checked = true;
            }
        }

        updateButtonText();
    }

    if (roleEmploye && roleEmployeur) {
        roleEmploye.addEventListener('click', function () {
            selectRole('employe');
        });

        roleEmployeur.addEventListener('click', function () {
            selectRole('employeur');
        });
    }

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = emailInput?.value.trim();
            const password = passwordInput?.value;

            if (!email || !password) {
                if (loginMessage) {
                    loginMessage.textContent = 'Veuillez remplir tous les champs.';
                    loginMessage.style.display = 'block';
                }
                return;
            }

            // Envoyer via AJAX
            const apiUrl = getApiUrl('login');
            
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: selectedRole
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirection selon le rôle
                    if (selectedRole === 'employeur') {
                        window.location.href = 'dimension_employeur.html';
                    } else {
                        window.location.href = 'dimension_candidat.html';
                    }
                } else {
                    if (loginMessage) {
                        loginMessage.textContent = data.message || 'Erreur de connexion.';
                        loginMessage.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                if (loginMessage) {
                    loginMessage.textContent = 'Erreur de connexion.';
                    loginMessage.style.display = 'block';
                }
            });
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (loginMessage) {
        const error = urlParams.get('error');
        const success = urlParams.get('registered');

        if (error && error !== 'Action non reconnue') {
            loginMessage.textContent = decodeURIComponent(error.replace(/\+/g, ' '));
            loginMessage.style.display = 'block';
        } else if (success === 'success') {
            loginMessage.textContent = 'Inscription réussie. Vous pouvez maintenant vous connecter.';
            loginMessage.style.display = 'block';
            loginMessage.style.background = '#edf7ed';
            loginMessage.style.borderColor = '#a0d5a8';
            loginMessage.style.color = '#22543d';
        }
    }

    selectRole('employe');
});
