<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

include 'config.php'; // Contient la connexion PDO $pdo

// ==================== FONCTIONS UTILITAIRES ====================
function respond($statusCode, $payload) {
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}

function requireAuth() {
    if (!isset($_SESSION['user_id'], $_SESSION['role'])) {
        respond(401, ['success' => false, 'message' => 'Non authentifié']);
    }
}

function requireRole($role) {
    requireAuth();
    if ($_SESSION['role'] !== $role) {
        respond(403, ['success' => false, 'message' => 'Accès interdit']);
    }
}

// Insertion / mise à jour des données multi‑valeurs (expériences, formations, langues, compétences)
function syncEmployeeData($pdo, $employeId, $type, $items) {
    // Supprimer les anciennes entrées
    $deleteStmt = $pdo->prepare("DELETE FROM $type WHERE employe_id = ?");
    $deleteStmt->execute([$employeId]);
    
    // Réinsérer les nouvelles
    if (empty($items)) return;
    
    switch ($type) {
        case 'experiences':
            $stmt = $pdo->prepare("INSERT INTO experiences (employe_id, poste, entreprise, annee_debut, annee_fin) VALUES (?, ?, ?, ?, ?)");
            foreach ($items as $exp) {
                $stmt->execute([$employeId, $exp['poste'], $exp['entreprise'], $exp['annee_debut'], $exp['annee_fin']]);
            }
            break;
        case 'formations':
            $stmt = $pdo->prepare("INSERT INTO formations (employe_id, diplome, etablissement, annee_obtention) VALUES (?, ?, ?, ?)");
            foreach ($items as $f) {
                $stmt->execute([$employeId, $f['diplome'], $f['etablissement'], $f['annee_obtention'] ?? null]);
            }
            break;
        case 'langues':
            $stmt = $pdo->prepare("INSERT INTO langues (employe_id, langue, niveau) VALUES (?, ?, ?)");
            foreach ($items as $l) {
                $stmt->execute([$employeId, $l['langue'], $l['niveau']]);
            }
            break;
        case 'competences':
            $stmt = $pdo->prepare("INSERT INTO competences (employe_id, nom, niveau) VALUES (?, ?, ?)");
            foreach ($items as $c) {
                $stmt->execute([$employeId, $c['nom'], $c['niveau'] ?? null]);
            }
            break;
    }
}

// Récupérer toutes les données d'un employé
function getEmployeeFullData($pdo, $employeId) {
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = ?");
    $stmt->execute([$employeId]);
    $emp = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$emp) return null;
    
    $expStmt = $pdo->prepare("SELECT * FROM experiences WHERE employe_id = ?");
    $expStmt->execute([$employeId]);
    $emp['experiences'] = $expStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formStmt = $pdo->prepare("SELECT * FROM formations WHERE employe_id = ?");
    $formStmt->execute([$employeId]);
    $emp['formations'] = $formStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $langStmt = $pdo->prepare("SELECT * FROM langues WHERE employe_id = ?");
    $langStmt->execute([$employeId]);
    $emp['langues'] = $langStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $compStmt = $pdo->prepare("SELECT * FROM competences WHERE employe_id = ?");
    $compStmt->execute([$employeId]);
    $emp['competences'] = $compStmt->fetchAll(PDO::FETCH_ASSOC);
    
    return $emp;
}

// ==================== ENDPOINTS ====================
$action = $_GET['action'] ?? '';

