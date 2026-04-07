document.addEventListener('DOMContentLoaded', async function () {
    const applicationsContainer = document.getElementById('applicationsContainer');
    const messageArea = document.getElementById('messageArea');
    const userInfoSpan = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const addOfferBtn = document.getElementById('addOfferBtn');
    const cvModal = document.getElementById('cvModal');
    const modalClose = document.querySelector('.modal-close');

    // Vérifier authentification
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

    // Charger les offres et candidatures
    async function loadApplications() {
        applicationsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Chargement...</div>';
        try {
            const response = await fetch('api.php?action=get_employer_offers_with_applications', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) {
                applicationsContainer.innerHTML = `<div class="empty-message">${data.message || 'Erreur'}</div>`;
                return;
            }
            const offers = data.offers || [];
            if (offers.length === 0) {
                applicationsContainer.innerHTML = '<div class="empty-message">Vous n\'avez publié aucune offre. Cliquez sur "Ajouter une offre" pour commencer.</div>';
                return;
            }
            applicationsContainer.innerHTML = offers.map(offer => `
                <div class="offer-group">
                    <div class="offer-title-badge">
                        <h3>${escapeHtml(offer.title)}</h3>
                        <span class="offer-stats"><i class="fas fa-users"></i> ${offer.candidatures?.length || 0} candidat(s)</span>
                    </div>
                    <div class="candidates-list">
                        ${offer.candidatures?.length ? offer.candidatures.map(cand => `
                            <div class="candidate-card" data-cand-id="${cand.id}">
                                <div class="candidate-header">
                                    <div>
                                        <div class="candidate-name">
                                            <i class="fas fa-user-circle"></i> ${escapeHtml(cand.employe_nom || cand.employe_prenom + ' ' + cand.employe_nom)}
                                            <span class="badge-status badge-${cand.statut}">${getStatutLabel(cand.statut)}</span>
                                        </div>
                                        <div class="candidate-email"><i class="fas fa-envelope"></i> ${escapeHtml(cand.employe_email)}</div>
                                    </div>
                                    <div class="candidate-actions">
                                        <button class="btn-view-cv" data-employe-id="${cand.employe_id}"><i class="fas fa-eye"></i> Voir CV</button>
                                        ${cand.statut === 'en_attente' ? `
                                            <button class="btn-accept" data-cand-id="${cand.id}"><i class="fas fa-check"></i> Accepter</button>
                                            <button class="btn-reject" data-cand-id="${cand.id}"><i class="fas fa-times"></i> Refuser</button>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="candidate-details">
                                    <span class="candidate-detail-item"><i class="fas fa-phone"></i> ${cand.employe_telephone || 'Non renseigné'}</span>
                                    <span class="candidate-detail-item"><i class="fas fa-graduation-cap"></i> ${cand.employe_titre || 'Titre non spécifié'}</span>
                                </div>
                            </div>
                        `).join('') : '<p>Aucune candidature pour cette offre.</p>'}
                    </div>
                </div>
            `).join('');

            // Événements
            document.querySelectorAll('.btn-view-cv').forEach(btn => {
                btn.addEventListener('click', () => showCvModal(btn.dataset.employeId));
            });
            document.querySelectorAll('.btn-accept').forEach(btn => {
                btn.addEventListener('click', () => updateStatus(btn.dataset.candId, 'acceptee'));
            });
            document.querySelectorAll('.btn-reject').forEach(btn => {
                btn.addEventListener('click', () => updateStatus(btn.dataset.candId, 'refusee'));
            });
        } catch (error) {
            applicationsContainer.innerHTML = '<div class="empty-message">Erreur réseau.</div>';
        }
    }

    // Mettre à jour le statut d'une candidature
    async function updateStatus(candidatureId, newStatus) {
        try {
            const response = await fetch('api.php?action=update_application_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ candidature_id: candidatureId, status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                showMessage(`Candidature ${newStatus === 'acceptee' ? 'acceptée' : 'refusée'} avec succès`, 'success');
                loadApplications(); // Rafraîchir
            } else {
                showMessage(data.message || 'Erreur', 'error');
            }
        } catch (error) {
            showMessage('Erreur réseau', 'error');
        }
    }

    // Afficher le CV dans la modale
    async function showCvModal(employeId) {
        try {
            const response = await fetch(`api.php?action=get_employee_cv&employe_id=${employeId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) {
                alert(data.message);
                return;
            }
            const cv = data.cv;
            document.getElementById('cvModalBody').innerHTML = `
                <div class="cv-full">
                    <div class="cv-section">
                        <h4><i class="fas fa-user"></i> Informations personnelles</h4>
                        <p><strong>Nom :</strong> ${escapeHtml(cv.prenom)} ${escapeHtml(cv.nom)}</p>
                        <p><strong>Email :</strong> ${escapeHtml(cv.email)}</p>
                        <p><strong>Téléphone :</strong> ${escapeHtml(cv.telephone || 'Non renseigné')}</p>
                        <p><strong>Titre :</strong> ${escapeHtml(cv.titre_professionnel || 'Non renseigné')}</p>
                    </div>
                    <div class="cv-section">
                        <h4><i class="fas fa-briefcase"></i> Expériences</h4>
                        ${cv.experiences?.length ? cv.experiences.map(exp => `<p><strong>${escapeHtml(exp.poste)}</strong> chez ${escapeHtml(exp.entreprise)} (${exp.annee_debut} - ${exp.annee_fin})</p>`).join('') : '<p>Aucune expérience renseignée</p>'}
                    </div>
                    <div class="cv-section">
                        <h4><i class="fas fa-graduation-cap"></i> Formations</h4>
                        ${cv.formations?.length ? cv.formations.map(f => `<p><strong>${escapeHtml(f.diplome)}</strong> - ${escapeHtml(f.etablissement)}</p>`).join('') : '<p>Aucune formation renseignée</p>'}
                    </div>
                    <div class="cv-section">
                        <h4><i class="fas fa-language"></i> Langues</h4>
                        ${cv.langues?.length ? cv.langues.map(l => `<p>${escapeHtml(l.langue)} : ${escapeHtml(l.niveau)}</p>`).join('') : '<p>Aucune langue renseignée</p>'}
                    </div>
                    <div class="cv-section">
                        <h4><i class="fas fa-code"></i> Compétences</h4>
                        ${cv.competences?.length ? cv.competences.map(c => `<span class="skill-tag">${escapeHtml(c.nom)}</span>`).join(' ') : '<p>Aucune compétence renseignée</p>'}
                    </div>
                </div>
            `;
            cvModal.style.display = 'block';
        } catch (error) {
            alert('Erreur chargement CV');
        }
    }

    function showMessage(msg, type) {
        messageArea.textContent = msg;
        messageArea.className = `message-area ${type}`;
        setTimeout(() => {
            messageArea.style.display = 'none';
            messageArea.className = 'message-area';
        }, 4000);
    }

    function getStatutLabel(statut) {
        const map = { en_attente: 'En attente', acceptee: 'Acceptée', refusee: 'Refusée' };
        return map[statut] || statut;
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

    // Déconnexion
    async function logout() {
        await fetch('api.php?action=logout', { method: 'POST', credentials: 'include' });
        window.location.href = 'connexion.html';
    }

    // Redirection vers page d'ajout d'offre
    function goToAddOffer() {
        window.location.href = 'publier-offre-employeur.html';
    }

    // Fermeture modale
    modalClose.onclick = () => cvModal.style.display = 'none';
    window.onclick = (e) => { if (e.target === cvModal) cvModal.style.display = 'none'; };

    // Initialisation
    const isAuth = await checkAuth();
    if (isAuth) {
        await loadApplications();
    }

    logoutBtn.addEventListener('click', logout);
    addOfferBtn.addEventListener('click', goToAddOffer);
});