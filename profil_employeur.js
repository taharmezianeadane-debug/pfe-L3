document.addEventListener('DOMContentLoaded', async function () {
    const profileContent = document.getElementById('profileContent');
    const offersContent = document.getElementById('offersContent');
    const messageArea = document.getElementById('messageArea');
    const userInfoSpan = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    // Vérification authentification (employeur)
    async function checkAuth() {
        try {
            const response = await fetch('api.php?action=check_session', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.authenticated || data.role !== 'employeur') {
                window.location.href = 'connexion.html';
                return false;
            }
            userInfoSpan.innerHTML = `<i class="fas fa-building"></i> ${data.user_name || 'Employeur'}`;
            return true;
        } catch (error) {
            window.location.href = 'connexion.html';
            return false;
        }
    }

    // Charger le profil employeur (informations entreprise)
    async function loadProfile() {
        try {
            const response = await fetch('api.php?action=get_employer_profile', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) {
                profileContent.innerHTML = `<div class="empty-message">${data.message || 'Erreur chargement profil'}</div>`;
                return;
            }
            const emp = data.profile;
            profileContent.innerHTML = `
                <div class="info-row">
                    <div class="info-label">Nom de l'entreprise</div>
                    <div class="info-value">${escapeHtml(emp.nom_company)}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Votre nom</div>
                    <div class="info-value">${escapeHtml(emp.nom)}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Poste occupé</div>
                    <div class="info-value">${escapeHtml(emp.poste || 'Non renseigné')}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email professionnel</div>
                    <div class="info-value">${escapeHtml(emp.mail)}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Secteur d'activité</div>
                    <div class="info-value">${escapeHtml(emp.secteur || 'Non renseigné')}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Taille de l'entreprise</div>
                    <div class="info-value">${escapeHtml(emp.taille || 'Non renseignée')}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Siège social</div>
                    <div class="info-value">${escapeHtml(emp.localisation || 'Non renseigné')}</div>
                </div>
            `;
        } catch (error) {
            profileContent.innerHTML = '<div class="empty-message">Erreur réseau</div>';
        }
    }

    // Charger les offres publiées par l'employeur
    async function loadOffers() {
        try {
            const response = await fetch('api.php?action=get_employer_offers', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) {
                offersContent.innerHTML = `<div class="empty-message">${data.message || 'Erreur chargement offres'}</div>`;
                return;
            }
            const offers = data.offers || [];
            if (offers.length === 0) {
                offersContent.innerHTML = '<div class="empty-message">Vous n\'avez publié aucune offre pour le moment.</div>';
                return;
            }
            offersContent.innerHTML = offers.map(offer => `
                <div class="offer-item">
                    <div class="offer-title">${escapeHtml(offer.title)}</div>
                    <div class="offer-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(offer.location || 'Localisation non spécifiée')}</div>
                    <div class="offer-date"><i class="far fa-calendar-alt"></i> Publiée le ${formatDate(offer.created_at)}</div>
                    <div class="offer-candidates"><i class="fas fa-users"></i> ${offer.candidatures_count || 0} candidature(s)</div>
                </div>
            `).join('');
        } catch (error) {
            offersContent.innerHTML = '<div class="empty-message">Erreur réseau</div>';
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Date inconnue';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function showMessage(msg, type) {
        messageArea.textContent = msg;
        messageArea.className = `message-area ${type}`;
        setTimeout(() => {
            messageArea.style.display = 'none';
            messageArea.className = 'message-area';
        }, 4000);
    }

    // Déconnexion
    async function logout() {
        await fetch('api.php?action=logout', { method: 'POST', credentials: 'include' });
        window.location.href = 'connexion.html';
    }

    // Initialisation
    const isAuth = await checkAuth();
    if (isAuth) {
        await loadProfile();
        await loadOffers();
    }

    logoutBtn.addEventListener('click', logout);
});