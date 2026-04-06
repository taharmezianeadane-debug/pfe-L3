# 🚀 CAREERPROPULSE - GUIDE DE DÉMARRAGE

## ✅ VÉRIFICATION COMPLÉTÉE

```
✅ Fichiers PHP:        api.php, config.php, install.php, logout.php
✅ Fichiers HTML:       connexion.html, dimension_candidat.html, dimension_employeur.html
✅ Fichiers JS:         js/api-client.js, connexion.js, dimension_candidat.js, espace-employeur.js
✅ Fichiers CSS:        styles/global.css + fichiers spécifiques
✅ Architecture:        Cohérente (HTML/JS/CSS/PHP)
✅ Sécurité:           CSRF, XSS, SQLi protection en place
```

---

## 📌 ÉTAPE 1: INITIALISER LA BASE DE DONNÉES

### Option A: Via PHP (Automatisé - RECOMMANDÉ)

Si vous avez WAMP/XAMPP en marche:

```
1. Ouvrir: http://localhost/pfe-L3-main/install.php
2. Suivre l'assistant 5 étapes
3. Cliquer "Installer CareerPropulse"
```

**Résultat:** Base de données créée + tables initialisées ✅

---

### Option B: Via MySQL (Manuel)

```bash
# Dans MySQL Workbench ou Adminer:

1. Créer la BD:
   CREATE DATABASE careerpropulse;

2. Charger le schéma:
   source careerpropulse.sql;

3. Insérer les données test:
   source setup-test-data.sql;
```

---

## 👥 ÉTAPE 2: CRÉER LES COMPTES TEST

### Compte CANDIDAT (déjà décrit dans SQL)

| Propriété | Valeur |
|-----------|--------|
| **Email** | `candidat@test.com` |
| **Password** | `pass123456` |
| **Nom** | Ahmed Saidane |
| **Diplôme** | Bac+3 (Licence) |
| **Skills** | JavaScript, PHP, MySQL, HTML, CSS, React, Node.js |
| **Langues** | Français, Anglais |

### Compte EMPLOYEUR (déjà décrit dans SQL)

| Propriété | Valeur |
|-----------|--------|
| **Email** | `employeur@test.com` |
| **Password** | `pass123456` |
| **Nom** | Tech Recruiter |
| **Entreprise** | TechCorp Solutions |
| **Poste** | HR Manager |

---

## 🌐 ÉTAPE 3: ACCÉDER AU SITE

### 🏠 Page d'Accueil
```
http://localhost/pfe-L3-main/index.html
```

### 🔐 Se Connecter
```
http://localhost/pfe-L3-main/connexion.html
```

### 👨‍💼 Dashboard Candidat (APRÈS LOGIN CANDIDAT)
```
http://localhost/pfe-L3-main/dimension_candidat.html
```

### 🏢 Dashboard Employeur (APRÈS LOGIN EMPLOYEUR)
```
http://localhost/pfe-L3-main/dimension_employeur.html
```

---

## 🧪 SCÉNARIOS DE TEST

### Scénario 1: Candidat Consulte Les Offres

```
1. Aller à: connexion.html
2. Choisir: "Candidat"
3. Email: candidat@test.com
4. Password: pass123456
5. Cliquer: "Se connecter"

✅ Résultat: 2 offres affichées (matching appliqué)
   - Développeur Web Full Stack (Paris) ✓
   - Developer Frontend React (Télétravail) ✓
   
   Non-affichée:
   - Architecte Senior (nécessite Java) ✗
```

---

### Scénario 2: Candidat Candidate À Une Offre

```
1. Depuis dimension_candidat.html
2. Cliquer: "Candidater" sur l'offre "Dev Web Full Stack"
3. Voir toast: "Candidature envoyée avec succès!"

✅ Résultat: Candidature créée en BD
```

---

### Scénario 3: Voir Mes Candidatures

```
1. Cliquer menu: "Mes candidatures"
2. Vérifier la candidature apparaît
3. Voir statut: "En attente"

✅ Résultat: Liste des candidatures affichée
```

---

### Scénario 4: Éditer Mon Profil Candidat

```
1. Cliquer menu: "Mon Profil"
2. Éditer: Ajouter/modifier compétences, langues, formations
3. Cliquer: "Sauvegarder"

✅ Résultat: Profil mis à jour en BD
```

---

### Scénario 5: Employeur Publie Une Offre

```
1. Aller à: connexion.html
2. Choisir: "Employeur"
3. Email: employeur@test.com
4. Password: pass123456
5. Cliquer: "Se connecter"
6. Remplir formulaire:
   - Titre: "Senior DevOps Engineer"
   - Domaine: "devops"
   - Localisation: "Lyon"
   - Skills: Docker, Kubernetes, AWS, Linux
   - Langues: Anglais
   - Diplôme: Bac+3
   - Type: CDI
7. Cliquer: "Créer l'offre"

✅ Résultat: Offre publiée visible en BD
```

