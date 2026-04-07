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
    const registerLink = document.getElementById('registerLink');

    let selectedRole = 'employe';

    function getApiUrl(action) {
        if (window.location.protocol === 'file:') {
            throw new Error(
                'Vous avez ouvert la page en file://. Utilisez WAMP et ouvrez: http://localhost/pfe-L3-taher/pfe-L3-main/connexion.html'
            );
        }

        return `api.php?action=${action}`;
    }

    async function postJson(action, payload) {
        const response = await fetch(getApiUrl(action), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        let data = {};

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(`Reponse invalide du serveur: ${text}`);
            }
        }

        if (!response.ok) {
            throw new Error(data.message || `Erreur HTTP ${response.status}`);
        }

        return data;
    }

    function updateButtonText() {
        if (!btnLogin) {
            return;
        }

        const roleText = selectedRole === 'employe' ? 'Employe' : 'Employeur';
        btnLogin.innerHTML = `<span>Se connecter comme ${roleText}</span> <i class="fas fa-arrow-right"></i>`;
    }

    function selectRole(role) {
        selectedRole = role === 'employeur' ? 'employeur' : 'employe';

        if (roleEmploye && roleEmployeur) {
            roleEmploye.classList.toggle('active', selectedRole === 'employe');
            roleEmployeur.classList.toggle('active', selectedRole === 'employeur');
        }

        if (registerLink) {
            registerLink.href = selectedRole === 'employe' ? 'employer.html' : 'employeur.html';
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
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = emailInput?.value.trim();
            const password = passwordInput?.value;

            if (!email || !password) {
                alert('Veuillez remplir tous les champs.');
                return;
            }

            try {
                const data = await postJson('login', { email, password, role: selectedRole });

                if (data.success) {
                    window.location.href = selectedRole === 'employe' ? 'offres.html' : 'candidats.html';
                    return;
                }

                alert(data.message || 'Erreur de connexion.');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'success') {
        alert('Inscription reussie. Vous pouvez maintenant vous connecter.');
    }

    selectRole('employe');
});
