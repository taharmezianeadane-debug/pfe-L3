document.addEventListener('DOMContentLoaded', async function () {
    const offerForm = document.getElementById('offerForm');
    const userInfoSpan = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const skillsContainer = document.getElementById('skillsContainer');
    const skillInput = document.getElementById('skillInput');
    const languagesContainer = document.getElementById('languagesContainer');
    const addLangueBtn = document.getElementById('addLangueBtn');

    let skills = [];
    let languages = []; // chaque élément : { langue, niveau }

    // Vérification authentification
    async function checkAuth() {
        try {
            const response = await fetch('api.php?action=check_session', { credentials: 'include' });
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

    // Gestion des compétences (tags)
    function updateSkillsTags() {
        skillsContainer.innerHTML = skills.map(skill => `
            <span class="skill-tag">${escapeHtml(skill)} <i class="fas fa-times" data-skill="${escapeHtml(skill)}"></i></span>
        `).join('');
        document.querySelectorAll('.skill-tag i').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const skillToRemove = icon.dataset.skill;
                skills = skills.filter(s => s !== skillToRemove);
                updateSkillsTags();
            });
        });
    }

    skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = skillInput.value.trim();
            if (val && !skills.includes(val)) {
                skills.push(val);
                updateSkillsTags();
                skillInput.value = '';
            }
        }
    });

    // Gestion des langues requises
    function addLanguageLine(langueValue = '', niveauValue = 'b2') {
        const ligne = document.createElement('div');
        ligne.className = 'langue-ligne';
        ligne.innerHTML = `
            <select class="langue-select">
                <option value="">-- Choisissez --</option>
                <option value="francais" ${langueValue === 'francais' ? 'selected' : ''}>Français</option>
                <option value="anglais" ${langueValue === 'anglais' ? 'selected' : ''}>Anglais</option>
                <option value="arabe" ${langueValue === 'arabe' ? 'selected' : ''}>Arabe</option>
                <option value="espagnol" ${langueValue === 'espagnol' ? 'selected' : ''}>Espagnol</option>
                <option value="allemand" ${langueValue === 'allemand' ? 'selected' : ''}>Allemand</option>
            </select>
            <select class="niveau-select">
                <option value="c2" ${niveauValue === 'c2' ? 'selected' : ''}>C2 - Courant</option>
                <option value="c1" ${niveauValue === 'c1' ? 'selected' : ''}>C1 - Avancé</option>
                <option value="b2" ${niveauValue === 'b2' ? 'selected' : ''}>B2 - Intermédiaire+</option>
                <option value="b1" ${niveauValue === 'b1' ? 'selected' : ''}>B1 - Intermédiaire</option>
                <option value="a2" ${niveauValue === 'a2' ? 'selected' : ''}>A2 - Débutant+</option>
                <option value="a1" ${niveauValue === 'a1' ? 'selected' : ''}>A1 - Débutant</option>
            </select>
            <i class="fas fa-trash-alt remove-langue"></i>
        `;
        ligne.querySelector('.remove-langue').addEventListener('click', () => ligne.remove());
        languagesContainer.appendChild(ligne);
    }

    addLangueBtn.addEventListener('click', () => addLanguageLine());

    // Récupérer les langues du formulaire
    function getLanguagesFromForm() {
        const lines = document.querySelectorAll('.langue-ligne');
        const langs = [];
        lines.forEach(line => {
            const langue = line.querySelector('.langue-select').value;
            const niveau = line.querySelector('.niveau-select').value;
            if (langue) langs.push({ langue, niveau });
        });
        return langs;
    }

    // Soumission du formulaire
    offerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const location = document.getElementById('location').value.trim();
        const contract = document.getElementById('contract').value;
        const description = document.getElementById('description').value.trim();
        const requiredSkills = skills;
        const requiredLanguages = getLanguagesFromForm();

        if (!title || !location || !description) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            const response = await fetch('api.php?action=add_offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    location,
                    contract,
                    description,
                    required_skills: requiredSkills,
                    required_languages: requiredLanguages
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Offre publiée avec succès !');
                window.location.href = 'dimension_employeur.html';
            } else {
                alert(data.message || 'Erreur lors de la publication');
            }
        } catch (error) {
            alert('Erreur réseau: ' + error.message);
        }
    });

    // Déconnexion
    async function logout() {
        await fetch('api.php?action=logout', { method: 'POST', credentials: 'include' });
        window.location.href = 'connexion.html';
    }
    logoutBtn.addEventListener('click', logout);

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Initialisation
    await checkAuth();
    // Ajouter une ligne langue par défaut
    addLanguageLine();
});