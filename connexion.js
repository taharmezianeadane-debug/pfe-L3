// ========================================
// SCRIPT POUR PAGE DE CONNEXION
// ========================================

document.addEventListener('DOMContentLoaded', function () {
<<<<<<< HEAD
=======

    // ==================== ÉLÉMENTS DU DOM ====================
>>>>>>> ca0e8c04de280631265df0e99a1c462b2e1a3d54
    const roleEmploye = document.getElementById('roleEmploye');
    const roleEmployeur = document.getElementById('roleEmployeur');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const btnLogin = document.getElementById('btnLogin');
<<<<<<< HEAD
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

=======

    // ==================== VARIABLES ====================
    let selectedRole = 'employe'; // 'employe' ou 'employeur'

    // ==================== GESTION DU SÉLECTEUR DE RÔLE ====================
    if (roleEmploye && roleEmployeur) {
        roleEmploye.addEventListener('click', function () {
            roleEmploye.classList.add('active');
            roleEmployeur.classList.remove('active');
            selectedRole = 'employe';
            updateButtonText();
        });

        roleEmployeur.addEventListener('click', function () {
            roleEmployeur.classList.add('active');
            roleEmploye.classList.remove('active');
            selectedRole = 'employeur';
            updateButtonText();
        });
    }

    // ==================== METTRE À JOUR LE TEXTE DU BOUTON ====================
    function updateButtonText() {
        if (btnLogin) {
            const roleText = selectedRole === 'employe' ? 'Employé' : 'Employeur';
            btnLogin.innerHTML = `<span>Se connecter comme ${roleText}</span> <i class="fas fa-arrow-right"></i>`;
        }
    }

    // ==================== AFFICHER/MASQUER MOT DE PASSE ====================
>>>>>>> ca0e8c04de280631265df0e99a1c462b2e1a3d54
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
<<<<<<< HEAD
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
=======
        });
    }

    // ==================== SOUMISSION FORMULAIRE ====================
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            try {
                const response = await fetch('api.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role: selectedRole })
                });
                const data = await response.json();

                if (data.success) {
                    alert('Connexion réussie!');
                    window.location.href = selectedRole === 'employe' ? 'offres.html' : 'publier-offre.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Erreur: ' + error.message);
            }
        });
    }

    // ==================== STYLES D'ANIMATION ====================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // ==================== INITIALISATION ====================
    updateButtonText();

    // Vérifier si l'utilisateur vient de s'inscrire (optionnel)
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get('registered');
    if (registered === 'success') {
        showNotification('Inscription réussie ! Vous pouvez maintenant vous connecter', 'success');
    }
});
>>>>>>> ca0e8c04de280631265df0e99a1c462b2e1a3d54
