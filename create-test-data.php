<?php
/**
 * Script pour créer les comptes test automatiquement
 * Accédez à: http://localhost/pfe-L3-main/create-test-data.php
 */

header('Content-Type: text/html; charset=utf-8');
include 'config.php';

try {
    echo "<h1>✅ Création des Données Test</h1>";
    echo "<hr>";
    
    // Vérifier que la BD existe
    $tables = $pdo->query("SHOW TABLES")->fetchAll();
    if (empty($tables)) {
        echo "<p style='color:red'>❌ Erreur: Base de données vide. Lancez install.php d'abord!</p>";
        exit;
    }
    
    echo "<p>✅ Base de données vérifiée</p>";
    
    // Nettoyer les anciennes données test
    echo "<p>🧹 Nettoyage des anciennes données...</p>";
    $pdo->exec("DELETE FROM `cv-employe` WHERE email IN ('candidat@test.com')");
    $pdo->exec("DELETE FROM `cv-employeur` WHERE mail IN ('employeur@test.com')");
    
    echo "<p>✅ Anciennes données supprimées</p>";
    
    // ============================================
    // CRÉER COMPTE CANDIDAT
    // ============================================
    echo "<hr>";
    echo "<h2>👨‍💼 Création Compte CANDIDAT</h2>";
    
    $candidatPassword = password_hash('pass123456', PASSWORD_BCRYPT);
    
    $sql = "
        INSERT INTO `cv-employe` 
        (email, password, prenom, nom, diplome, skills, langues, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'candidat@test.com',
        $candidatPassword,
        'Ahmed',
        'Saidane',
        'bac+3',
        'javascript,php,mysql,html,css,react,nodejs',
        'francais,anglais'
    ]);
    
    echo "<p>✅ Compte candidat créé:</p>";
    echo "<ul>";
    echo "<li><strong>Email:</strong> candidat@test.com</li>";
    echo "<li><strong>Password:</strong> pass123456</li>";
    echo "<li><strong>Nom:</strong> Ahmed Saidane</li>";
    echo "<li><strong>Diplôme:</strong> Bac+3</li>";
    echo "<li><strong>Skills:</strong> JavaScript, PHP, MySQL, HTML, CSS, React, Node.js</li>";
    echo "<li><strong>Langues:</strong> Français, Anglais</li>";
    echo "</ul>";
    
    // ============================================
    // CRÉER COMPTE EMPLOYEUR
    // ============================================
    echo "<hr>";
    echo "<h2>🏢 Création Compte EMPLOYEUR</h2>";
    
    $employeurPassword = password_hash('pass123456', PASSWORD_BCRYPT);
    
    $sql = "
        INSERT INTO `cv-employeur` 
        (mail, password, name, company, poste, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'employeur@test.com',
        $employeurPassword,
        'Tech Recruiter',
        'TechCorp Solutions',
        'HR Manager'
    ]);
    
    echo "<p>✅ Compte employeur créé:</p>";
    echo "<ul>";
    echo "<li><strong>Email:</strong> employeur@test.com</li>";
    echo "<li><strong>Password:</strong> pass123456</li>";
    echo "<li><strong>Nom:</strong> Tech Recruiter</li>";
    echo "<li><strong>Entreprise:</strong> TechCorp Solutions</li>";
    echo "<li><strong>Poste:</strong> HR Manager</li>";
    echo "</ul>";
    
    // ============================================
    // CRÉER OFFRES D'EMPLOI
    // ============================================
    echo "<hr>";
    echo "<h2>📢 Création Offres d'Emploi</h2>";
    
    // Récupérer l'ID de l'employeur
    $stmt = $pdo->prepare("SELECT id FROM `cv-employeur` WHERE mail = ?");
    $stmt->execute(['employeur@test.com']);
    $employer = $stmt->fetch(PDO::FETCH_ASSOC);
    $employerId = $employer['id'] ?? 1;
    
    // Supprimer les anciennes offres de test
    $pdo->exec("DELETE FROM job_offers WHERE employer_id = " . intval($employerId));
    
    // Offre 1: Dev Web (MATCH)
    $sql = "
        INSERT INTO job_offers 
        (employer_id, title, description, location, domaine, competences_requises, langues_requises, diplome_requis, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $employerId,
        'Développeur Web Full Stack',
        'Nous recherchons un développeur web expérimenté pour rejoindre notre équipe dynamique.',
        'Paris',
        'backend',
        'javascript,php,mysql,html,css,react,nodejs',
        'francais,anglais',
        'bac+3'
    ]);
    
    echo "<p>✅ Offre 1: <strong>Dev Web Full Stack</strong> (Paris)</p>";
    echo "<ul style='font-size:0.9em'>";
    echo "<li>Skills: JavaScript, PHP, MySQL, HTML, CSS, React, Node.js</li>";
    echo "<li>Langues: Français, Anglais</li>";
    echo "<li>Diplôme: Bac+3</li>";
    echo "<li style='color:green'><strong>✓ MATCH</strong> avec Ahmed Saidane</li>";
    echo "</ul>";
    
    // Offre 2: Senior Architect (NO MATCH)
    $stmt->execute([
        $employerId,
        'Architecte Logiciel Senior',
        'Nous cherchons un architecte avec 10 ans d\'expérience en architecture logiciel complexe.',
        'Lyon',
        'backend',
        'java,spring,docker,kubernetes,aws',
        'anglais,chinois',
        'bac+5'
    ]);
    
    echo "<p>✅ Offre 2: <strong>Architecte Senior</strong> (Lyon)</p>";
    echo "<ul style='font-size:0.9em'>";
    echo "<li>Skills: Java, Spring, Docker, Kubernetes, AWS</li>";
    echo "<li>Langues: Anglais, Chinois</li>";
    echo "<li>Diplôme: Bac+5</li>";
    echo "<li style='color:red'><strong>✗ NO MATCH</strong> (manque Java, Docker, etc.)</li>";
    echo "</ul>";
    
    // Offre 3: Frontend (MATCH)
    $stmt->execute([
        $employerId,
        'Developer Frontend React',
        'Rejoignez notre équipe frontend pour développer des interfaces modernes et réactives.',
        'Télétravail',
        'frontend',
        'javascript,html,css,react',
        'francais',
        'bac+2'
    ]);
    
    echo "<p>✅ Offre 3: <strong>Developer Frontend React</strong> (Télétravail)</p>";
    echo "<ul style='font-size:0.9em'>";
    echo "<li>Skills: JavaScript, HTML, CSS, React</li>";
    echo "<li>Langues: Français</li>";
    echo "<li>Diplôme: Bac+2</li>";
    echo "<li style='color:green'><strong>✓ MATCH</strong> avec Ahmed Saidane</li>";
    echo "</ul>";
    
    // ============================================
    // RÉSUMÉ
    // ============================================
    echo "<hr>";
    echo "<h2>🎉 Setup Complète!</h2>";
    
    echo "<div style='background:#e8f5e9; padding:15px; border-radius:5px; margin:15px 0'>";
    echo "<h3>📌 Accès au Site:</h3>";
    echo "<p><strong>URL:</strong> <a href='http://localhost/pfe-L3-main/connexion.html' target='_blank'>http://localhost/pfe-L3-main/connexion.html</a></p>";
    
    echo "<h3>👨‍💼 Compte CANDIDAT:</h3>";
    echo "<p><code>Email: candidat@test.com</code></p>";
    echo "<p><code>Password: pass123456</code></p>";
    
    echo "<h3>🏢 Compte EMPLOYEUR:</h3>";
    echo "<p><code>Email: employeur@test.com</code></p>";
    echo "<p><code>Password: pass123456</code></p>";
    
    echo "<h3>📊 Données Créées:</h3>";
    echo "<ul>";
    echo "<li>2 comptes (1 candidat + 1 employeur)</li>";
    echo "<li>3 offres d'emploi</li>";
    echo "<li>2 offres compatibles avec le candidat</li>";
    echo "<li>1 offre non-compatible</li>";
    echo "</ul>";
    
    echo "<h3>🧪 Prêt à Tester!</h3>";
    echo "<p><a href='connexion.html' class='btn' style='padding:10px 20px; background:#00b4a5; color:white; border-radius:5px; text-decoration:none'>→ Aller à la page Connexion</a></p>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<p style='color:red'><strong>❌ ERREUR:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    exit(1);
}
?>
