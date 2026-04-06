// dimension_candidat.js - Gestion de l'interface candidat avec AJAX

document.addEventListener('DOMContentLoaded', function () {
    // Initialiser l'interface
    initializeInterface();

    // Charger les offres
    loadOffers();
});

function initializeInterface() {
    // Charger les données du candidat depuis le profil API
    fetch('api.php?action=get_profile')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const profile = data.profile;
                document.getElementById('candidate-name').textContent = profile.prenom + ' ' + profile.nom;
                document.getElementById('welcome-message').textContent = `Bienvenue, ${profile.prenom}!`;
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function loadOffers() {
    fetch('api.php?action=get_offers')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayOffers(data.offers);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des offres:', error));
}

function displayOffers(offers) {
    const container = document.getElementById('offers-list');

    if (!offers || offers.length === 0) {
        container.innerHTML = '<p>Aucune offre disponible pour le moment.</p>';
        return;
    }

    let html = '';
    offers.forEach(offer => {
        const matchPercentage = offer.match_percentage || 0;
        const matchClass = matchPercentage >= 80 ? 'high-match' : matchPercentage >= 50 ? 'medium-match' : 'low-match';

        html += `
            <div class="offer-item ${matchClass}">
                <div class="offer-header">
                    <h3>${escapeHtml(offer.title)}</h3>
                    <div class="match-indicator">
                        <span class="match-percentage">${matchPercentage}% match</span>
                    </div>
                </div>
                <p class="offer-company">${escapeHtml(offer.company_name || 'Entreprise')}</p>
                <p class="offer-meta">${escapeHtml(offer.domaine || '')} • ${escapeHtml(offer.location || '')}</p>
                <p class="offer-description">${escapeHtml(offer.description).substring(0, 150)}...</p>
                <button class="btn-apply" onclick="applyToOffer(${offer.id})">Postuler</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayApplications(applications) {
    const container = document.getElementById('applications-list');

    if (!applications || applications.length === 0) {
        container.innerHTML = '<p>Vous n\'avez pas encore postulé à une offre.</p>';
        return;
    }

    let html = '';
    applications.forEach(app => {
        const statusClass = `status-${app.status}`;
        const statusText = app.status === 'pending' ? 'En attente' :
            app.status === 'accepted' ? 'Acceptée' : 'Refusée';

        html += `
            <div class="application-item">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3>${escapeHtml(app.title)}</h3>
                        <p class="application-meta">${escapeHtml(app.company_name || 'Entreprise')} • Postulez le ${app.applied_at}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayProfile(profile) {
    const container = document.getElementById('profile-content');

    const html = `
        <p><strong>Prénom :</strong> ${escapeHtml(profile.prenom)}</p>
        <p><strong>Nom :</strong> ${escapeHtml(profile.nom)}</p>
        <p><strong>Email :</strong> ${escapeHtml(profile.email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(profile.telephone)}</p>
        <p><strong>Adresse :</strong> ${escapeHtml(profile.address)}</p>
        <p><strong>Titre :</strong> ${escapeHtml(profile.titre)}</p>
        <p><strong>Résumé :</strong> ${escapeHtml(profile.cv_summary)}</p>
    `;

    container.innerHTML = html;
}

function applyToOffer(offerId) {
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'apply_to_offer',
            offer_id: offerId
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Candidature envoyée avec succès!', 'success');
            } else {
                showMessage(data.message || 'Erreur lors de la candidature.', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion.', 'error');
        });
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    container.innerHTML = `<div class="message ${type}">${escapeHtml(message)}</div>`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}