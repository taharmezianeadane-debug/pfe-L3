// profil-candidat.js - Affiche le profil du candidat

document.addEventListener('DOMContentLoaded', function() {
    initializeInterface();
    loadProfile();
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

function loadProfile() {
    fetch('api.php?action=get_profile')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProfile(data.profile);
            } else {
                showMessage(data.message || 'Erreur lors du chargement du profil.', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showMessage('Erreur de connexion.', 'error');
        });
}

function displayProfile(profile) {
    const container = document.getElementById('profile-content');
    if (!container) return;

    container.innerHTML = `
        <div class="profile-info">
            <div class="profile-field"><label>Prénom :</label><span>${escapeHtml(profile.prenom)}</span></div>
            <div class="profile-field"><label>Nom :</label><span>${escapeHtml(profile.nom)}</span></div>
            <div class="profile-field"><label>Email :</label><span>${escapeHtml(profile.email)}</span></div>
            <div class="profile-field"><label>Téléphone :</label><span>${escapeHtml(profile.telephone || 'Non renseigné')}</span></div>
            <div class="profile-field"><label>Adresse :</label><span>${escapeHtml(profile.address || 'Non renseignée')}</span></div>
            <div class="profile-field"><label>Titre :</label><span>${escapeHtml(profile.titre || 'Non renseigné')}</span></div>
            <div class="profile-field"><label>Résumé :</label><span>${escapeHtml(profile.cv_summary || 'Non renseigné')}</span></div>
        </div>
    `;
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