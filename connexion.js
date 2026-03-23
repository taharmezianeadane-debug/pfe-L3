// ========================================
// SCRIPT POUR PAGE DE CONNEXION
// ========================================

document.addEventListener('DOMContentLoaded', function () {

    // ==================== ÉLÉMENTS DU DOM ====================
    const roleEmploye = document.getElementById('roleEmploye');
    const roleEmployeur = document.getElementById('roleEmployeur');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const btnLogin = document.getElementById('btnLogin');

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
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
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