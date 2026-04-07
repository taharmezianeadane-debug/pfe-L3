// ========================================
// ESPACE ADMINISTRATEUR
// ========================================

document.addEventListener('DOMContentLoaded', async function () {
    const messageArea = document.getElementById('messageArea');
    const userInfoSpan = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    // Gestion des onglets
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId + 'Tab').classList.add('active');
            // Recharger les données de l'onglet si nécessaire
            if (tabId === 'employees') loadEmployees();
            else if (tabId === 'employers') loadEmployers();
            else if (tabId === 'offers') loadOffers();
            else if (tabId === 'applications') loadApplications();
        });
    });

    // Vérifier la session admin
    async function checkAuth() {
        try {
            const response = await fetch('api.php?action=check_session', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.authenticated || data.role !== 'admin') {
                window.location.href = 'connexion_admin.html'; // Page de connexion admin
                return false;
            }
            userInfoSpan.innerHTML = `<i class="fas fa-user-cog"></i> ${data.user_name || 'Admin'}`;
            return true;
        } catch (error) {
            window.location.href = 'connexion_admin.html';
            return false;
        }
    }

    // Charger les employés
    async function loadEmployees() {
        const tbody = document.getElementById('employeesTableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell"><i class="fas fa-spinner fa-pulse"></i> Chargement...</td></tr>';
        try {
            const response = await fetch('api.php?action=admin_get_employees', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            const employees = data.employees || [];
            if (employees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">Aucun employé inscrit.</td></tr>';
                return;
            }
            tbody.innerHTML = employees.map(emp => `
                <tr>
                    <td>${emp.id}</td>
                    <td>${escapeHtml(emp.email)}</td>
                    <td>${escapeHtml(emp.prenom || '')} ${escapeHtml(emp.nom || '')}</td>
                    <td>${escapeHtml(emp.telephone || '-')}</td>
                    <td>${escapeHtml(emp.titre || '-')}</td>
                    <td>${formatDate(emp.created_at)}</td>
                    <td><button class="btn-delete" data-id="${emp.id}" data-type="employee"><i class="fas fa-trash"></i> Supprimer</button></td>
                </tr>
            `).join('');
            // Attacher événements suppression
            document.querySelectorAll('.btn-delete[data-type="employee"]').forEach(btn => {
                btn.addEventListener('click', () => deleteEmployee(btn.dataset.id));
            });
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="7">Erreur de chargement</td></tr>';
            showMessage(error.message, 'error');
        }
    }

    // Charger les employeurs
    async function loadEmployers() {
        const tbody = document.getElementById('employersTableBody');
        tbody.innerHTML = '<tr><td colspan="8" class="loading-cell"><i class="fas fa-spinner fa-pulse"></i> Chargement...</td></tr>';
        try {
            const response = await fetch('api.php?action=admin_get_employers', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            const employers = data.employers || [];
            if (employers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8">Aucun employeur inscrit.</td></tr>';
                return;
            }
            tbody.innerHTML = employers.map(emp => `
                <tr>
                    <td>${emp.id}</td>
                    <td>${escapeHtml(emp.email)}</td>
                    <td>${escapeHtml(emp.nom_company)}</td>
                    <td>${escapeHtml(emp.nom_representant || '-')}</td>
                    <td>${escapeHtml(emp.poste || '-')}</td>
                    <td>${escapeHtml(emp.secteur || '-')}</td>
                    <td>${escapeHtml(emp.localisation || '-')}</td>
                    <td><button class="btn-delete" data-id="${emp.id}" data-type="employer"><i class="fas fa-trash"></i> Supprimer</button></td>
                </tr>
            `).join('');
            document.querySelectorAll('.btn-delete[data-type="employer"]').forEach(btn => {
                btn.addEventListener('click', () => deleteEmployer(btn.dataset.id));
            });
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="8">Erreur de chargement</td></tr>';
            showMessage(error.message, 'error');
        }
    }

    // Charger toutes les offres
    async function loadOffers() {
        const tbody = document.getElementById('offersTableBody');
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell"><i class="fas fa-spinner fa-pulse"></i> Chargement...</td></tr>';
        try {
            const response = await fetch('api.php?action=admin_get_all_offers', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            const offers = data.offers || [];
            if (offers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Aucune offre publiée.</td></tr>';
                return;
            }
            tbody.innerHTML = offers.map(offer => `
                <tr>
                    <td>${offer.id}</td>
                    <td>${escapeHtml(offer.title)}</td>
                    <td>${escapeHtml(offer.nom_company)}</td>
                    <td>${escapeHtml(offer.location || '-')}</td>
                    <td>${formatDate(offer.created_at)}</td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5">Erreur de chargement</td></tr>';
            showMessage(error.message, 'error');
        }
    }

    // Charger toutes les candidatures
    async function loadApplications() {
        const tbody = document.getElementById('applicationsTableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell"><i class="fas fa-spinner fa-pulse"></i> Chargement...</td></tr>';
        try {
            const response = await fetch('api.php?action=admin_get_all_applications', {
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            const apps = data.applications || [];
            if (apps.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">Aucune candidature.</td></tr>';
                return;
            }
            tbody.innerHTML = apps.map(app => `
                <tr>
                    <td>${app.id}</td>
                    <td>${escapeHtml(app.offer_title)}</td>
                    <td>${escapeHtml(app.nom_company)}</td>
                    <td>${escapeHtml(app.prenom)} ${escapeHtml(app.nom)}</td>
                    <td>${escapeHtml(app.candidate_email)}</td>
                    <td>${formatDate(app.date_candidature)}</td>
                    <td><span class="badge-statut badge-${app.statut}">${getStatutLabel(app.statut)}</span></td>
                </tr>
            `).join('');
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="7">Erreur de chargement</td></tr>';
            showMessage(error.message, 'error');
        }
    }

    // Supprimer un employé
    async function deleteEmployee(id) {
        if (!confirm('Supprimer définitivement cet employé ?')) return;
        try {
            const response = await fetch('api.php?action=admin_delete_employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ employee_id: id })
            });
            const data = await response.json();
            if (data.success) {
                showMessage('Employé supprimé', 'success');
                loadEmployees();
            } else {
                showMessage(data.message || 'Erreur', 'error');
            }
        } catch (error) {
            showMessage('Erreur réseau', 'error');
        }
    }

    // Supprimer un employeur
    async function deleteEmployer(id) {
        if (!confirm('Supprimer définitivement cet employeur ?')) return;
        try {
            const response = await fetch('api.php?action=admin_delete_employer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ employer_id: id })
            });
            const data = await response.json();
            if (data.success) {
                showMessage('Employeur supprimé', 'success');
                loadEmployers();
            } else {
                showMessage(data.message || 'Erreur', 'error');
            }
        } catch (error) {
            showMessage('Erreur réseau', 'error');
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

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR');
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
        window.location.href = 'connexion_admin.html';
    }

    logoutBtn.addEventListener('click', logout);

    // Initialisation
    const isAuth = await checkAuth();
    if (isAuth) {
        // Charger l'onglet actif (employés par défaut)
        loadEmployees();
    }
});