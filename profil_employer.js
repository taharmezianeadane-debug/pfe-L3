document.addEventListener('DOMContentLoaded', async function () {
    const cvContent = document.getElementById('cvContent');
    const applicationsContent = document.getElementById('applicationsContent');
    const messageArea = document.getElementById('messageArea');
    const userInfoSpan = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    // Vérification authentification (employé)
    async function checkAuth() {
        try {
            const response = await fetch('api.php?action=check_session', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.authenticated || data.role !== 'employe') {
                window.location.href = 'connexion.html';
                return false;
            }
            userInfoSpan.innerHTML = `<i class="fas fa-user-circle"></i> ${data.user_name || 'Employé'}`;
            return true;
        } catch (error) {
            window.location.href = 'connexion.html';
            return false;
        }
    }

    // Charger le CV complet de l'employé
    async function loadCV() {
        try {
            const response = await fetch('api.php?action=get_employee_profile', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) {
                cvContent.innerHTML = `<div class="empty-message">${data.message || 'Erreur chargement CV'}</div>`;
                return;
            }
            const cv = data.cv;
            cvContent.innerHTML = `
                <div class="cv-section">
                    <h3><i class="fas fa-user"></i> Informations personnelles</h3>
                    <p><strong>Nom :</strong> ${escapeHtml(cv.nom)}</p>
                    <p><strong>Prénom :</strong> ${escapeHtml(cv.prenom)}</p>
                    <p><strong>Email :</strong> ${escapeHtml(cv.email)}</p>
                    <p><strong>Téléphone :</strong> ${escapeHtml(cv.telephone || 'Non renseigné')}</p>
                    <p><strong>Titre professionnel :</strong> ${escapeHtml(cv.titre_professionnel || 'Non renseigné')}</p>
                </div>
                <div class="cv-section">
                    <h3><i class="fas fa-briefcase"></i> Expériences</h3>
                    ${cv.experiences && cv.experiences.length ? cv.experiences.map(exp => `
                        <p><strong>${escapeHtml(exp.poste)}</strong> chez ${escapeHtml(exp.entreprise)} (${exp.annee_debut || ''} - ${exp.annee_fin || ''})</p>
                    `).join('') : '<p>Aucune expérience renseignée</p>'}
                </div>
                <div class="cv-section">
                    <h3><i class="fas fa-graduation-cap"></i> Formations</h3>
                    ${cv.formations && cv.formations.length ? cv.formations.map(f => `
                        <p><strong>${escapeHtml(f.diplome)}</strong> - ${escapeHtml(f.etablissement)}</p>
                    `).join('') : '<p>Aucune formation renseignée</p>'}
                </div>
                <div class="cv-section">
                    <h3><i class="fas fa-language"></i> Langues</h3>
                    ${cv.langues && cv.langues.length ? cv.langues.map(l => `
                        <p>${escapeHtml(l.langue)} : ${escapeHtml(l.niveau)}</p>
                    `).join('') : '<p>Aucune langue renseignée</p>'}
                </div>
                <div class="cv-section">
                    <h3><i class="fas fa-code"></i> Compétences</h3>
                    ${cv.competences && cv.competences.length ? cv.competences.map(c => `<span class="skill-tag">${escapeHtml(c.nom)}</span>`).join(' ') : '<p>Aucune compétence renseignée</p>'}
                </div>
            `;
        } catch (error) {
            cvContent.innerHTML = '<div class="empty-message">Erreur réseau</div>';
        }
    }

    // Charger les candidatures de l'employé
    async function loadApplications() {
        try {
            const response = await fetch('api.php?action=get_my_applications', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) {
                applicationsContent.innerHTML = `<div class="empty-message">${data.message || 'Erreur chargement candidatures'}</div>`;
                return;
            }
            const apps = data.applications || [];
            if (apps.length === 0) {
                applicationsContent.innerHTML = '<div class="empty-message">Vous n\'avez postulé à aucune offre pour le moment.</div>';
                return;
            }
            applicationsContent.innerHTML = apps.map(app => `
                <div class="application-item">
                    <div class="application-title">${escapeHtml(app.offer_title)}</div>
                    <div class="application-company"><i class="fas fa-building"></i> ${escapeHtml(app.company_name)}</div>
                    <div class="application-date"><i class="far fa-calendar-alt"></i> Postulé le ${formatDate(app.date_candidature)}</div>
                    <div class="application-status status-${app.statut}">${getStatutLabel(app.statut)}</div>
                </div>
            `).join('');
        } catch (error) {
            applicationsContent.innerHTML = '<div class="empty-message">Erreur réseau</div>';
        }
    }

    function getStatutLabel(statut) {
        const map = { en_attente: 'En attente', acceptee: 'Acceptée', refusee: 'Refusée' };
        return map[statut] || statut;
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
            if (m === '<') return '&lt';
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
        await loadCV();
        await loadApplications();
    }

    logoutBtn.addEventListener('click', logout);
});