// ========================================
// SCRIPT SIMPLE POUR INSCRIPTION EMPLOYEUR
// ========================================

document.addEventListener('DOMContentLoaded', function () {

    // Soumission du formulaire
    const form = document.getElementById('employeurForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email')?.value?.trim();
            const nomEntreprise = document.getElementById('nomEntreprise')?.value?.trim();
            const nomComplet = document.getElementById('nomComplet')?.value?.trim();
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            console.log('Email:', email);
            console.log('Entreprise:', nomEntreprise);
            console.log('Password length:', password?.length);

            if (!email || !nomEntreprise) {
                alert('Veuillez remplir Email et Nom entreprise');
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
                console.log('Envoi du formulaire...');

                const response = await fetch('api.php?action=register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        role: 'employeur',
                        name: nomComplet || 'N/A',
                        company: nomEntreprise
                    })
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Response data:', data);

                if (data.success) {
                    alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
                    window.location.href = 'connexion.html';
                } else {
                    alert('Erreur: ' + (data.message || 'Erreur inconnue'));
                }
            } catch (error) {
                console.error('Erreur complète:', error);
                alert('Erreur de connexion:\n' + error.message + '\n\nAssurez-vous que:\n1. Le serveur PHP est démarré\n2. Les fichiers sont dans C:\\wamp64\\www\\careerpropulse\\');
            }
        });
    }
});