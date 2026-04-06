// postulations-employeur.js - Gestion des postulations pour l'employeur

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'interface
    initializeInterface();

    // Charger les postulations
    loadApplications();
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

function loadApplications() {
    fetch('api.php?action=get_applications')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayApplications(data.applications);
            } else {
                showMessage('Erreur lors du chargement des postulations: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion', 'error');
        });
}

function displayApplications(applications) {
    const container = document.getElementById('applications-list');
    if (!container) return;

    if (applications.length === 0) {
        container.innerHTML = '<p class="no-data">Aucune postulation reçue pour le moment.</p>';
        return;
    }

    container.innerHTML = applications.map(app => {
        const statusClass = `status-${app.status}`;
        const statusText = app.status === 'pending' ? 'En attente' :
                          app.status === 'accepted' ? 'Acceptée' : 'Refusée';

        let html = `
            <div class="application-card">
                <div class="app-header">
                    <div>
                        <h3>${escapeHtml(app.title)}</h3>
                        <p class="offer-meta">Candidat : ${escapeHtml(app.prenom)} ${escapeHtml(app.nom)}</p>
                    </div>
                    <span class="status ${statusClass}">${statusText}</span>
                </div>

                <div class="candidate-info">
                    <p><strong>Email :</strong> ${escapeHtml(app.email)}</p>
                    <p><strong>Téléphone :</strong> ${escapeHtml(app.telephone)}</p>
                    <p><strong>Compétences :</strong> ${escapeHtml(app.competences || '')}</p>
                    <p><strong>Description :</strong> ${escapeHtml(app.cv_description || '')}</p>
                </div>
        `;

        if (app.status === 'pending') {
            html += `
                <div class="actions">
                    <button class="btn-accept" onclick="updateApplicationStatus(${app.id}, 'accepted')">Accepter</button>
                    <button class="btn-reject" onclick="updateApplicationStatus(${app.id}, 'rejected')">Refuser</button>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }).join('');
}

function updateApplicationStatus(applicationId, status) {
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'update_application_status',
            application_id: applicationId,
            status: status
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Statut mis à jour avec succès!', 'success');
            loadApplications(); // Recharger la liste des candidatures
        } else {
            showMessage(data.message || 'Erreur lors de la mise à jour.', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion.', 'error');
    });
}

function viewCandidateProfile(candidateId) {
    // Ouvrir le profil du candidat dans une nouvelle fenêtre ou modal
    window.open(`profil-candidat.html?id=${candidateId}`, '_blank');
}

function contactCandidate(email) {
    // Ouvrir le client de messagerie
    window.location.href = `mailto:${email}`;
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    if (!container) return;

    container.innerHTML = `<div class="message ${type}">${message}</div>`;
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