// ---------- INSCRIPTION ----------
if ($action === 'register') {
    $data = getJsonInput();
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'employe';
    
    if (!$email || !$password) {
        respond(400, ['success' => false, 'message' => 'Email et mot de passe requis']);
    }
    
    try {
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        
        if ($role === 'employeur') {
            // Inscription employeur
            $stmt = $pdo->prepare("INSERT INTO employeurs (email, password, nom_company, nom_representant, poste, secteur, taille, localisation, profile_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $email,
                $hashed,
                trim($data['nom_company'] ?? ''),
                trim($data['nom_representant'] ?? ''),
                trim($data['poste'] ?? ''),
                trim($data['secteur'] ?? ''),
                trim($data['taille'] ?? ''),
                trim($data['localisation'] ?? ''),
                trim($data['profile_summary'] ?? '')
            ]);
        } else {
            // Inscription employé
            $stmt = $pdo->prepare("INSERT INTO employees (email, password, prenom, nom, telephone, titre, cv_summary) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $email,
                $hashed,
                trim($data['prenom'] ?? ''),
                trim($data['nom'] ?? ''),
                trim($data['telephone'] ?? ''),
                trim($data['titre'] ?? ''),
                trim($data['cv_summary'] ?? '')
            ]);
            $employeId = $pdo->lastInsertId();
            
            // Insérer les données multi‑valeurs
            if (!empty($data['experiences'])) syncEmployeeData($pdo, $employeId, 'experiences', $data['experiences']);
            if (!empty($data['formations'])) syncEmployeeData($pdo, $employeId, 'formations', $data['formations']);
            if (!empty($data['langues'])) syncEmployeeData($pdo, $employeId, 'langues', $data['langues']);
            if (!empty($data['competences'])) syncEmployeeData($pdo, $employeId, 'competences', $data['competences']);
        }
        
        respond(200, ['success' => true, 'message' => 'Inscription réussie']);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            respond(200, ['success' => false, 'message' => 'Cet email existe déjà']);
        } else {
            respond(500, ['success' => false, 'message' => 'Erreur base de données', 'error' => $e->getMessage()]);
        }
    }
}

// ---------- CONNEXION ----------
if ($action === 'login') {
    $data = getJsonInput();
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'employe';
    
    if (!$email || !$password) {
        respond(400, ['success' => false, 'message' => 'Email et mot de passe requis']);
    }
    
    if ($role === 'employeur') {
        $stmt = $pdo->prepare("SELECT * FROM employeurs WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = 'employeur';
            respond(200, ['success' => true, 'message' => 'Connexion réussie', 'role' => 'employeur']);
        }
    } else {
        $stmt = $pdo->prepare("SELECT * FROM employees WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = 'employe';
            respond(200, ['success' => true, 'message' => 'Connexion réussie', 'role' => 'employe']);
        }
    }
    respond(200, ['success' => false, 'message' => 'Email ou mot de passe incorrect']);
}

// ---------- DÉCONNEXION ----------
if ($action === 'logout') {
    session_destroy();
    respond(200, ['success' => true, 'message' => 'Déconnexion réussie']);
}

