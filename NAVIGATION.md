# 🗺️ FLUX DE NAVIGATION - CareerPropulse

## 📊 Architecture Navigation

```
INDEX.HTML (Accueil - Publique)
    ├── Non connecté
    │   ├── → Connexion.HTML (Login)
    │   │   ├── Login CANDIDAT → API → Dimension_Candidat.HTML ✓
    │   │   └── Login EMPLOYEUR → API → Dimension_Employeur.HTML ✓
    │   │
    │   └── → Inscription_Employer.HTML (Candidat)
    │       └── Register → API → Connexion.HTML → Login
    │
    └── Connecté
        ├── CANDIDAT
        │   ├── Dimension_Candidat.HTML (Offres) ← HomePage
        │   ├── Candidatures_Candidat.HTML (Mes candidatures)
        │   ├── Profil_Candidat.HTML (Mon profil)
        │   └── Logout → Index.HTML
        │
        └── EMPLOYEUR
            ├── Espace_Employeur.PHP → Dimension_Employeur.HTML (Mes offres)
            ├── Profil_Employeur.HTML (Mon profil)
            ├── Postulations_Employeur.HTML (Candidaatures reçues)
            └── Logout → Index.HTML
```

---

## 🔄 Flux Détaillé

### 1️⃣ CANDIDAT - Voir Offres

**Page**: `dimension_candidat.html`
**JWT**: ✅ Requiert authentification

```
1. Candidat se connecte via connexion.html
   → api.php?action=login (POST)
   → Session établie + JWT situé

2. Redirect vers dimension_candidat.html
   → DOMContentLoaded déclenche initializeInterface()
   → Appelle api.get('get_profile')
   → Affiche prenom + nom en navbar

3. Charge les offres
   → Appelle api.get('get_offers')
   → Filtre offres compatibles côté serveur
   → Affiche avec badge de match %

4. Candidat clique "Postuler"
   → Appelle api.post('apply_to_offer', {offer_id})
   → Enregistre candidature
   → Affiche toast succès
```

**Data Flow**:
```
connexion.html 
    → Login Authentication
    → Dimension_Candidat.html
    → Get Profile (Navigation)
    → Get Offers (Contenu)
    → Apply to Offer (Interaction)
```

---

### 2️⃣ CANDIDAT - Mes Candidatures

**Page**: `candidatures_candidat.html`
**JWT**: ✅ Requiert authentification

```
1. Candidat clique "Mes candidatures" en navbar
   → candidatures_candidat.html
   → DOMContentLoaded déclenche loadApplications()
   
2. Appelle api.get('get_my_applications')
   → Affiche liste candidatures
   → Statuts: pending, accepted, rejected

3. Peut retirer candidature (si bouton présent)
```

---

### 3️⃣ CANDIDAT - Profil

**Page**: `profil_candidat.html`
**JWT**: ✅ Requiert authentification

```
1. Candidat clique "Mon Profil" en navbar
   → profil_candidat.html
   → Appelle api.get('get_profile')
   
2. Affiche CV complet
   → Compétences
   → Langues
   → Formations
   → Expériences

3. peut modifier profil (si bouton présent)
   → api.post('update_profile', data)
```

---

### 4️⃣ EMPLOYEUR - Ajouter Offre

**Page**: `dimension_employeur.html`
**JWT**: ✅ Requiert authentification + role:employeur

```
1. Employeur se connecte via connexion.html
   → Sélectionne role: "employeur"
   → api.php?action=login (POST)
   
2. Redirect vers espace_employeur.php
   → Redirige vers dimension_employeur.html
   
3. Remplit formulaire offre
   → Titre, Domaine, Localisation
   → Comptes requises (multi-select)
   → Langues requises
   → Diplôme requis
   
4. Clique "Créer l'offre"
   → api.post('add_offer', formData)
   → Offre enregistrée
   → Toast succès
   → Liste offres mise à jour
```

---

### 5️⃣ EMPLOYEUR - Postulations

**Page**: `postulations_employeur.html`
**JWT**: ✅ Requiert authentification + role:employeur

```
1. Employeur clique "Postulations" en navbar
   → postulations_employeur.html

2. Charge candidatures reçues
   → api.get('get_applications')
   → Affiche tableau candidats + offres

3. Peut accepter/rejeter
   → Clique bouton "Accepter" ou "Rejeter"
   → api.post('update_application_status', {id, status})
   → Toast confirmation
```

---

## 🔐 Garde d'Authentification

### Structure Garde

```javascript
// Dans auth-guard.js
class AuthGuard {
    // Vérifie si utilisateur connecté
    static isAuthenticated()
    
    // Vérifie role
    static hasRole(role)
    
    // Redirige si pas connecté
    static requireAuth()
    
    // Redirige si mauvais role
    static requireRole(role)
}
```

### Implémentation

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Sur pages protégées
    AuthGuard.requireAuth();  // Redirige si pas connecté
    
    // Sur pages spéciales
    AuthGuard.requireRole('employeur');  // Redirige si pas employeur
});
```

---

## 🚦 Code de Status HTTP

| Code | Signification | Action |
|------|---------------|--------|
| **200** | Succès | Continuer |
| **201** | Créé | Créé avec succès |
| **400** | Requête invalide | Afficher erreur à user |
| **401** | Non authentifié | Redirect vers login |
| **403** | Accès interdit | Afficher erreur + redirect |
| **404** | Non trouvé | Afficher pas trouvé |
| **500** | Erreur serveur | Afficher erreur générique |

---

## 🔗 URLs Finales

### Publiques
```
GET  /index.html
GET  /connexion.html
GET  /inscription_employer.html
POST /api.php?action=login
POST /api.php?action=register
GET  /api.php?action=get_csrf_token
```

### Candidat (Authentifié)
```
GET  /dimension_candidat.html
GET  /candidatures_candidat.html
GET  /profil_candidat.html
GET  /api.php?action=get_profile
GET  /api.php?action=get_offers
POST /api.php?action=apply_to_offer
GET  /api.php?action=get_my_applications
POST /api.php?action=update_profile
```

### Employeur (Authentifié)
```
GET  /dimension_employeur.html
GET  /profil_employeur.html
GET  /postulations_employeur.html
GET  /api.php?action=get_profile
POST /api.php?action=add_offer
GET  /api.php?action=get_employer_offers
GET  /api.php?action=get_applications
POST /api.php?action=update_application_status
POST /api.php?action=update_profile
```

---

## ✅ Checklist Navigation

- [ ] Connexion redirects vers bonne page (candidat vs employeur)
- [ ] Navbar affiche usuario connecté
- [ ] Liens navbar actifs pointent vers bonne page
- [ ] Logout efface session + redirect index
- [ ] Non-connectés redirigés vers connexion
- [ ] Employeurs ne peuvent pas accéder pages candidat
- [ ] Candidats ne peuvent pas accéder pages employeur

---

## 🐛 Debugging Navigation

### Vérifier connexion
```javascript
// Console: F12
api.get('get_profile').then(d => console.log(d));
```

### Vérifier rôle
```javascript
// Console: F12  
fetch('api.php?action=get_profile')
    .then(r => r.json())
    .then(d => console.log('Role:', d.profile.role));
```

### Test redirect
```javascript
// Logout et attendre redirect
localStorage.clear();
sessionStorage.clear();
location.href = 'logout.php';
```

---

## 🎯 Optimisation À Venir

- [ ] Route historique avec paramètres (ex: offre.html?id=5)
- [ ] Pagination offres (limit, offset)
- [ ] Filtrage avancé offres
- [ ] Recherche offres temps réel
- [ ] Notifications websocket
