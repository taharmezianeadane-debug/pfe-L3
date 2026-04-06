# 🔧 GUIDE DE DÉBOGAGE - "Action non reconnue"

## ⚠️ Problème: Erreur "Action non reconnue"

Cela signifie que l'API ne reconnaît pas l'action demandée. Les causes possibles:

1. ❌ Les données test ne sont pas créées
2. ❌ La session n'existe pas (pas authentifié)
3. ❌ L'action n'existe pas dans api.php
4. ❌ Paramètre GET/POST mal formaté

---

## 🧪 DÉMARCHE DE DÉBOGAGE

### ÉTAPE 1: Vérifier la Base de Données

Accédez à:
```
http://localhost/pfe-L3-main/debug.php
```

**Checklist:**
- [ ] ✅ Connection réussie
- [ ] ✅ Tables trouvées (cv-employe, cv-employeur, job_offers...)
- [ ] ✅ Compte candidat existe
- [ ] ✅ Compte employeur existe
- [ ] ✅ Offres trouvées

**Si quelque chose est ❌ rouge:**
```
Accédez à: http://localhost/pfe-L3-main/create-test-data.php
Cela créera automatiquement tous les comptes et les offres
```

---

### ÉTAPE 2: Tester le Login

Accédez à:
```
http://localhost/pfe-L3-main/test-login.php
```

**Checklist:**
- [ ] ✅ Compte candidat trouvé
- [ ] ✅ Mot de passe correct
- [ ] ✅ Session créée
- [ ] ✅ Compte employeur trouvé

**Si quelque chose échoue:**
```
1. Re-créer les comptes: http://localhost/pfe-L3-main/create-test-data.php
2. Attendre que la page se charge complètement
3. Rafraîchir la page
```

---

### ÉTAPE 3: Tester les Actions API Directement

Ouvrez votre navigateur et testez ces URLs:

**1. Récupérer Token CSRF (public, pas d'auth):**
```
http://localhost/pfe-L3-main/api.php?action=get_csrf_token
```
Résultat attendu:
```json
{"success": true, "csrf_token": "..."}
```

**2. Récupérer Offres (public, pas d'auth):**
```
http://localhost/pfe-L3-main/api.php?action=get_offers
```
Résultat attendu:
```json
{"success": true, "offers": [...]}
```

**Si vous recevez "Action non reconnue":**
```
1. Vérifiez l'URL exactement (typo?)
2. Vérifiez que api.php existe
3. Vérifiez que l'action existe dans api.php
```

---

### ÉTAPE 4: Vérifier les Actions dans api.php

Ouvrez [api.php](api.php) et cherchez ces lignes:

```php
if ($action === 'login')              // ✅ Doit exister
if ($action === 'get_profile')        // ✅ Doit exister
if ($action === 'get_offers')         // ✅ Doit exister
if ($action === 'get_my_applications') // ✅ Doit exister
```

**Si une action manque:**
```
Le script d'action est probablement corrompu.
Contactez le développeur pour le corriger.
```

---

### ÉTAPE 5: Tester le Login Complet

1. Allez à: `connexion.html`
2. Remplissez:
   - Email: `candidat@test.com`
   - Password: `pass123456`
   - Role: `Candidat`
3. Cliquez "Se connecter"

**Résultats possibles:**

✅ **SUCCÈS:**
```
Redirection vers: dimension_candidat.html
Session créée dans le navigateur
```

❌ **ERREUR "Action non reconnue":**
```
Cela signifie que l'action 'login' n'a pas été trouvée dans api.php.
Vérifiez l'étape 4 ci-dessus.
```

❌ **ERREUR "Email ou mot de passe incorrect":**
```
Les données test n'existent pas ou sont mal formatées.
Allez à: create-test-data.php
```

---

## 📋 CHECKLIST COMPLÈTE DE DÉGOGEMENT

```
❌ → À corriger
✅ → OK, continuer

Étape 1 - Base de données:
  [ ] ✅ Connection réussie
  [ ] ✅ Tables existent
  [ ] ✅ Compte candidat existe
  [ ] ✅ Compte employeur existe
  [ ] ✅ Offres existent

Étape 2 - Login:
  [ ] ✅ Candidat trouvé
  [ ] ✅ Mot de passe candidat bon
  [ ] ✅ Employer trouvé
  [ ] ✅ Mot de passe employer bon

Étape 3 - API Direct:
  [ ] ✅ get_csrf_token fonctionne
  [ ] ✅ get_offers fonctionne
  [ ] ✅ Pas d'erreur "Action non reconnue"

Étape 4 - Actions dans api.php:
  [ ] ✅ login existe
  [ ] ✅ get_profile existe
  [ ] ✅ get_offers existe
  [ ] ✅ get_my_applications existe

Étape 5 - Connexion:
  [ ] ✅ Login réussit
  [ ] ✅ Redirection vers dimension_candidat.html
  [ ] ✅ Session créée
```

---

## 🚀 SI TOUT EST ✅

Alors vous pouvez:
```
1. Aller à: dimension_candidat.html
2. Voir les offres affichées
3. Cliquer sur les liens de navbar
4. Tester tutes les fonctionnalités
```

---

## 🆘 SI RIEN N'AIDE

**Collectez ces informations:**
1. Screenshot du message d'erreur exact
2. Screenshot de debug.php
3. Screenshot de test-login.php
4. L'action exacte que vous testiez

Envoyez-les au développeur pour investigation.

---

**Bon débogage!** 🎉

