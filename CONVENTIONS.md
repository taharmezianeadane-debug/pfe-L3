# 🔧 CONVENTIONS DE CODE - CareerPropulse

## 📐 Standards PHP

### Noms de variables & fonctions
```php
// ✅ BON
$firstName = "Ahmed";
function getUserById($id) {}
const MAX_LOGIN_ATTEMPTS = 5;

// ❌ MAUVAIS
$first_name = "Ahmed";  // Utiliser camelCase
$fn = "Ahmed";          // Noms explicites obligatoires
function fgubid() {}     // Fonctions incompréhensibles
```

### Gestion des erreurs
```php
// ✅ BON
try {
    $user = getUserById($id);
    if (!$user) {
        respond(404, ['success' => false, 'message' => 'Utilisateur non trouvé']);
    }
} catch (Exception $e) {
    respond(500, ['success' => false, 'message' => 'Erreur serveur']);
    error_log($e->getMessage());
}

// ❌ MAUVAIS
$user = $pdo->query("SELECT * FROM users WHERE id = $id");  // SQL Injection!
die('Erreur');  // Pas d'output JSON
```

### Validation & Sanitisation
```php
// ✅ BON
$email = sanitize($data['email'], 'email');
if (!validateInput($email, 'email')) {
    respond(400, ['success' => false, 'message' => 'Email invalide']);
}

// ❌ MAUVAIS
$email = $data['email'];  // Pas de sanitisation
$query = "SELECT * FROM users WHERE email = '$email'";  // SQL Injection potentielle
```

---

## 🎨 Standards JavaScript

### Noms & Conventions
```javascript
// ✅ BON
const userEmail = "ahmed@test.com";
async function login(credentials) {}
const MAX_RETRY_ATTEMPTS = 3;

// ❌ MAUVAIS
const user_email = "ahmed@test.com";  // camelCase obligatoire
function f() {}                       // Fonction incompréhensible
alert("Erreur");                      // alert() interdit
console.log("Debug");                 // console.log seulement dev
```

### Gestion AJAX
```javascript
// ✅ BON - Utiliser api-client.js
try {
    const result = await api.get('get_profile');
    displayProfile(result.profile);
} catch (error) {
    showToast(error.message, 'error');
    // Pas de console.log
}

// ❌ MAUVAIS
fetch('api.php?action=get_profile')
    .then(r => r.json())
    .then(d => console.log(d))  // Log production
    .catch(e => alert(e.message));  // alert() interdit
```

### Échappement XSS
```javascript
// ✅ BON
const html = `<div>${api.escapeHtml(offer.title)}</div>`;

// ❌ MAUVAIS
const html = `<div>${offer.title}</div>`;  // XSS vulnerability
element.innerHTML = userInput;             // Très dangereux
```

---

## 🎯 Standards CSS

### Utiliser les variables
```css
/* ✅ BON */
:root {
    --bleu-profond: #0a2540;
    --vert-emeraude: #00b4a5;
}

.button {
    background: var(--vert-emeraude);
    transition: var(--transition-douce);
}

/* ❌ MAUVAIS */
.button {
    background: #00b4a5;     /* Couleur en dur */
    color: #0a2540;          /* Couleur en dur */
    transition: all 0.3s;    /* Pas de variable */
}
```

### Organisation CSS
```css
/* 1. HEADER */
.header { ... }
.nav-container { ... }

/* 2. MAIN CONTENT */
.main-content { ... }

/* 3. FORMS */
.form-group { ... }

/* 4. BUTTONS */
.btn-primary { ... }

/* 5. RESPONSIVE */
@media (max-width: 768px) { ... }
```

---

## 📋 Fichier Structure

```
pfe-L3-main/
├── styles/
│   └── global.css           # ✅ Couleurs centralisées
├── js/
│   └── api-client.js        # ✅ AJAX centralisé
├── api.php                  # Backend API
├── connexion.html           # Pages publiques
└── [autres pages]
```

### Imports Obligatoires

**Tous les fichiers HTML doivent inclure :**
```html
<link rel="stylesheet" href="styles/global.css">
<script src="js/api-client.js"></script>
<meta name="csrf-token" content="">
```

**Tous les fichiers JS doivent :**
```javascript
// Utiliser l'api client centralisé
const result = await api.get('action');
// Afficher messages avec toast
showToast('Message', 'success');
// Échapper HTML
api.escapeHtml(userInput);
```

---

## ✅ Checklist Avant Commit

### PHP
- [ ] Pas de SQL injection (utiliser prepared statements)
- [ ] Sanitisation avec `sanitize()` ou `htmlspecialchars()`
- [ ] Validation avec `validateInput()`
- [ ] Réponses JSON avec `respond()`
- [ ] Pas d'`echo` ou `die()` en dehors d'erreurs

### JavaScript
- [ ] Pas de `console.log()` (sauf développement)
- [ ] Pas d'`alert()` (utiliser `showToast()`)
- [ ] Utiliser `api-client.js` pour AJAX
- [ ] Échapper avec `api.escapeHtml()`
- [ ] Gestion erreurs dans try/catch

### CSS
- [ ] Utiliser variables `:root`
- [ ] Pas de couleurs en dur
- [ ] Pas de transitions inline
- [ ] Classes réutilisables

### HTML
- [ ] Include global.css
- [ ] Include api-client.js
- [ ] Meta CSRF token présent
- [ ] Navbar cohérente

---

## 🔒 Sécurité Obligatoire

### Login/Register
```javascript
// ✅ Valider côté client
if (!api.validateEmail(email)) {
    showToast('Email invalide', 'error');
    return;
}

if (!api.validatePassword(password)) {
    showToast('Mot de passe minimum 6 caractères', 'error');
    return;
}

// Puis laisser serveur valider aussi
```

### AJAX
```javascript
// CSRF Token automatique via api-client.js
const result = await api.post('add_offer', data);
// Le token est envoyé automatiquement dans headers
```

### Output
```php
// ✅ Toujours échapper
echo htmlspecialchars($user['email']);

// ❌ Jamais
echo $user['email'];  // XSS vulnerability
```

---

## 📝 Commentaires

```php
// ✅ BON
/**
 * Récupère les offres compatibles avec le candidat
 * @param int $candidateId  ID du candidat
 * @return array           Tableau d'offres
 */
function getCompatibleOffers($candidateId) {}

// ❌ MAUVAIS
// get offers
function gO() {}
```

---

## 🧪 Testing Obligatoire

Avant de commit, tester :
- [ ] CSRF token validation
- [ ] XSS prevention (tester avec `<script>alert(1)</script>`)
- [ ] SQL injection (tester avec `' OR '1'='1`)
- [ ] Authentication (non-logged users)
- [ ] Authorization (mauvais role)

---

## 📞 Questions ?

Pour toute question sur les conventions, voir `AUDIT-ORGANISATION.md`
