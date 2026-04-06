// profil-employeur.js - Gestion du profil employeur

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'interface
    initializeInterface();

    // Charger le profil
    loadProfile();
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

function loadProfile() {
    fetch('api.php?action=get_profile')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProfile(data.profile);
            } else {
                showMessage('Erreur lors du chargement du profil: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion', 'error');
        });
}

function displayProfile(profile) {
    const container = document.getElementById('profile-content');
    if (!container) return;

    container.innerHTML = `
        <div class="profile-info">
            <div class="profile-field">
                <label>Nom de l'entreprise:</label>
                <span>${profile.nom_company}</span>
            </div>
            <div class="profile-field">
                <label>Email:</label>
                <span>${profile.email}</span>
            </div>
            <div class="profile-field">
                <label>Nom du contact:</label>
                <span>${profile.nom || 'Non spécifié'}</span>
            </div>
            <div class="profile-field">
                <label>Poste:</label>
                <span>${profile.poste || 'Non spécifié'}</span>
            </div>
            <div class="profile-field">
                <label>Secteur:</label>
                <span>${profile.secteur || 'Non spécifié'}</span>
            </div>
            <div class="profile-field">
                <label>Taille de l'entreprise:</label>
                <span>${profile.taille || 'Non spécifiée'}</span>
            </div>
            <div class="profile-field">
                <label>Localisation:</label>
                <span>${profile.localisation || 'Non spécifiée'}</span>
            </div>
            <div class="profile-field">
                <label>Description:</label>
                <span>${profile.profile_summary || 'Non spécifiée'}</span>
            </div>
        </div>
        <div class="profile-actions">
            <button class="btn-primary" onclick="editProfile()">Modifier le profil</button>
        </div>
    `;
}

function editProfile() {
    // Pour l'instant, afficher un message
    showMessage('Fonctionnalité de modification à venir', 'info');
}

function showMessage(message, type) {
    const container = document.getElementById('message-container');
    if (!container) return;

    container.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}