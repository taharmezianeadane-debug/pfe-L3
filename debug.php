<?php
/**
 * Debug Script - Vérifier l'état de l'API
 * Accédez à: http://localhost/pfe-L3-main/debug.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Vérification de L'API CareerPropulse</h1>";
echo "<hr>";

// Check 1: Database Connection
echo "<h2>1️⃣ Vérification Base de Données</h2>";
try {
    include 'config.php';
    echo "<p style='color:green'>✅ Connection réussie</p>";
    
    $tables = $pdo->query("SHOW TABLES")->fetchAll();
    echo "<p>Tables trouvées: " . count($tables) . "</p>";
    foreach ($tables as $table) {
        echo "<li>" . $table[0] . "</li>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Check 2: Session
echo "<hr>";
echo "<h2>2️⃣ Vérification Session</h2>";
session_start();
echo "<p>Session ID: " . session_id() . "</p>";
echo "<p>\$_SESSION contents:</p>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";

// Check 3: Test Candidate Account
echo "<hr>";
echo "<h2>3️⃣ Vérification Compte CANDIDAT</h2>";
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM `cv-employe` WHERE email = ?");
    $stmt->execute(['candidat@test.com']);
    $result = $stmt->fetch();
    if ($result['cnt'] > 0) {
        echo "<p style='color:green'>✅ Compte candidat existe</p>";
    } else {
        echo "<p style='color:red'>❌ Compte candidat NOT FOUND</p>";
        echo "<p><a href='create-test-data.php'>Créer comptes test</a></p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Check 4: Test Employer Account
echo "<hr>";
echo "<h2>4️⃣ Vérification Compte EMPLOYEUR</h2>";
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM `cv-employeur` WHERE mail = ?");
    $stmt->execute(['employeur@test.com']);
    $result = $stmt->fetch();
    if ($result['cnt'] > 0) {
        echo "<p style='color:green'>✅ Compte employeur existe</p>";
    } else {
        echo "<p style='color:red'>❌ Compte employeur NOT FOUND</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Check 5: Job Offers
echo "<hr>";
echo "<h2>5️⃣ Vérification Offres d'Emploi</h2>";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM job_offers");
    $result = $stmt->fetch();
    echo "<p>Nombre d'offres: " . $result['cnt'] . "</p>";
    if ($result['cnt'] > 0) {
        echo "<p style='color:green'>✅ Offres trouvées</p>";
    } else {
        echo "<p style='color:orange'>⚠️ Pas d'offres (créez-les depuis le formulaire employeur)</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Check 6: API Test
echo "<hr>";
echo "<h2>6️⃣ Test Endpoint API</h2>";
echo "<p>Testez les actions manuellement:</p>";
echo "<ul>";
echo "<li><a href='api.php?action=get_csrf_token' target='_blank'>GET /api.php?action=get_csrf_token</a></li>";
echo "<li><a href='api.php?action=get_offers' target='_blank'>GET /api.php?action=get_offers</a></li>";
echo "</ul>";

echo "<hr>";
echo "<h2>🔗 Actions Disponibles dans api.php</h2>";
echo "<ul>";
echo "<li><code>get_csrf_token</code> - Récupérer token CSRF</li>";
echo "<li><code>login</code> - Connexion (POST)</li>";
echo "<li><code>register</code> - Inscription (POST)</li>";
echo "<li><code>logout</code> - Déconnexion</li>";
echo "<li><code>get_profile</code> - Mon profil (nécessite auth)</li>";
echo "<li><code>get_offers</code> - Liste offres (GET)</li>";
echo "<li><code>get_my_applications</code> - Mes candidatures (nécessite auth)</li>";
echo "<li><code>add_offer</code> - Créer offre (POST, nécessite auth employeur)</li>";
echo "<li><code>get_employer_offers</code> - Mes offres (nécessite auth employeur)</li>";
echo "<li><code>get_applications</code> - Applications reçues (nécessite auth employeur)</li>";
echo "</ul>";

echo "<hr>";
echo "<p style='background:#e8f5e9; padding:10px; border-radius:5px'>";
echo "<strong>Next Steps:</strong>";
echo "<ol>";
echo "<li>Vérifiez que tous les items ci-dessus sont ✅ verts</li>";
echo "<li>Si non, cliquez sur le lien pour créer les données</li>";
echo "<li>Ensuite testez <a href='connexion.html'>connexion.html</a></li>";
echo "</ol>";
echo "</p>";

?>
