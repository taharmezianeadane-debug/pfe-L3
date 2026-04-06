// ========================================
// SCRIPT POUR INSCRIPTION EMPLOYE
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('cvForm');
    const progressFill = document.getElementById('progressFill');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const skillInput = document.querySelector('.skill-input');
    const languesContainer = document.getElementById('languesContainer');
    const experiencesContainer = document.getElementById('experiencesContainer');
    const formationsContainer = document.getElementById('formationsContainer');

    const languesDisponibles = [
        { value: 'francais', label: 'Francais' },
        { value: 'anglais', label: 'Anglais' },
        { value: 'arabe', label: 'Arabe' },
        { value: 'espagnol', label: 'Espagnol' },
        { value: 'allemand', label: 'Allemand' },
        { value: 'italien', label: 'Italien' },
        { value: 'portugais', label: 'Portugais' },
        { value: 'russe', label: 'Russe' },
        { value: 'chinois', label: 'Chinois' },
        { value: 'japonais', label: 'Japonais' },
        { value: 'turc', label: 'Turc' },
        { value: 'persan', label: 'Persan' },
        { value: 'neerlandais', label: 'Neerlandais' },
        { value: 'suedois', label: 'Suedois' },
        { value: 'danois', label: 'Danois' },
        { value: 'norvegien', label: 'Norvegien' },
        { value: 'finnois', label: 'Finnois' },
        { value: 'polonais', label: 'Polonais' },
        { value: 'tcheque', label: 'Tcheque' },
        { value: 'hongrois', label: 'Hongrois' },
        { value: 'grec', label: 'Grec' },
        { value: 'hebreu', label: 'Hebreu' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'bengali', label: 'Bengali' },
        { value: 'vietnamien', label: 'Vietnamien' },
        { value: 'thai', label: 'Thai' },
        { value: 'coreen', label: 'Coreen' },
        { value: 'swahili', label: 'Swahili' },
        { value: 'amharique', label: 'Amharique' },
        { value: 'berbere', label: 'Berbere' }
    ];

    const niveaux = [
        { value: 'c2', label: 'Courant (C2) - Bilingue' },
        { value: 'c1', label: 'Avance (C1) - Courant' },
        { value: 'b2', label: 'Intermediaire+ (B2) - Bon niveau' },
        { value: 'b1', label: 'Intermediaire (B1) - Niveau seuil' },
        { value: 'a2', label: 'Debutant+ (A2) - Elementaire' },
        { value: 'a1', label: 'Debutant (A1) - Introduction' }
    ];

    function getApiUrl(action) {
        if (window.location.protocol === 'file:') {
            throw new Error(
                'Vous avez ouvert la page en file://. Utilisez WAMP et ouvrez: http://localhost/pfe-L3-taher/pfe-L3-main/employer.html'
            );
        }

        return `api.php?action=${action}`;
    }

    async function postJson(action, payload) {
        const response = await fetch(getApiUrl(action), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        let data = {};

        if (text) {
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error(`Reponse invalide du serveur: ${text}`);
            }
        }

        if (!response.ok) {
            throw new Error(data.message || `Erreur HTTP ${response.status}`);
        }

        return data;
    }

    function updateProgress() {
        if (!form || !progressFill) {
            return;
        }

        const inputs = form.querySelectorAll('input:not([type="checkbox"]), select, textarea');
        let filled = 0;

        inputs.forEach(function (input) {
            if (input.value && input.value.trim() !== '') {
                filled++;
            }
        });

        const percent = inputs.length ? (filled / inputs.length) * 100 : 0;
        progressFill.style.width = `${percent}%`;
    }

    function updatePasswordStrength() {
        if (!passwordInput || !strengthBar) {
            return;
        }

        const password = passwordInput.value;
        let width = 0;
        let color = '#e53e3e';

        if (password.length >= 6) {
            width = 40;
        }

        if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
            width = 70;
            color = '#dd6b20';
        }

        if (password.length >= 10 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            width = 100;
            color = '#00b4a5';
        }

        strengthBar.style.width = `${width}%`;
        strengthBar.style.background = color;
    }

    function createLangueRow(langueValue = '', niveauValue = 'b2') {
        const row = document.createElement('div');
        row.className = 'langue-ligne';

        const langueSelect = document.createElement('select');
        langueSelect.className = 'langue-select';
        langueSelect.innerHTML = '<option value="">-- Choisissez une langue --</option>';

        languesDisponibles.forEach(function (langue) {
            const option = document.createElement('option');
            option.value = langue.value;
            option.textContent = langue.label;
            option.selected = langue.value === langueValue;
            langueSelect.appendChild(option);
        });

        const niveauSelect = document.createElement('select');
        niveauSelect.className = 'niveau-select';

        niveaux.forEach(function (niveau) {
            const option = document.createElement('option');
            option.value = niveau.value;
            option.textContent = niveau.label;
            option.selected = niveau.value === niveauValue;
            niveauSelect.appendChild(option);
        });

        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-trash-alt remove-langue';
        removeIcon.title = 'Supprimer';
        removeIcon.addEventListener('click', function () {
            row.remove();
            updateProgress();
        });

        row.appendChild(langueSelect);
        row.appendChild(niveauSelect);
        row.appendChild(removeIcon);

        return row;
    }

    function createExperienceItem(values = {}) {
        const item = document.createElement('div');
        item.className = 'exp-item';
        item.innerHTML = `
            <div class="form-row">
                <div class="form-group half">
                    <label>Poste</label>
                    <input type="text" class="form-control" placeholder="Poste occupe" value="${values.poste || ''}">
                </div>
                <div class="form-group half">
                    <label>Entreprise</label>
                    <input type="text" class="form-control" placeholder="Entreprise" value="${values.entreprise || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label>De</label>
                    <input type="text" class="form-control" placeholder="Annee debut" value="${values.debut || ''}">
                </div>
                <div class="form-group half">
                    <label>A</label>
                    <input type="text" class="form-control" placeholder="Annee fin" value="${values.fin || ''}">
                </div>
            </div>
            <i class="fas fa-trash-alt remove-item"></i>
        `;

        item.querySelector('.remove-item').addEventListener('click', function () {
            item.remove();
            updateProgress();
        });

        return item;
    }

    function createFormationItem(values = {}) {
        const item = document.createElement('div');
        item.className = 'formation-item';
        item.innerHTML = `
            <div class="form-row">
                <div class="form-group half">
                    <label>Diplome</label>
                    <input type="text" class="form-control" placeholder="Diplome" value="${values.diplome || ''}">
                </div>
                <div class="form-group half">
                    <label>Etablissement</label>
                    <input type="text" class="form-control" placeholder="Etablissement" value="${values.etablissement || ''}">
                </div>
            </div>
            <i class="fas fa-trash-alt remove-item"></i>
        `;

        item.querySelector('.remove-item').addEventListener('click', function () {
            item.remove();
            updateProgress();
        });

        return item;
    }

    function addSkillTag(value) {
        if (!skillInput || !value) {
            return;
        }

        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.innerHTML = `${value} <i class="fas fa-times"></i>`;

        tag.querySelector('i').addEventListener('click', function () {
            tag.remove();
            updateProgress();
        });

        skillInput.parentElement.insertBefore(tag, skillInput);
    }

    function initFormSections() {
        if (languesContainer && !languesContainer.children.length) {
            languesContainer.appendChild(createLangueRow());
        }

        if (experiencesContainer && !experiencesContainer.children.length) {
            experiencesContainer.appendChild(createExperienceItem());
        }

        if (formationsContainer && !formationsContainer.children.length) {
            formationsContainer.appendChild(createFormationItem());
        }
    }

    function collectSkills() {
        const select = document.getElementById('competences');
        return Array.from(select?.selectedOptions || []).map(option => option.value);
    }

    function collectLanguages() {
        const select = document.getElementById('langues');
        return Array.from(select?.selectedOptions || []).map(option => option.value);
    }

    function collectDiplome() {
        return document.getElementById('diplome')?.value || '';
    }

    function collectQualites() {
        const select = document.getElementById('qualites');
        return Array.from(select?.selectedOptions || []).map(option => option.value);
    }

    function collectExperiences() {
        return Array.from(document.querySelectorAll('.exp-item')).map(function (item) {
            const inputs = item.querySelectorAll('input');
            const poste = inputs[0]?.value.trim() || '';
            const entreprise = inputs[1]?.value.trim() || '';
            const debut = inputs[2]?.value.trim() || '';
            const fin = inputs[3]?.value.trim() || '';

            if (!poste && !entreprise && !debut && !fin) {
                return null;
            }

            return { poste, entreprise, debut, fin };
        }).filter(Boolean);
    }

    function collectFormations() {
        return Array.from(document.querySelectorAll('.formation-item')).map(function (item) {
            const inputs = item.querySelectorAll('input');
            const diplome = inputs[0]?.value.trim() || '';
            const etablissement = inputs[1]?.value.trim() || '';

            if (!diplome && !etablissement) {
                return null;
            }

            return { diplome, etablissement };
        }).filter(Boolean);
    }

    document.getElementById('addLangue')?.addEventListener('click', function () {
        languesContainer?.appendChild(createLangueRow());
        updateProgress();
    });

    document.getElementById('addExperience')?.addEventListener('click', function () {
        experiencesContainer?.appendChild(createExperienceItem());
        updateProgress();
    });

    document.getElementById('addFormation')?.addEventListener('click', function () {
        formationsContainer?.appendChild(createFormationItem());
        updateProgress();
    });

    if (skillInput) {
        skillInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = this.value.trim();

                if (value) {
                    addSkillTag(value);
                    this.value = '';
                    updateProgress();
                }
            }
        });
    }

    passwordInput?.addEventListener('input', function () {
        updatePasswordStrength();
        updateProgress();
    });

    confirmPasswordInput?.addEventListener('input', updateProgress);

    form?.querySelectorAll('input, select, textarea').forEach(function (input) {
        input.addEventListener('input', updateProgress);
        input.addEventListener('change', updateProgress);
    });

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const prenom = document.getElementById('prenom')?.value.trim();
            const nom = document.getElementById('nom')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const telephone = document.getElementById('telephone')?.value.trim() || '';
            const titre = document.getElementById('titre')?.value.trim() || '';
            const password = passwordInput?.value || '';
            const confirmPassword = confirmPasswordInput?.value || '';
            const acceptTerms = document.getElementById('acceptTerms')?.checked;
            const skills = collectSkills();
            const languages = collectLanguages();
            const experiences = collectExperiences();
            const formations = collectFormations();
            const diplome = collectDiplome();
            const qualites = collectQualites();

            if (!email || !prenom || !nom) {
                showToast('Veuillez remplir Email, Prenom et Nom.', 'error');
                return;
            }

            if (!password || !confirmPassword) {
                showToast('Veuillez remplir les champs de mot de passe.', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('Le mot de passe doit contenir au moins 6 caracteres.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Les mots de passe ne correspondent pas.', 'error');
                return;
            }

            if (!acceptTerms) {
                showToast('Veuillez accepter les conditions generales.', 'error');
                return;
            }

            try {
                const data = await postJson('register', {
                    email,
                    password,
                    role: 'employe',
                    prenom,
                    nom,
                    telephone,
                    titre,
                    cv_summary: '',
                    skills,
                    languages,
                    experiences,
                    formations,
                    diplome,
                    qualites,
                    name: `${prenom} ${nom}`.trim()
                });

                if (data.success) {
                    window.location.href = 'connexion.html?registered=success';
                    return;
                }

                showToast(data.message || 'Erreur lors de l inscription.', 'error');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    initFormSections();
    updatePasswordStrength();
    updateProgress();
});