---

### Scénario 6: Employeur Voit Candidatures

```
1. Depuis dimension_employeur.html
2. Cliquer: "Postulations"
3. Voir la candidature d'Ahmed Saidane

✅ Résultat: Liste des candidatures affichée
```

---

### Scénario 7: Employer Accepte/Rejette

```
1. Dans postulations-employeur.html
2. Voir candidature d'Ahmed
3. Cliquer: "Accepter" ou "Rejeter"
4. Voir toast: "Statut mis à jour!"

✅ Résultat: Statut changé en BD et visible côté candidat
```

---

## 📊 DONNÉES TEST CRÉÉES

### Offres d'Emploi
1. **Dev Web Full Stack** (Paris)
   - Skills: JavaScript, PHP, MySQL, HTML, CSS, React, Node.js
   - Langues: Français, Anglais
   - Diplôme: Bac+3
   - ✅ MATCH Ahmed Saidane

2. **Architecte Logiciel Senior** (Lyon)
   - Skills: Java, Spring, Docker, Kubernetes, AWS
   - Langues: Anglais, Chinois
   - Diplôme: Bac+5
   - ❌ NO MATCH Ahmed (manque Java, Docker, etc.)

3. **Developer Frontend React** (Télétravail)
   - Skills: JavaScript, HTML, CSS, React
   - Langues: Français
   - Diplôme: Bac+2
   - ✅ MATCH Ahmed Saidane

---

## 🔍 POINTS À VÉRIFIER

### ✅ Fonctionnalités Candidat
- [ ] Login/Logout fonctionnent
- [ ] Affichage offres filtrées (matching)
- [ ] Bouton "Candidater" fonctionne
- [ ] Vue "Mes Candidatures" montre candidatures
- [ ] Vue "Mon Profil" permet édition
- [ ] Navigation correcte entre pages
- [ ] Messages d'erreur appropriés
- [ ] Toast notifications affichées

### ✅ Fonctionnalités Employeur
- [ ] Login/Logout fonctionnent
- [ ] Liste offres existantes affichée
- [ ] Formulaire création offre fonctionne
- [ ] Offre créée apparaît dans la liste
- [ ] Vue "Postulations" affiche candidatures
- [ ] Accepter/Rejeter candidature fonctionne
- [ ] Navigation correcte entre pages

### ✅ Sécurité
- [ ] CSRF token présent dans meta
- [ ] Pas d'injection SQL (prepared statements)
- [ ] Pas d'XSS (escaping HTML)
- [ ] Sessions gérées correctement
- [ ] Passwords hachés (bcrypt)
- [ ] Logout détruit session

---

## 🛠️ FICHIERS UTILES

| Fichier | Fonction |
|---------|----------|
| **install.php** | Assistant d'installation 5 étapes |
| **setup-test-accounts.php** | Crée comptes test + offres automatiquement |
| **setup-test-data.sql** | SQL pour charger données test manuellement |
| **api.php** | Backend API REST gate |
| **config.php** | Configuration base de données |
| **connexion.html** | Page login |
| **dimension_candidat.html** | Dashboard candidat |
| **dimension_employeur.html** | Dashboard employeur |

---

## 📞 RÉSUMÉ RAPIDE

```
🌐 SITE:      http://localhost/pfe-L3-main/
🔐 LOGIN:     http://localhost/pfe-L3-main/connexion.html

👨‍💼 CANDIDAT:
   Email: candidat@test.com
   Pass:  pass123456

🏢 EMPLOYEUR:
   Email: employeur@test.com
   Pass:  pass123456
```

---

## 🎯 LOGIQUE DE MATCHING

Le système affiche SEULEMENT les offres où:

✅ Candidat possède TOUS les skills requis
✅ Candidat parle TOUTES les langues requises  
✅ Diplôme du candidat ≥ Diplôme requis

**Exemple:**
- Offreur demande: JavaS, PHP, MySQL
- Candidat a: JavaScript ✅, PHP ✅, MySQL ✅
- → OFFRE AFFICHÉE ✅

- Offreur demande: Java, Docker, Kubernetes
- Candidat a: JavaScript ✅, PHP ✅, MySQL ✅ (manque Java, Docker, Kubernetes)
- → OFFRE CACHÉE ❌

---

## 🚀 PRÊT À DÉMARRER!

```
1. ✅ Lancez install.php ou import setup-test-data.sql
2. ✅ Accédez à connexion.html
3. ✅ Testez avec les comptes ci-dessus
4. ✅ Amusez-vous!
```

Bon testing! 🎉
