# ✅ SOLUTION RAPIDE - "Action non reconnue"

## 🔴 PROBLÈME
Vous voyez: **"Action non reconnue"** au lieu des données

---

## 🟢 SOLUTION RAPIDE (3 ÉTAPES)

### ÉTAPE 1: Créer les Données Test
```
Accédez à: http://localhost/pfe-L3-main/create-test-data.php
↳ Cela crée automatiquement les 2 comptes + 3 offres
↳ Attendez que la page affiche ✅ partout
↳ Rafraîchissez la page
```

### ÉTAPE 2: Vérifier les Données
```
Accédez à: http://localhost/pfe-L3-main/debug.php
↳ Vérifiez que TOUT est ✅ vert
↳ Si non, encore ✅ create-test-data.php
↳ Rafraîchissez toutes les pages
```

### ÉTAPE 3: Tester la Connexion
```
Accédez à: http://localhost/pfe-L3-main/connexion.html
↳ Email: candidat@test.com
↳ Pass: pass123456
↳ Cliquez "Se connecter"
↳ Vous devriez être redirigé vers dimension_candidat.html
```

---

## 📊 VÉ RIFICATION FINALE

Si ça marche:
```
✅ Vous allez voir 2 offres d'emploi
✅ La navbar affiche: "Offres disponibles" (actif)
✅ Vous pouvez cliquer les autres liens de la navbar
✅ Aucune erreur dans la console (F12)
```

Si ça ne marche pas:
```
❌ Ouvrez: http://localhost/pfe-L3-main/debug.php
❌ Cherchez les éléments ❌ rouges
❌ Relancez create-test-data.php
❌ Rafraîchissez (Ctrl+F5)
```

---

## 🔗 LIENS IMPORTANTS

| Lien | Fonction |
|------|----------|
| [create-test-data.php](create-test-data.php) | Créer comptes + offres |
| [debug.php](debug.php) | Vérifier tout |
| [test-login.php](test-login.php) | Tester login |
| [connexion.html](connexion.html) | Se connecter |
| [api.php?action=get_offers](api.php?action=get_offers) | Tester API directement |

---

## 💡 ASTUCES DE DÉBOGAGE

**Si vous ne voyez rien qui change:**
```
Appuyez sur: F5 (rafraîchir)
Puis: Ctrl+Shift+Delete (vider cache)
Puis: Ctrl+F5 (rafraîchir hard)
Puis: Rouvrez le site
```

**Si l'erreur persiste:**
```
Ouvrez DevTools: F12
Allez dans l'onglet: Console
Cherchez les erreurs rouges
Prenez un screenshot et envoyez-le
```

**Pour voir l'erreur exacte:**
```
Allez à: debug.php
Ouvrez votre navigateur DevTools (F12)
Allez dans l'onglet: Network
Cliquez sur connexion.html
Cherchez l'erreur dans les requêtes
```

---

**Essayez ces 3 étapes maintenant!** 🎯

