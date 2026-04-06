// espace-employeur.js - Gestion de l'interface employeur avec AJAX

document.addEventListener('DOMContentLoaded', function () {
    // Initialiser l'interface
    initializeInterface();

    // Charger les données
    loadOffers();

    // Configurer les événements
    setupEventListeners();
});

function initializeInterface() {
    // Charger les données de l'employeur depuis l'API
    fetch('api.php?action=get_profile')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const profile = data.profile;
                document.getElementById('employer-name').textContent = profile.nom_company;
                document.getElementById('welcome-message').textContent = `Bienvenue, ${profile.nom_company}!`;
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function setupEventListeners() {
    // Formulaire d'ajout d'offre
    const offerForm = document.getElementById('offer-form');
    if (offerForm) {
        offerForm.addEventListener('submit', handleOfferSubmission);
    }
}

function handleOfferSubmission(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const offerData = {
        title: formData.get('title'),
        domaine: formData.get('domaine'),
        location: formData.get('location'),
        description: formData.get('description'),
        competences_requises: Array.from(document.getElementById('competencesRequises').selectedOptions).map(option => option.value),
        langues_requises: Array.from(document.getElementById('languesRequises').selectedOptions).map(option => option.value),
        diplome_requis: formData.get('diplomeRequis')
    };

    // Validation côté client
    if (!offerData.title || !offerData.domaine || !offerData.location || !offerData.description) {
        showMessage('Tous les champs sont obligatoires.', 'error');
        return;
    }

    // Envoyer via AJAX
    fetch('api.php?action=add_offer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: offerData.title,
            description: offerData.description,
            location: offerData.location,
            domaine: offerData.domaine,
            competences_requises: offerData.competences_requises,
            langues_requises: offerData.langues_requises,
            diplome_requis: offerData.diplome_requis
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Offre créée avec succès!', 'success');
                e.target.reset();
                loadOffers(); // Recharger la liste des offres
            } else {
                showMessage(data.message || 'Erreur lors de la création de l\'offre.', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion.', 'error');
        });
}

function loadOffers() {
    fetch('api.php?action=get_employer_offers')
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
        container.innerHTML = '<p>Aucune offre publiée pour le moment.</p>';
        return;
    }

    let html = '<h3>Vos offres publiées</h3>';
    offers.forEach(offer => {
        html += `
            <div class="offer-card">
                <div>
                    <h4>${escapeHtml(offer.title)}</h4>
                    <p class="offer-meta">${escapeHtml(offer.domaine || '')} • ${escapeHtml(offer.location)}</p>
                </div>
                <p>${escapeHtml(offer.description).replace(/\n/g, '<br>')}</p>
            </div>
        `;
    });

    container.innerHTML = html;
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