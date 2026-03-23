// ========================================
// SCRIPT POUR INSCRIPTION EMPLOYÉ
// ========================================

document.addEventListener('DOMContentLoaded', function () {

    // ==================== RÉCUPÉRATION DU FORMULAIRE ====================
    const form = document.getElementById('cvForm');

    // ==================== SOUMISSION FORMULAIRE ====================
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Récupérer les valeurs
            const email = document.getElementById('email')?.value.trim();
            const nom = document.getElementById('nom')?.value.trim();
            const prenom = document.getElementById('prenom')?.value.trim();
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            // Validations
            if (!email || !nom || !prenom) {
                alert('Veuillez remplir Email, Prénom et Nom');
                return;
            }

            if (!password || !confirmPassword) {
                alert('Veuillez remplir les champs de mot de passe');
                return;
            }

            if (password.length < 6) {
                alert('Le mot de passe doit contenir au moins 6 caractères');
                return;
            }

            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas!');
                return;
            }

            try {
                const response = await fetch('api.php?action=register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        role: 'employe',
                        name: (prenom + ' ' + nom).trim()
                    })
                });
                const data = await response.json();

                if (data.success) {
                    alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
                    window.location.href = 'connexion.html';
                } else {
                    alert(data.message || 'Erreur lors de l\'inscription');
                }
            } catch (error) {
                alert('Erreur de connexion: ' + error.message + '\n\nAssurez-vous que le serveur PHP est démarré.');
            }
        });
    }

    // ==================== LISTE COMPLÈTE DES LANGUES ====================
    const languesDisponibles = [
        { value: "francais", label: "Français" },
        { value: "anglais", label: "Anglais" },
        { value: "arabe", label: "Arabe" },
        { value: "espagnol", label: "Espagnol" },
        { value: "allemand", label: "Allemand" },
        { value: "italien", label: "Italien" },
        { value: "portugais", label: "Portugais" },
        { value: "russe", label: "Russe" },
        { value: "chinois", label: "Chinois" },
        { value: "japonais", label: "Japonais" },
        { value: "turc", label: "Turc" },
        { value: "persan", label: "Persan" },
        { value: "neerlandais", label: "Néerlandais" },
        { value: "suedois", label: "Suédois" },
        { value: "danois", label: "Danois" },
        { value: "norvegien", label: "Norvégien" },
        { value: "finnois", label: "Finnois" },
        { value: "polonais", label: "Polonais" },
        { value: "tcheque", label: "Tchèque" },
        { value: "hongrois", label: "Hongrois" },
        { value: "grec", label: "Grec" },
        { value: "hebreu", label: "Hébreu" },
        { value: "hindi", label: "Hindi" },
        { value: "bengali", label: "Bengali" },
        { value: "vietnamien", label: "Vietnamien" },
        { value: "thai", label: "Thaï" },
        { value: "coreen", label: "Coréen" },
        { value: "swahili", label: "Swahili" },
        { value: "amharique", label: "Amharique" },
        { value: "berbere", label: "Berbère" }
    ];

    // ==================== NIVEAUX DE LANGUES ====================
    const niveaux = [
        { value: "c2", label: "Courant (C2) - Bilingue" },
        { value: "c1", label: "Avancé (C1) - Courant" },
        { value: "b2", label: "Intermédiaire+ (B2) - Bon niveau" },
        { value: "b1", label: "Intermédiaire (B1) - Niveau seuil" },
        { value: "a2", label: "Débutant+ (A2) - Élémentaire" },
        { value: "a1", label: "Débutant (A1) - Introduction" }
    ];

    // ==================== FONCTION POUR CRÉER UNE LIGNE LANGUE ====================
    function creerLigneLangue(langueValue = "", niveauValue = "b2") {
        const ligne = document.createElement('div');
        ligne.className = 'langue-ligne';

        // Création du select des langues
        const selectLangue = document.createElement('select');
        selectLangue.className = 'langue-select';

        // Option par défaut
        const optionDefault = document.createElement('option');
        optionDefault.value = "";
        optionDefault.textContent = "-- Choisissez une langue --";
        selectLangue.appendChild(optionDefault);

        // Ajout de toutes les langues
        languesDisponibles.forEach(langue => {
            const option = document.createElement('option');
            option.value = langue.value;
            option.textContent = langue.label;
            if (langue.value === langueValue) {
                option.selected = true;
            }
            selectLangue.appendChild(option);
        });

        // Création du select des niveaux
        const selectNiveau = document.createElement('select');
        selectNiveau.className = 'niveau-select';

        niveaux.forEach(niveau => {
            const option = document.createElement('option');
            option.value = niveau.value;
            option.textContent = niveau.label;
            if (niveau.value === niveauValue) {
                option.selected = true;
            }
            selectNiveau.appendChild(option);
        });

        // Icône de suppression
        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-trash-alt remove-langue';
        removeIcon.title = 'Supprimer';
        removeIcon.onclick = function () {
            ligne.remove();
        };

        ligne.appendChild(selectLangue);
        ligne.appendChild(selectNiveau);
        ligne.appendChild(removeIcon);

        return ligne;
    }

    // ==================== AJOUT D'UNE LANGUE ====================
    document.getElementById('addLangue').addEventListener('click', function () {
        const container = document.getElementById('languesContainer');
        const nouvelleLigne = creerLigneLangue("", "b2");
        container.appendChild(nouvelleLigne);
    });

    // ==================== GESTION DES SUPPRESSIONS EXISTANTES ====================
    document.querySelectorAll('.remove-langue').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.langue-ligne').remove();
        });
    });

    // ==================== AJOUT EXPÉRIENCE ====================
    document.getElementById('addExperience').addEventListener('click', function () {
        const container = document.querySelector('.exp-item').parentElement;
        const newExp = document.createElement('div');
        newExp.className = 'exp-item';
        newExp.innerHTML = `
            <div class="form-row">
                <div class="form-group half">
                    <label>Poste</label>
                    <input type="text" class="form-control" placeholder="Poste occupé">
                </div>
                <div class="form-group half">
                    <label>Entreprise</label>
                    <input type="text" class="form-control" placeholder="Entreprise">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label>De</label>
                    <input type="text" class="form-control" placeholder="Année début">
                </div>
                <div class="form-group half">
                    <label>À</label>
                    <input type="text" class="form-control" placeholder="Année fin">
                </div>
            </div>
            <i class="fas fa-trash-alt remove-item" style="float: right; color: #cbd5e0; cursor: pointer;" onclick="this.closest('.exp-item').remove()"></i>
        `;
        container.insertBefore(newExp, this);
    });

    // ==================== AJOUT FORMATION ====================
    document.getElementById('addFormation').addEventListener('click', function () {
        const container = document.querySelector('.formation-item').parentElement;
        const newForm = document.createElement('div');
        newForm.className = 'formation-item';
        newForm.innerHTML = `
            <div class="form-row">
                <div class="form-group half">
                    <label>Diplôme</label>
                    <input type="text" class="form-control" placeholder="Diplôme">
                </div>
                <div class="form-group half">
                    <label>Établissement</label>
                    <input type="text" class="form-control" placeholder="Établissement">
                </div>
            </div>
            <i class="fas fa-trash-alt remove-item" style="float: right; color: #cbd5e0; cursor: pointer;" onclick="this.closest('.formation-item').remove()"></i>
        `;
        container.insertBefore(newForm, this);
    });

    // ==================== COMPÉTENCES (TAGS) ====================
    const skillInput = document.querySelector('.skill-input');
    if (skillInput) {
        skillInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = this.value.trim();
                if (value) {
                    const tag = document.createElement('span');
                    tag.className = 'skill-tag';
                    tag.innerHTML = `${value} <i class="fas fa-times"></i>`;

                    tag.querySelector('i').addEventListener('click', function () {
                        tag.remove();
                    });

                    this.parentElement.insertBefore(tag, this);
                    this.value = '';
                }
            }
        });
    }

    // ==================== BARRE DE PROGRESSION ====================
    function updateProgress() {
        const inputs = document.querySelectorAll('input:not([type="checkbox"]), select, textarea');
        let filled = 0;
        inputs.forEach(input => {
            if (input.value && input.value.trim() !== '') filled++;
        });
        const percent = (filled / inputs.length) * 100;
        document.getElementById('progressFill').style.width = percent + '%';
    }

    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', updateProgress);
        input.addEventListener('change', updateProgress);
    });

    // ==================== SOUMISSION FORMULAIRE ====================
    document.getElementById('cvForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email')?.value;
        const nom = document.getElementById('nom')?.value || '';
        const prenom = document.getElementById('prenom')?.value || '';

        if (!email || !nom) {
            alert('Veuillez remplir les champs obligatoires');
            return;
        }

        // Simple popup pour le mot de passe
        const password = prompt('Créez un mot de passe (min 6 caractères):');
        if (!password || password.length < 6) {
            alert('Mot de passe invalide');
            return;
        }

        try {
            const response = await fetch('api.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: 'employe',
                    name: (prenom + ' ' + nom).trim()
                })
            });
            const data = await response.json();

            if (data.success) {
                alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
                window.location.href = 'connexion.html';
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    });

    // Initialisation
    updateProgress();
});