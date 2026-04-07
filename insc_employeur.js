// ========================================
// SCRIPT SIMPLE POUR INSCRIPTION EMPLOYEUR
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('employeurForm');

    function getApiUrl(action) {
        if (window.location.protocol === 'file:') {
            throw new Error(
                'Vous avez ouvert la page en file://. Utilisez WAMP et ouvrez: http://localhost/pfe-L3-taher/pfe-L3-main/employeur.html'
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

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email')?.value?.trim();
            const nomEntreprise = document.getElementById('nomEntreprise')?.value?.trim();
            const nomComplet = document.getElementById('nomComplet')?.value?.trim();
            const poste = document.getElementById('poste')?.value?.trim() || '';
            const secteur = document.getElementById('secteur')?.value || '';
            const taille = document.getElementById('taille')?.value || '';
            const localisation = document.getElementById('localisation')?.value?.trim() || '';
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            const acceptTerms = document.getElementById('acceptTerms')?.checked;

            if (!email || !nomEntreprise) {
                alert('Veuillez remplir Email et Nom entreprise.');
                return;
            }

            if (!password || !confirmPassword) {
                alert('Veuillez remplir les champs de mot de passe.');
                return;
            }

            if (password.length < 6) {
                alert('Le mot de passe doit contenir au moins 6 caracteres.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas.');
                return;
            }

            if (!acceptTerms) {
                alert('Veuillez accepter les conditions generales.');
                return;
            }

            try {
                const data = await postJson('register', {
                    email,
                    password,
                    role: 'employeur',
                    name: nomComplet || 'N/A',
                    company: nomEntreprise,
                    poste,
                    secteur,
                    taille,
                    localisation,
                    profile_summary: ''
                });

                if (data.success) {
                    window.location.href = 'connexion.html?registered=success';
                    return;
                }

                alert(data.message || 'Erreur inconnue.');
            } catch (error) {
                alert(error.message);
            }
        });
    }

});
