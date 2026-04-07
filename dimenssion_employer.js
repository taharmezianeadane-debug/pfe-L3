// ========================================
// ESPACE EMPLOYÉ - AFFICHAGE DES OFFRES ET POSTULATION
// ========================================

document.addEventListener('DOMContentLoaded', async function () {
    // Éléments DOM
    const offersContainer = document.getElementById('offersContainer');
    const messageArea = document.getElementById('messageArea');
    const userInfoSpan = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    // Vérifier si l'utilisateur est connecté (rôle employé)
    async function checkAuth() {
        try {
            const response = await fetch('api.php?action=check_session', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.authenticated || data.role !== 'employe') {
                // Non authentifié ou mauvais rôle -> redirection vers connexion
                window.location.href = 'connexion.html';
                return false;
            }
            // Afficher le nom de l'utilisateur
            if (data.user_name) {
                userInfoSpan.innerHTML = `<i class="fas fa-user-circle"></i> ${data.user_name}`;
            }
            return true;
        } catch (error) {
            console.error('Erreur auth:', error);
            window.location.href = 'connexion.html';
            return false;
        }
    }

    // Récupérer toutes les offres d'emploi
    async function loadOffers() {
        try {
            const response = await fetch('api.php?action=get_offers', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (!data.success) {
                showMessage(data.message || 'Erreur chargement des offres', 'error');
                offersContainer.innerHTML = '<div class="empty-message">Aucune offre disponible pour le moment.</div>';
                return;
            }

            const offers = data.offers || [];
            if (offers.length === 0) {
                offersContainer.innerHTML = '<div class="empty-message">Aucune offre disponible pour le moment.</div>';
                return;
            }

            // Récupérer la liste des offres auxquelles l'utilisateur a déjà postulé
            const appliedResponse = await fetch('api.php?action=get_applied_offers', {
                method: 'GET',
                credentials: 'include'
            });
            const appliedData = await appliedResponse.json();
            const appliedIds = appliedData.applied_offers || [];

            // Afficher les cartes
            offersContainer.innerHTML = offers.map(offer => {
                const isApplied = appliedIds.includes(offer.id);
                return `
                    <div class="offer-card" data-offer-id="${offer.id}">
                        <div class="offer-title">${escapeHtml(offer.title)}</div>
                        <div class="offer-company"><i class="fas fa-building"></i> ${escapeHtml(offer.company_name || 'Entreprise')}</div>
                        <div class="offer-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(offer.location || 'Non spécifiée')}</div>
                        <div class="offer-description">${escapeHtml(offer.description || 'Aucune description')}</div>
                        <div class="offer-date"><i class="far fa-calendar-alt"></i> Publiée le ${formatDate(offer.created_at)}</div>
                        <button class="btn-apply ${isApplied ? 'btn-applied' : ''}" 
                                data-id="${offer.id}" 
                                ${isApplied ? 'disabled' : ''}>
                            ${isApplied ? '<i class="fas fa-check"></i> Déjà postulé' : '<i class="fas fa-paper-plane"></i> Postuler'}
                        </button>
                    </div>
                `;
            }).join('');

            // Attacher les événements aux boutons "Postuler"
            document.querySelectorAll('.btn-apply:not(:disabled)').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const offerId = btn.getAttribute('data-id');
                    applyForOffer(offerId, btn);
                });
            });

        } catch (error) {
            console.error('Erreur loadOffers:', error);
            showMessage('Impossible de charger les offres. Vérifiez votre connexion.', 'error');
            offersContainer.innerHTML = '<div class="empty-message">Erreur de chargement. Veuillez réessayer.</div>';
        }
    }

    // Postuler à une offre
    async function applyForOffer(offerId, buttonElement) {
        // Désactiver le bouton pendant l'envoi
        const originalText = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Envoi...';

        try {
            const response = await fetch('api.php?action=apply_offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ offer_id: offerId })
            });
            const data = await response.json();

            if (data.success) {
                buttonElement.innerHTML = '<i class="fas fa-check"></i> Postulé !';
                buttonElement.classList.add('btn-applied');
                showMessage('Candidature envoyée avec succès !', 'success');
            } else {
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalText;
                showMessage(data.message || 'Erreur lors de la candidature', 'error');
            }
        } catch (error) {
            console.error('Erreur apply:', error);
            buttonElement.disabled = false;
            buttonElement.innerHTML = originalText;
            showMessage('Erreur réseau. Veuillez réessayer.', 'error');
        }
    }

    // Afficher un message temporaire
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
        try {
            await fetch('api.php?action=logout', { method: 'POST', credentials: 'include' });
        } catch(e) {}
        window.location.href = 'connexion.html';
    }

    // Utilitaires
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
            return c;
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Date inconnue';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Initialisation
    const isAuth = await checkAuth();
    if (isAuth) {
        await loadOffers();
    }

    // Événement déconnexion
    logoutBtn.addEventListener('click', logout);
});