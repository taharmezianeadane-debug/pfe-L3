<?php
/**
 * Setup Test Accounts & Data
 * Creates test candidate and employer accounts for demonstration
 */

header('Content-Type: application/json');

include 'config.php';

try {
    // ============================================
    // 1. VERIFY DATABASE STRUCTURE
    // ============================================
    
    echo "🔍 Vérification de la base de données...\n\n";
    
    // Check if tables exist
    $tables = ['`cv-employe`', '`cv-employeur`', 'job_offers', 'applications'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE {$pdo->quote(trim($table, '`'))}");
        $exists = $stmt->rowCount() > 0;
        echo "✅ Table $table: " . ($exists ? "EXISTE" : "MISSING") . "\n";
    }
    
    echo "\n";
    
    // ============================================
    // 2. CREATE TEST ACCOUNTS
    // ============================================
    
    echo "👤 Création des comptes test...\n\n";
    
    // Clear existing test accounts
    $pdo->exec("DELETE FROM `cv-employe` WHERE email IN ('candidat@test.com')");
    $pdo->exec("DELETE FROM `cv-employeur` WHERE mail IN ('employeur@test.com')");
    
    // Test Candidate Account
    $candidatEmail = 'candidat@test.com';
    $candidatPassword = password_hash('pass123456', PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("
        INSERT INTO `cv-employe` 
        (email, password, prenom, nom, diplome, skills, langues, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $candidatEmail,
        $candidatPassword,
        'Ahmed',
        'Saidane',
        'bac+3',
        'javascript,php,mysql,html,css,react,nodejs',
        'francais,anglais'
    ]);
    
    echo "✅ Compte CANDIDAT créé:\n";
    echo "   Email: candidat@test.com\n";
    echo "   Password: pass123456\n";
    echo "   Nom: Ahmed Saidane\n";
    echo "   Diplôme: Bac+3 (Licence)\n";
    echo "   Skills: JavaScript, PHP, MySQL, HTML, CSS, React, Node.js\n";
    echo "   Langues: Français, Anglais\n\n";
    
    // Test Employer Account
    $employeurEmail = 'employeur@test.com';
    $employeurPassword = password_hash('pass123456', PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("
        INSERT INTO `cv-employeur` 
        (mail, password, name, company, poste, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $employeurEmail,
        $employeurPassword,
        'Tech Recruiter',
        'TechCorp Solutions',
        'HR Manager'
    ]);
    
    echo "✅ Compte EMPLOYEUR créé:\n";
    echo "   Email: employeur@test.com\n";
    echo "   Password: pass123456\n";
    echo "   Nom: Tech Recruiter\n";
    echo "   Entreprise: TechCorp Solutions\n";
    echo "   Poste: HR Manager\n\n";
    
    // ============================================
    // 3. CREATE TEST JOB OFFERS
    // ============================================
    
    echo "📢 Création des offres d'emploi test...\n\n";
    
    // Get employer ID
    $stmt = $pdo->prepare("SELECT id FROM `cv-employeur` WHERE mail = ?");
    $stmt->execute([$employeurEmail]);
    $employer = $stmt->fetch();
    $employerId = $employer['id'] ?? 1;
    
    // Clear old test offers
    $pdo->exec("DELETE FROM job_offers WHERE employer_id = $employerId");
    
    // Offer 1: Dev Web
    $stmt = $pdo->prepare("
        INSERT INTO job_offers 
        (employer_id, title, description, location, domaine, competences_requises, langues_requises, diplome_requis, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
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
    
    echo "✅ Offre 1 créée: Développeur Web Full Stack (Paris)\n";
    echo "   Skills requis: JavaScript, PHP, MySQL, HTML, CSS, React, Node.js\n";
    echo "   Langues: Français, Anglais\n";
    echo "   Diplôme: Bac+3\n";
    echo "   ✓ MATCH avec candidat Ahmed Saidane\n\n";
    
    // Offer 2: Senior Dev (non-match)
    $stmt->execute([
        $employerId,
        'Architecte Logiciel Senior',
        'Nous cherchons un architecte avec 10 ans d\'expérience en architecture logiciel complexe.',
        'Lyon',
        'backend',
        'java,spring,docker,kubernetes,aws',
        'anglais,chin',
        'bac+5'
    ]);
    
    echo "❌ Offre 2 créée: Architecte Logiciel Senior (Lyon)\n";
    echo "   Skills requis: Java, Spring, Docker, Kubernetes, AWS\n";
    echo "   Langues: Anglais, Chinois\n";
    echo "   Diplôme: Bac+5\n";
    echo "   ✗ NON-MATCH avec candidat (manque Java, Docker, etc.)\n\n";
    
    // Offer 3: Frontend
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
    
    echo "✅ Offre 3 créée: Developer Frontend React (Télétravail)\n";
    echo "   Skills requis: JavaScript, HTML, CSS, React\n";
    echo "   Langues: Français\n";
    echo "   Diplôme: Bac+2\n";
    echo "   ✓ MATCH avec candidat Ahmed Saidane\n\n";
    
    // ============================================
    // 4. SUMMARY
    // ============================================
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "✅ SETUP COMPLET!\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    echo "📌 ACCÈS AU SITE:\n";
    echo "URL: http://localhost/pfe-L3-main/connexion.html\n\n";
    
    echo "👨‍💼 COMPTE CANDIDAT:\n";
    echo "  Email: candidat@test.com\n";
    echo "  Password: pass123456\n\n";
    
    echo "🏢 COMPTE EMPLOYEUR:\n";
    echo "  Email: employeur@test.com\n";
    echo "  Password: pass123456\n\n";
    
    echo "📊 DONNÉES TEST CRÉÉES:\n";
    echo "  • 2 comptes (candidat + employeur)\n";
    echo "  • 3 offres d'emploi\n";
    echo "  • 2 offres compatibles avec le candidat\n";
    echo "  • 1 offre non-compatible\n\n";
    
    echo "🧪 POUR TESTER:\n";
    echo "  1. Connexion candidat → Voire ses 2 offres matchées\n";
    echo "  2. Cliquer 'Candidater' sur une offre\n";
    echo "  3. Vérifier dans 'Mes Candidatures'\n";
    echo "  4. Connexion employeur → Voir candidature reçue\n";
    echo "  5. Accepter/Rejeter candidature\n\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . htmlspecialchars($e->getMessage()) . "\n";
    exit(1);
}
?>