// ---------- VÉRIFICATION SESSION ----------
if ($action === 'check_session') {
    if (!isset($_SESSION['user_id'], $_SESSION['role'])) {
        respond(200, ['authenticated' => false]);
    }
    $userName = '';
    if ($_SESSION['role'] === 'employe') {
        $stmt = $pdo->prepare("SELECT CONCAT(prenom, ' ', nom) as name FROM employees WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $userName = $stmt->fetchColumn() ?: '';
    } else {
        $stmt = $pdo->prepare("SELECT nom_company FROM employeurs WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $userName = $stmt->fetchColumn() ?: '';
    }
    respond(200, [
        'authenticated' => true,
        'role' => $_SESSION['role'],
        'user_name' => $userName,
        'email' => $_SESSION['email']
    ]);
}

// ---------- RÉCUPÉRER LE PROFIL (employé ou employeur) ----------
if ($action === 'get_profile') {
    requireAuth();
    if ($_SESSION['role'] === 'employe') {
        $profile = getEmployeeFullData($pdo, $_SESSION['user_id']);
        if (!$profile) respond(404, ['success' => false, 'message' => 'Profil introuvable']);
        respond(200, ['success' => true, 'profile' => $profile]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM employeurs WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $profile = $stmt->fetch();
        if (!$profile) respond(404, ['success' => false, 'message' => 'Profil introuvable']);
        // Ajouter les offres de l'employeur
        $offersStmt = $pdo->prepare("SELECT * FROM job_offers WHERE employer_id = ? ORDER BY created_at DESC");
        $offersStmt->execute([$_SESSION['user_id']]);
        $profile['offers'] = $offersStmt->fetchAll();
        respond(200, ['success' => true, 'profile' => $profile]);
    }
}

// ---------- METTRE À JOUR LE PROFIL (employé) ----------
if ($action === 'update_profile') {
    requireRole('employe');
    $data = getJsonInput();
    
    try {
        $stmt = $pdo->prepare("UPDATE employees SET prenom = ?, nom = ?, telephone = ?, titre = ?, cv_summary = ? WHERE id = ?");
        $stmt->execute([
            trim($data['prenom'] ?? ''),
            trim($data['nom'] ?? ''),
            trim($data['telephone'] ?? ''),
            trim($data['titre'] ?? ''),
            trim($data['cv_summary'] ?? ''),
            $_SESSION['user_id']
        ]);
        // Mettre à jour les tables filles
        if (isset($data['experiences'])) syncEmployeeData($pdo, $_SESSION['user_id'], 'experiences', $data['experiences']);
        if (isset($data['formations'])) syncEmployeeData($pdo, $_SESSION['user_id'], 'formations', $data['formations']);
        if (isset($data['langues'])) syncEmployeeData($pdo, $_SESSION['user_id'], 'langues', $data['langues']);
        if (isset($data['competences'])) syncEmployeeData($pdo, $_SESSION['user_id'], 'competences', $data['competences']);
        
        respond(200, ['success' => true, 'message' => 'Profil mis à jour']);
    } catch (PDOException $e) {
        respond(500, ['success' => false, 'message' => 'Erreur mise à jour', 'error' => $e->getMessage()]);
    }
}

// ---------- RÉCUPÉRER TOUTES LES OFFRES (pour employé) ----------
if ($action === 'get_offers') {
    requireRole('employe');
    $stmt = $pdo->query("
        SELECT o.*, e.nom_company 
        FROM job_offers o 
        JOIN employeurs e ON o.employer_id = e.id 
        ORDER BY o.created_at DESC
    ");
    $offers = $stmt->fetchAll();
    respond(200, ['success' => true, 'offers' => $offers]);
}

// ---------- POSTULER À UNE OFFRE ----------
if ($action === 'apply_offer') {
    requireRole('employe');
    $data = getJsonInput();
    $offerId = (int)($data['offer_id'] ?? 0);
    if (!$offerId) respond(400, ['success' => false, 'message' => 'ID offre manquant']);
    
    try {
        // Vérifier que l'offre existe
        $stmt = $pdo->prepare("SELECT id FROM job_offers WHERE id = ?");
        $stmt->execute([$offerId]);
        if (!$stmt->fetch()) respond(404, ['success' => false, 'message' => 'Offre introuvable']);
        
        // Vérifier doublon
        $stmt = $pdo->prepare("SELECT id FROM candidatures WHERE offre_id = ? AND employe_id = ?");
        $stmt->execute([$offerId, $_SESSION['user_id']]);
        if ($stmt->fetch()) respond(400, ['success' => false, 'message' => 'Vous avez déjà postulé']);
        
        $stmt = $pdo->prepare("INSERT INTO candidatures (offre_id, employe_id, statut) VALUES (?, ?, 'en_attente')");
        $stmt->execute([$offerId, $_SESSION['user_id']]);
        respond(200, ['success' => true, 'message' => 'Candidature envoyée']);
    } catch (PDOException $e) {
        respond(500, ['success' => false, 'message' => 'Erreur lors de la candidature']);
    }
}

// ---------- OFFRES DÉJÀ POSTULÉES (IDs) ----------
if ($action === 'get_applied_offers') {
    requireRole('employe');
    $stmt = $pdo->prepare("SELECT offre_id FROM candidatures WHERE employe_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    respond(200, ['success' => true, 'applied_offers' => $ids]);
}

// ---------- MES CANDIDATURES (employé) ----------
if ($action === 'get_my_applications') {
    requireRole('employe');
    $stmt = $pdo->prepare("
        SELECT c.*, o.title AS offer_title, e.nom_company 
        FROM candidatures c
        JOIN job_offers o ON c.offre_id = o.id
        JOIN employeurs e ON o.employer_id = e.id
        WHERE c.employe_id = ?
        ORDER BY c.date_candidature DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $apps = $stmt->fetchAll();
    respond(200, ['success' => true, 'applications' => $apps]);
}

// ---------- PUBLIER UNE OFFRE (employeur) ----------
if ($action === 'add_offer') {
    requireRole('employeur');
    $data = getJsonInput();
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $location = trim($data['location'] ?? '');
    $contract = trim($data['contract_type'] ?? 'CDI');
    
    if (!$title) respond(400, ['success' => false, 'message' => 'Titre requis']);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO job_offers (employer_id, title, description, location, contract_type) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$_SESSION['user_id'], $title, $description, $location, $contract]);
        $offerId = $pdo->lastInsertId();
        
        // Compétences requises
        if (!empty($data['required_skills'])) {
            $skillStmt = $pdo->prepare("INSERT INTO offre_competences (offre_id, competence_nom) VALUES (?, ?)");
            foreach ($data['required_skills'] as $skill) {
                $skillStmt->execute([$offerId, $skill]);
            }
        }
        // Langues requises
        if (!empty($data['required_languages'])) {
            $langStmt = $pdo->prepare("INSERT INTO offre_langues (offre_id, langue, niveau_requis) VALUES (?, ?, ?)");
            foreach ($data['required_languages'] as $lang) {
                $langStmt->execute([$offerId, $lang['langue'], $lang['niveau'] ?? null]);
            }
        }
        respond(200, ['success' => true, 'message' => 'Offre publiée']);
    } catch (PDOException $e) {
        respond(500, ['success' => false, 'message' => 'Erreur publication']);
    }
}

// ---------- OFFRES DE L'EMPLOYEUR (sans candidatures détaillées) ----------
if ($action === 'get_employer_offers') {
    requireRole('employeur');
    $stmt = $pdo->prepare("
        SELECT o.*, 
               (SELECT COUNT(*) FROM candidatures WHERE offre_id = o.id) as candidatures_count
        FROM job_offers o
        WHERE o.employer_id = ?
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $offers = $stmt->fetchAll();
    respond(200, ['success' => true, 'offers' => $offers]);
}

// ---------- OFFRES AVEC CANDIDATURES DÉTAILLÉES (pour employeur) ----------
if ($action === 'get_employer_offers_with_applications') {
    requireRole('employeur');
    $offersStmt = $pdo->prepare("SELECT * FROM job_offers WHERE employer_id = ? ORDER BY created_at DESC");
    $offersStmt->execute([$_SESSION['user_id']]);
    $offers = $offersStmt->fetchAll();
    
    foreach ($offers as &$offer) {
        $candStmt = $pdo->prepare("
            SELECT c.*, e.id as employe_id, e.prenom, e.nom, e.email, e.telephone, e.titre
            FROM candidatures c
            JOIN employees e ON c.employe_id = e.id
            WHERE c.offre_id = ?
            ORDER BY c.date_candidature DESC
        ");
        $candStmt->execute([$offer['id']]);
        $offer['candidatures'] = $candStmt->fetchAll();
    }
    respond(200, ['success' => true, 'offers' => $offers]);
}

// ---------- MODIFIER STATUT D'UNE CANDIDATURE ----------
if ($action === 'update_application_status') {
    requireRole('employeur');
    $data = getJsonInput();
    $candidatureId = (int)($data['candidature_id'] ?? 0);
    $newStatus = $data['status'] ?? '';
    if (!in_array($newStatus, ['acceptee', 'refusee'])) {
        respond(400, ['success' => false, 'message' => 'Statut invalide']);
    }
    try {
        $stmt = $pdo->prepare("UPDATE candidatures SET statut = ? WHERE id = ?");
        $stmt->execute([$newStatus, $candidatureId]);
        respond(200, ['success' => true, 'message' => 'Statut mis à jour']);
    } catch (PDOException $e) {
        respond(500, ['success' => false, 'message' => 'Erreur mise à jour']);
    }
}

// ---------- RÉCUPÉRER CV D'UN CANDIDAT (pour employeur) ----------
if ($action === 'get_candidate_cv') {
    requireRole('employeur');
    $employeId = (int)($_GET['employee_id'] ?? 0);
    if (!$employeId) respond(400, ['success' => false, 'message' => 'ID candidat requis']);
    
    $cv = getEmployeeFullData($pdo, $employeId);
    if (!$cv) respond(404, ['success' => false, 'message' => 'Candidat introuvable']);
    // Ne pas envoyer l'email ni le mot de passe
    unset($cv['email'], $cv['password']);
    respond(200, ['success' => true, 'cv' => $cv]);
}

// ---------- ACTION NON RECONNUE ----------
respond(404, ['success' => false, 'message' => 'Action non reconnue']);