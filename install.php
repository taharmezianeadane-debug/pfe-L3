<?php
/**
 * CareerPropulse - Installation & Configuration Wizard
 * 
 * Usage: http://localhost/pfe-L3-main/install.php
 * 
 * Cette page guide l'installation complète du système
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$step = $_GET['step'] ?? 1;
$message = '';
$error = '';

// ========================================
// ÉTAPE 1: Vérification Prérequis
// ========================================
if ($step == 1) {
    $checks = [
        'PHP 8.3+' => version_compare(PHP_VERSION, '8.3.0', '>='),
        'Extension PDO' => extension_loaded('pdo'),
        'Extension PDO MySQL' => extension_loaded('pdo_mysql'),
        'Extension JSON' => extension_loaded('json'),
        'Extension Session' => extension_loaded('session'),
    ];
    
    $dbConnected = false;
    try {
        require 'config.php';
        $pdo->query('SELECT 1');
        $dbConnected = true;
        $checks['MySQL 8.0+'] = true;
    } catch (Throwable $e) {
        $checks['MySQL 8.0+'] = false;
        $error = 'Impossible de se connecter à MySQL: ' . $e->getMessage();
    }
    
    $allChecked = array_reduce($checks, fn($carry, $item) => $carry && $item, true);
}

// ========================================
// ÉTAPE 2: Configuration Base de Données
// ========================================
if ($step == 2 && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        require 'config.php';
        
        // Lire et exécuter careerpropulse.sql
        $sqlFile = file_get_contents('careerpropulse.sql');
        $statements = preg_split('/;[\s]*\n/', $sqlFile);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement) && !preg_match('/^--|\/\*/', $statement)) {
                $pdo->exec($statement);
            }
        }
        
        $message = 'Schéma créé avec succès!';
        $step = 3;
    } catch (Throwable $e) {
        $error = 'Erreur lors de la création du schéma: ' . $e->getMessage();
    }
}

// ========================================
// ÉTAPE 3: Charger Données de Démo
// ========================================
if ($step == 3 && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        require 'config.php';
        
        // Charger données de démo
        $demoFile = file_get_contents('careerpropulse-seed-data.sql');
        $statements = preg_split('/;[\s]*\n/', $demoFile);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement) && !preg_match('/^--|\/\*/', $statement)) {
                $pdo->exec($statement);
            }
        }
        
        $message = 'Données de démo chargeées!';
        $step = 4;
    } catch (Throwable $e) {
        $error = 'Erreur lors du chargement des données: ' . $e->getMessage();
    }
}

