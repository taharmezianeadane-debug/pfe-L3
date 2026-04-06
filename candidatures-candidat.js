// candidatures-candidat.js - Affiche les candidatures du candidat

document.addEventListener('DOMContentLoaded', function() {
    initializeInterface();
    loadApplications();
});

function initializeInterface() {
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

function loadApplications() {
    fetch('api.php?action=get_my_applications')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayApplications(data.applications);
            } else {
                showMessage(data.message || 'Erreur lors du chargement des candidatures.', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion.', 'error');
        });
}

function displayApplications(applications) {
    const container = document.getElementById('applications-list');
    if (!container) return;

    if (!applications || applications.length === 0) {
        container.innerHTML = '<p>Vous n\'avez pas encore postulé à une offre.</p>';
        return;
    }

    container.innerHTML = applications.map(app => {
        const statusClass = `status-${app.status}`;
        const statusText = app.status === 'pending' ? 'En attente' :
                          app.status === 'accepted' ? 'Acceptée' : 'Refusée';

        return `
            <div class="application-item">
                <div class="application-header">
                    <div>
                        <h3>${escapeHtml(app.title)}</h3>
                        <p class="application-meta">${escapeHtml(app.company_name || 'Entreprise')} • Postulé le ${escapeHtml(app.applied_at)}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    if (!container) return;
    container.innerHTML = `<div class="message ${type}">${escapeHtml(message)}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}