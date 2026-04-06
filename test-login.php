<?php
/**
 * Test Login Script
 * Accédez à: http://localhost/pfe-L3-main/test-login.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧪 Test de Connexion</h1>";
echo "<hr>";

// Attempt login directly
include 'config.php';
session_start();

$email = 'candidat@test.com';
$password = 'pass123456';

echo "<h2>Test Candidat</h2>";
echo "<p><strong>Email:</strong> $email</p>";
echo "<p><strong>Password:</strong> $password</p>";

try {
    // Check if account exists
    $stmt = $pdo->prepare("SELECT * FROM `cv-employe` WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color:red'>❌ Compte NOT FOUND dans la BD</p>";
        echo "<p><a href='create-test-data.php'>Créer les comptes test</a></p>";
        exit;
    }
    
    echo "<p style='color:green'>✅ Compte trouvé</p>";
    echo "<p><strong>Données en BD:</strong></p>";
    echo "<pre>";
    echo "ID: " . $user['id'] . "\n";
    echo "Email: " . $user['email'] . "\n";
    echo "Nom: " . $user['prenom'] . " " . $user['nom'] . "\n";
    echo "Diplôme: " . $user['diplome'] . "\n";
    echo "Compétences: " . $user['competences'] . "\n";
    echo "Langues: " . $user['langues'] . "\n";
    echo "</pre>";
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        echo "<p style='color:green'>✅ Mot de passe correct</p>";
        
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = 'employe';
        
        echo "<p style='color:green'>✅ Session créée</p>";
        echo "<p>Session ID: " . session_id() . "</p>";
        
        // Test get_profile avec session
        echo "<h2>Test get_profile API</h2>";
        echo "<p>Tentative d'appel api.php?action=get_profile...</p>";
        
    } else {
        echo "<p style='color:red'>❌ Mot de passe incorrect</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<h2>Employer Test</h2>";

$email_emp = 'employeur@test.com';
$password_emp = 'pass123456';

try {
    $stmt = $pdo->prepare("SELECT * FROM `cv-employeur` WHERE mail = ?");
    $stmt->execute([$email_emp]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color:red'>❌ Compte employeur NOT FOUND</p>";
        exit;
    }
    
    echo "<p style='color:green'>✅ Compte employeur trouvé</p>";
    
    if (password_verify($password_emp, $user['password'])) {
        echo "<p style='color:green'>✅ Mot de passe correct</p>";
    } else {
        echo "<p style='color:red'>❌ Mot de passe incorrect</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<p><a href='connexion.html' class='btn' style='padding:10px 20px; background:#00b4a5; color:white; border-radius:5px; text-decoration:none'>Retour à Connexion</a></p>";

?>