// ========================================
// ÉTAPE 4: Finalisation
// ========================================
if ($step == 4 && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Marquer installation comme complète
    $_SESSION['installation_complete'] = true;
    $step = 5;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareerPropulse - Assistant Installation</title>
    <link rel="stylesheet" href="styles/global.css">
    <style>
        .install-container {
            max-width: 800px;
            margin: 3rem auto;
            padding: 2rem;
        }
        
        .install-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .step-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #00b4a5, #7ed9d0);
            color: white;
            border-radius: 50%;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .check-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            background: #f9fafb;
        }
        
        .check-item.success {
            background: #d1fae5;
            color: #065f46;
        }
        
        .check-item.error {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .check-icon {
            font-size: 1.5rem;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        
        .alert.success {
            background: #d1fae5;
            color: #065f46;
            border-left: 4px solid #10b981;
        }
        
        .alert.error {
            background: #fee2e2;
            color: #dc2626;
            border-left: 4px solid #ef4444;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .credentials {
            background: #f3f4f6;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #00b4a5;
        }
        
        .credential-item {
            margin-bottom: 1rem;
        }
        
        .credential-label {
            color: #6b7280;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .credential-value {
            font-family: monospace;
            background: white;
            padding: 0.5rem;
            border-radius: 4px;
            margin-top: 0.25rem;
            word-break: break-all;
        }
        
        .progress {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
        }
        
        .progress-item {
            flex: 1;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
        }
        
        .progress-item.complete {
            background: #10b981;
        }
        
        .next-step {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .btn {
            flex: 1;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #00b4a5, #7ed9d0);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 180, 165, 0.4);
        }
        
        .btn-secondary {
            background: #e5e7eb;
            color: #0a2540;
        }
        
        .btn-secondary:hover {
            background: #d1d5db;
        }
    </style>
</head>
<body>
    <div class="install-container">
        <div class="install-card">
            <!-- En-tête -->
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">
                    <span style="color: #0a2540;">Career</span><span style="color: #00b4a5;">Propulse</span>
                </h1>
                <p style="color: #6b7280; font-size: 1.1rem;">Assistant d'Installation v1.0</p>
            </div>

            <!-- Barre de progression -->
            <div class="progress">
                <div class="progress-item <?php echo $step > 1 ? 'complete' : ''; ?>"></div>
                <div class="progress-item <?php echo $step > 2 ? 'complete' : ''; ?>"></div>
                <div class="progress-item <?php echo $step > 3 ? 'complete' : ''; ?>"></div>
                <div class="progress-item <?php echo $step > 4 ? 'complete' : ''; ?>"></div>
                <div class="progress-item <?php echo $step > 5 ? 'complete' : ''; ?>"></div>
            </div>

            <!-- Messages -->
            <?php if (!empty($error)): ?>
                <div class="alert error">
                    <strong>✗ Erreur:</strong> <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($message)): ?>
                <div class="alert success">
                    <strong>✓ Succès:</strong> <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <!-- ÉTAPE 1 -->
            <?php if ($step == 1): ?>
                <div class="step-header">
                    <div class="step-number">1</div>
                    <h2>Vérification Prérequis</h2>
                </div>

                <p>Vérification de votre environnement...</p>
                <div style="margin: 1.5rem 0;">
                    <?php foreach ($checks as $name => $passed): ?>
                        <div class="check-item <?php echo $passed ? 'success' : 'error'; ?>">
                            <span class="check-icon"><?php echo $passed ? '✓' : '✗'; ?></span>
                            <span><?php echo $name; ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>

                <?php if ($allChecked && $dbConnected): ?>
                    <div class="alert success">
                        ✓ Tous les prérequis sont satisfaits! Vous pouvez continuer.
                    </div>
                    <form method="GET">
                        <input type="hidden" name="step" value="2">
                        <button type="submit" class="btn btn-primary">Étape Suivante →</button>
                    </form>
                <?php else: ?>
                    <div class="alert error">
                        ✗ Certains prérequis ne sont pas satisfaits. Veuillez corriger avant de continuer.
                    </div>
                <?php endif; ?>
            <?php endif; ?>

            <!-- ÉTAPE 2 -->
            <?php if ($step == 2): ?>
                <div class="step-header">
                    <div class="step-number">2</div>
                    <h2>Créer Schéma Base de Données</h2>
                </div>

                <p>Cette étape va créer les tables nécessaires dans MySQL.</p>
                <div style="margin: 1.5rem 0;">
                    <div class="check-item">
                        <span class="check-icon">📊</span>
                        <span>Tables: cv-employeur, employees, job_offers, applications</span>
                    </div>
                </div>

                <form method="POST">
                    <button type="submit" class="btn btn-primary">Créer Schéma →</button>
                </form>
            <?php endif; ?>

            <!-- ÉTAPE 3 -->
            <?php if ($step == 3): ?>
                <div class="step-header">
                    <div class="step-number">3</div>
                    <h2>Charger Données de Démo</h2>
                </div>

                <p>Créer des données d'exemple pour tester le système.</p>
                <div style="margin: 1.5rem 0;">
                    <div class="check-item">
                        <span class="check-icon">👥</span>
                        <span>3 Candidats de test</span>
                    </div>
                    <div class="check-item">
                        <span class="check-icon">🏢</span>
                        <span>1 Employeur de test</span>
                    </div>
                    <div class="check-item">
                        <span class="check-icon">📋</span>
                        <span>4 Offres d'emploi</span>
                    </div>
                </div>

                <form method="POST">
                    <button type="submit" class="btn btn-primary">Charger Données →</button>
                </form>
            <?php endif; ?>

            <!-- ÉTAPE 4 -->
            <?php if ($step == 4): ?>
                <div class="step-header">
                    <div class="step-number">4</div>
                    <h2>Finalisation & Identifiants</h2>
                </div>

                <p>Installation presque terminée! Voici vos identifiants de test:</p>

                <div class="credentials">
                    <div class="credential-item">
                        <div class="credential-label">👨💼 Candidat 1</div>
                        <div class="credential-value">
                            Email: <strong>ahmed.candidate@careerpropulse.com</strong><br>
                            Mot de passe: <strong>Motdepasse1!</strong>
                        </div>
                    </div>

                    <div class="credential-item">
                        <div class="credential-label">👩💼 Candidat 2</div>
                        <div class="credential-value">
                            Email: <strong>fatima.candidate@careerpropulse.com</strong><br>
                            Mot de passe: <strong>Motdepasse1!</strong>
                        </div>
                    </div>

                    <div class="credential-item">
                        <div class="credential-label">🧑💻 Candidat 3</div>
                        <div class="credential-value">
                            Email: <strong>karim.candidate@careerpropulse.com</strong><br>
                            Mot de passe: <strong>Motdepasse1!</strong>
                        </div>
                    </div>

                    <div class="credential-item">
                        <div class="credential-label">🏢 Employeur</div>
                        <div class="credential-value">
                            Email: <strong>employer1@careerpropulse.com</strong><br>
                            Mot de passe: <strong>Motdepasse1!</strong>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 1.5rem;">
                    <input type="checkbox" id="understood" onchange="document.getElementById('finalBtn').disabled = !this.checked">
                    <label for="understood">J'ai noté les identifiants et je comprends que je dois les changer en production</label>
                </div>

                <form method="POST" style="margin-top: 1.5rem;">
                    <button type="submit" id="finalBtn" disabled class="btn btn-primary">Finaliser Installation →</button>
                </form>
            <?php endif; ?>

            <!-- ÉTAPE 5 -->
            <?php if ($step == 5): ?>
                <div class="step-header">
                    <div class="step-number">✓</div>
                    <h2 style="color: #10b981;">Installation Complétée!</h2>
                </div>

                <div class="alert success">
                    <strong>✓ Installation réussie!</strong> CareerPropulse est maintenant prêt à l'emploi.
                </div>

                <h3 style="margin-top: 2rem;">Prochaines étapes:</h3>
                <ol style="padding-left: 1.5rem;">
                    <li style="margin-bottom: 0.5rem;">Vous pouvez maintenant accéder au site: <a href="index.html">Accueil</a></li>
                    <li style="margin-bottom: 0.5rem;">Connectez-vous avec les identifiants fournis ci-dessus</li>
                    <li style="margin-bottom: 0.5rem;">Testez le système: voir offres, postuler, etc.</li>
                    <li style="margin-bottom: 0.5rem;"><strong>Important:</strong> Supprimer ce fichier install.php en production!</li>
                </ol>

                <div class="alert" style="background: #fef3c7; border-left-color: #f59e0b; color: #92400e; margin-top: 1.5rem;">
                    <strong>⚠ Sécurité:</strong> Changez les mots de passe par défaut avant de mettre en production!
                </div>

                <div class="next-step" style="margin-top: 2rem;">
                    <a href="index.html" class="btn btn-primary">Aller à l'Accueil</a>
                    <a href="connexion.html" class="btn btn-secondary">Se Connecter</a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
